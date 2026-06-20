// Netlify Function: add-category
// Creates a brand-new top-level product category:
//   1. Creates a new data file (e.g. jackets.js) with an empty products array.
//   2. Appends an entry for it into CATEGORY_MAP inside _shared.js.
//
// NOTE: this does NOT add the category to the storefront's nav/menu —
// that's a manual step in index.html / app.js, by design (kept separate
// so this function can't accidentally break the live storefront layout).

function slugify(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const body = JSON.parse(event.body || '{}');
    if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Wrong password' }) };
    }

    const label = (body.label || '').trim();
    if (!label) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing category label' }) };

    const categoryKey = slugify(body.categoryKey || label);
    if (!categoryKey) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Could not derive a valid category key' }) };

    const codePrefix = (body.codePrefix || categoryKey.slice(0, 2)).toUpperCase().slice(0, 3);
    const fileName = `${categoryKey}.js`;
    const arrayVar = `${categoryKey.replace(/-/g, '_').toUpperCase()}_PRODUCTS`;

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server is missing GitHub env vars' }) };
    }
    const ghHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'admin-dashboard',
      Accept: 'application/vnd.github+json',
    };
    const dir = process.env.PRODUCTS_PATH ? `${process.env.PRODUCTS_PATH}/` : '';

    // ── Step 1: read _shared.js ──
    const sharedPath = `${dir}_shared.js`;
    const sharedApiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${sharedPath}`;
    const sharedRes = await fetch(`${sharedApiBase}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders });
    if (!sharedRes.ok) return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not read _shared.js: ${await sharedRes.text()}` }) };
    const sharedData = await sharedRes.json();
    const sharedSha = sharedData.sha;
    const sharedContent = Buffer.from(sharedData.content, 'base64').toString('utf-8');

    if (sharedContent.includes(`'${categoryKey}':`)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `Category '${categoryKey}' already exists` }) };
    }

    // Compute a free id range: find the highest `max:` used so far, start the new one 10000 above it (gives huge headroom, never collides)
    const maxValues = Array.from(sharedContent.matchAll(/max:\s*(\d+)/g)).map(m => parseInt(m[1], 10));
    const highestMax = maxValues.length ? Math.max(...maxValues) : 1000;
    const newMin = Math.ceil((highestMax + 1000) / 1000) * 1000 + 1;
    const newMax = newMin + 998;

    const mapStartRe = /const\s+CATEGORY_MAP\s*=\s*\{/;
    const mapStart = sharedContent.match(mapStartRe);
    if (!mapStart) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not find CATEGORY_MAP' }) };
    const insertAt = mapStart.index + mapStart[0].length;
    const newEntry = `\n  '${categoryKey}': { file: '${fileName}', arrayVar: '${arrayVar}', min: ${newMin}, max: ${newMax}, codePrefix: '${codePrefix}' },`;
    const updatedSharedContent = sharedContent.slice(0, insertAt) + newEntry + sharedContent.slice(insertAt);

    // ── Step 2: create the new data file ──
    const newFileApiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${dir}${fileName}`;
    const newFileContent = `// ── ${label.toUpperCase()} (${newMin}–${newMax}) ─────────────────────────────────\nconst ${arrayVar} = [\n];\n`;

    // Check the file doesn't already exist (avoid clobbering)
    const existsRes = await fetch(`${newFileApiBase}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders });
    if (existsRes.ok) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `File ${fileName} already exists in the repo` }) };
    }

    const createRes = await fetch(newFileApiBase, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Create category file ${fileName} via admin dashboard`,
        content: Buffer.from(newFileContent, 'utf-8').toString('base64'),
        branch: GITHUB_BRANCH,
      }),
    });
    if (!createRes.ok) return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not create ${fileName}: ${await createRes.text()}` }) };

    // ── Step 3: commit updated _shared.js ──
    const putSharedRes = await fetch(sharedApiBase, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Register category '${categoryKey}' in CATEGORY_MAP via admin dashboard`,
        content: Buffer.from(updatedSharedContent, 'utf-8').toString('base64'),
        sha: sharedSha,
        branch: GITHUB_BRANCH,
      }),
    });
    if (!putSharedRes.ok) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: `Created ${fileName} but failed to register it in _shared.js: ${await putSharedRes.text()}. You may need to add it manually.` }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        categoryKey,
        fileName,
        arrayVar,
        idRange: `${newMin}-${newMax}`,
        message: `Category '${label}' created (key: ${categoryKey}). You can now add products to it from the Add tab. Remember to add a nav entry for it on the storefront.`,
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
      
