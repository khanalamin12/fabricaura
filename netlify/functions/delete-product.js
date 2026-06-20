const { CATEGORY_MAP } = require('./_shared');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const body = JSON.parse(event.body || '{}');
    if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Wrong password' }) };
    }
    const cfg = CATEGORY_MAP[body.category];
    if (!cfg) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown category' }) };
    const targetId = String(body.id);
    if (!targetId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing product id' }) };

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
    const FILE_PATH = process.env.PRODUCTS_PATH ? `${process.env.PRODUCTS_PATH}/${cfg.file}` : cfg.file;
    const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const ghHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'admin-dashboard',
      Accept: 'application/vnd.github+json',
    };

    const getRes = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders });
    if (!getRes.ok) {
      const t = await getRes.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not read ${cfg.file}: ${t}` }) };
    }
    const getData = await getRes.json();
    const sha = getData.sha;
    const content = Buffer.from(getData.content, 'base64').toString('utf-8');

    const arrayStartRe = new RegExp(`const\\s+${cfg.arrayVar}\\s*=\\s*\\[`);
    const startMatch = content.match(arrayStartRe);
    if (!startMatch) return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not find ${cfg.arrayVar}` }) };
    const arrayStartIdx = startMatch.index + startMatch[0].length;
    const closeIdx = content.indexOf('\n];', arrayStartIdx);
    const arrayBody = content.slice(arrayStartIdx, closeIdx);

    // find each top-level object chunk (with trailing comma/whitespace) and its id
    const objRe = /\s*\{[^{}]*\}\s*,?/gs;
    const chunks = arrayBody.match(objRe) || [];
    let found = false;
    const nowIso = new Date().toISOString();

    const updatedChunks = chunks.map((chunk) => {
      const idMatch = chunk.match(/id:\s*(\d+)/);
      if (!idMatch || idMatch[1] !== targetId) return chunk;
      found = true;

      // Soft delete: tag with deletedAt instead of removing, so it can be
      // restored from the admin Trash panel within the recovery window.
      let newChunk = chunk.replace(/\n\s*deletedAt:\s*'[^']*',?/, ''); // strip any stale tag
      newChunk = newChunk.replace(/\{\s*\n/, (m) => m + `    deletedAt: '${nowIso}',\n`);
      return newChunk;
    });

    if (!found) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: `Product id ${targetId} not found in ${cfg.file}` }) };
    }

    const newArrayBody = updatedChunks.join('');
    const updatedContent = content.slice(0, arrayStartIdx) + newArrayBody + content.slice(closeIdx);

    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Move product id ${targetId} to trash via admin dashboard`,
        content: Buffer.from(updatedContent, 'utf-8').toString('base64'),
        sha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!putRes.ok) {
      const t = await putRes.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: `GitHub commit failed: ${t}` }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Moved product ${targetId} to Trash. Recoverable for 7 days. Site will redeploy in ~1 min.` }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
        
