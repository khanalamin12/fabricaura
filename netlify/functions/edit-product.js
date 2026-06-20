// Netlify Function: edit-product
// Finds an existing product by id in the correct JS file,
// replaces it in-place, and commits the change to GitHub.

const { CATEGORY_MAP } = require('./_shared');

function extractDriveId(link) {
  link = link.trim();
  if (!link) return null;
  if (/^[a-zA-Z0-9_-]{20,}$/.test(link) && !link.includes('/')) return link;
  let m = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = link.match(/id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  return null;
}

function jsString(v) {
  return "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // --- password check ---
    if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Wrong password' }) };
    }

    const cfg = CATEGORY_MAP[body.category];
    if (!cfg) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown category' }) };
    }

    const targetId = String(body.id);
    if (!targetId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing product id' }) };
    }

    if (!body.name || !body.price) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name and price are required' }) };
    }

    const driveIds = (body.driveLinks || [])
      .map(extractDriveId)
      .filter(Boolean);

    if (driveIds.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No valid Google Drive links/IDs found' }) };
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
    const FILE_PATH = process.env.PRODUCTS_PATH
      ? `${process.env.PRODUCTS_PATH}/${cfg.file}`
      : cfg.file;

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server is missing GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO env vars' }) };
    }

    const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const ghHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'admin-dashboard',
      Accept: 'application/vnd.github+json',
    };

    // 1. Get current file content
    const getRes = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders });
    if (!getRes.ok) {
      const t = await getRes.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not read ${cfg.file} from GitHub: ${t}` }) };
    }
    const getData = await getRes.json();
    const sha = getData.sha;
    const content = Buffer.from(getData.content, 'base64').toString('utf-8');

    // 2. Find the array boundaries
    const arrayStartRe = new RegExp(`const\\s+${cfg.arrayVar}\\s*=\\s*\\[`);
    const startMatch = content.match(arrayStartRe);
    if (!startMatch) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not find ${cfg.arrayVar} in ${cfg.file}` }) };
    }
    const arrayStartIdx = startMatch.index + startMatch[0].length;
    const closeIdx = content.indexOf('\n];', arrayStartIdx);
    if (closeIdx === -1) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not find end of ${cfg.arrayVar} in ${cfg.file}` }) };
    }

    const arrayBody = content.slice(arrayStartIdx, closeIdx);

    // 3. Find the existing product's code so we keep it unchanged
    const objRe = /\s*\{[^{}]*\}\s*,?/gs;
    const chunks = arrayBody.match(objRe) || [];
    let found = false;
    let existingCode = null;

    const updatedChunks = chunks.map((chunk) => {
      const idMatch = chunk.match(/id:\s*(\d+)/);
      if (idMatch && idMatch[1] === targetId) {
        found = true;
        const codeMatch = chunk.match(/code:\s*'([^']*)'/);
        existingCode = codeMatch ? codeMatch[1] : null;

        // Build replacement object
        const lines = [];
        lines.push('  {');
        lines.push(`    id: ${targetId},`);
        if (existingCode) lines.push(`    code: ${jsString(existingCode)},`);
        lines.push(`    name: ${jsString(body.name)},`);
        lines.push(`    fabric: ${jsString(body.fabric || '')},`);
        lines.push(`    price: ${Number(body.price)}, old: ${body.old ? Number(body.old) : 'null'},`);
        lines.push(`    section: ${jsString(body.category)},`);
        if (body.subcategory) lines.push(`    subcategory: ${jsString(body.subcategory)},`);
        lines.push(`    badge: ${body.badge ? jsString(body.badge) : 'null'}, stars: ${body.stars ? Number(body.stars) : 5},`);
        lines.push(`    icon: ${jsString(body.icon || 'fa-shirt')}, label: ${jsString(body.label || '')},`);
        lines.push('    photos: [');
        driveIds.forEach((id) => lines.push(`      ${jsString(id)},`));
        lines.push('    ],');
        if (body.noColour) lines.push('    noColour: true,');
        lines.push(`    desc: ${jsString(body.desc || '')}`);
        lines.push('  },');
        return '\n' + lines.join('\n') + '\n';
      }
      return chunk;
    });

    if (!found) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: `Product id ${targetId} not found in ${cfg.file}` }) };
    }

    const newArrayBody = updatedChunks.join('');
    const updatedContent =
      content.slice(0, arrayStartIdx) + newArrayBody + content.slice(closeIdx);

    // 4. Commit back to GitHub
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Edit product id ${targetId} (${body.name}) via admin dashboard`,
        content: Buffer.from(updatedContent, 'utf-8').toString('base64'),
        sha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!putRes.ok) {
      const t = await putRes.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: `GitHub commit failed: ${t}` }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        id: targetId,
        message: `Updated "${body.name}" successfully. Site will redeploy in ~1 min.`,
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
