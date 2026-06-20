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
    const content = Buffer.from(getData.content, 'base64').toString('utf-8');

    const arrayStartRe = new RegExp(`const\\s+${cfg.arrayVar}\\s*=\\s*\\[`);
    const startMatch = content.match(arrayStartRe);
    if (!startMatch) return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not find ${cfg.arrayVar}` }) };
    const arrayStartIdx = startMatch.index + startMatch[0].length;
    const closeIdx = content.indexOf('\n];', arrayStartIdx);
    const arrayBody = content.slice(arrayStartIdx, closeIdx);

    // Parse each product object fully
    const objRe = /\{[^{}]*\}/gs;
    const matches = arrayBody.match(objRe) || [];
    const products = matches.map((chunk) => {
      const get = (re) => (chunk.match(re) || [])[1];

      const id        = get(/id:\s*(\d+)/);
      const code      = get(/code:\s*'([^']*)'/);
      const name      = get(/name:\s*'([^']*)'/);
      const fabric    = get(/fabric:\s*'([^']*)'/);
      const price     = get(/price:\s*(\d+)/);
      const old       = get(/old:\s*(\d+)/);
      const badge     = get(/badge:\s*'([^']*)'/);
      const stars     = get(/stars:\s*(\d+)/);
      const desc      = get(/desc:\s*'([^']*)'/);
      const subcategory = get(/subcategory:\s*'([^']*)'/);
      const noColour  = /noColour:\s*true/.test(chunk);

      // Extract photos array — grab all quoted strings inside photos: [ ... ]
      const photosMatch = chunk.match(/photos:\s*\[([\s\S]*?)\]/);
      let photoIds = [];
      let driveLinks = [];
      if (photosMatch) {
        photoIds = Array.from(photosMatch[1].matchAll(/'([^']+)'/g)).map(m => m[1]);
        driveLinks = photoIds.map(id => `https://drive.google.com/file/d/${id}/view`);
      }

      return { id, code, name, fabric, price, old, badge, stars, desc, subcategory, noColour, photoIds, driveLinks };
    }).filter(p => p.id);

    return { statusCode: 200, headers, body: JSON.stringify({ products }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

    
