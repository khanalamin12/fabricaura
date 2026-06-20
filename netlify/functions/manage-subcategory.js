// Netlify Function: manage-subcategory
// Adds or removes an entry inside the SUBCATEGORIES object in products.js.
// action: 'add' | 'remove'

function jsString(v) {
  return "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

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

    const category = body.category; // e.g. 'pants', 'shirt', 'watch', or a custom one
    if (!category) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing category' }) };

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
    const FILE_PATH = process.env.PRODUCTS_PATH ? `${process.env.PRODUCTS_PATH}/products.js` : 'products.js';
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server is missing GitHub env vars' }) };
    }
    const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const ghHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'admin-dashboard',
      Accept: 'application/vnd.github+json',
    };

    const getRes = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders });
    if (!getRes.ok) return { statusCode: 500, headers, body: JSON.stringify({ error: await getRes.text() }) };
    const getData = await getRes.json();
    const sha = getData.sha;
    let content = Buffer.from(getData.content, 'base64').toString('utf-8');

    const subcatStartRe = /const\s+SUBCATEGORIES\s*=\s*\{/;
    const startMatch = content.match(subcatStartRe);
    if (!startMatch) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not find SUBCATEGORIES object' }) };
    const objStartIdx = startMatch.index + startMatch[0].length;
    const objCloseIdx = content.indexOf('\n};', objStartIdx);
    if (objCloseIdx === -1) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not find end of SUBCATEGORIES' }) };
    const objBody = content.slice(objStartIdx, objCloseIdx);

    // ── ACTION: list (read-only, no commit) ──
    if (body.action === 'list') {
      const catArrRe = new RegExp(`${category}:\\s*\\[([\\s\\S]*?)\\n\\s*\\],?`);
      const catMatch = objBody.match(catArrRe);
      const items = [];
      if (catMatch) {
        const itemRe = /\{[^{}]*\}/gs;
        const found = catMatch[1].match(itemRe) || [];
        found.forEach((it) => {
          const id = (it.match(/id:\s*'([^']*)'/) || [])[1];
          const label = (it.match(/label:\s*'([^']*)'/) || [])[1];
          const icon = (it.match(/icon:\s*'([^']*)'/) || [])[1];
          if (id) items.push({ id, label, icon });
        });
      }
      return { statusCode: 200, headers, body: JSON.stringify({ subcategories: items }) };
    }

    let newObjBody;
    let message;

    if (body.action === 'remove') {
      const subId = body.subId;
      if (!subId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing subId' }) };
      // Find the category's array: `category: [ ... ],`
      const catArrRe = new RegExp(`(${category}:\\s*\\[)([\\s\\S]*?)(\\n\\s*\\],?)`);
      const catMatch = objBody.match(catArrRe);
      if (!catMatch) return { statusCode: 404, headers, body: JSON.stringify({ error: `Category '${category}' has no subcategory list` }) };
      const itemsText = catMatch[2];
      const itemRe = /\{[^{}]*\}/gs;
      const items = itemsText.match(itemRe) || [];
      const keptItems = items.filter(it => !new RegExp(`id:\\s*'${subId}'`).test(it));
      if (keptItems.length === items.length) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: `Subcategory '${subId}' not found` }) };
      }
      const newItemsText = keptItems.length ? '\n    ' + keptItems.join(',\n    ') + ',\n  ' : '\n\n  ';
      newObjBody = objBody.replace(catArrRe, `$1${newItemsText}$3`);
      message = `Remove subcategory ${subId} from ${category} via admin dashboard`;
    } else {
      // action: 'add'
      const label = body.label;
      const icon = body.icon || 'fa-shirt';
      if (!label) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing label' }) };
      const subId = slugify(body.subId || label);

      const catArrRe = new RegExp(`(${category}:\\s*\\[)([\\s\\S]*?)(\\n\\s*\\],?)`);
      const catMatch = objBody.match(catArrRe);
      const newItem = `\n    { id: ${jsString(subId)}, label: ${jsString(label)}, icon: ${jsString(icon)} },`;

      if (catMatch) {
        // Category already has a subcategory list — append to it
        const existingIds = Array.from(catMatch[2].matchAll(/id:\s*'([^']+)'/g)).map(m => m[1]);
        if (existingIds.includes(subId)) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: `Subcategory '${subId}' already exists` }) };
        }
        const trimmedItems = catMatch[2].replace(/\s*$/, '');
        newObjBody = objBody.replace(catArrRe, `$1${trimmedItems}${newItem}\n  $3`);
      } else {
        // Category has no subcategory list yet — add a new key
        newObjBody = objBody.replace(/\s*$/, '') + `\n  ${category}: [${newItem}\n  ],`;
      }
      message = `Add subcategory ${subId} to ${category} via admin dashboard`;
    }

    const updatedContent = content.slice(0, objStartIdx) + newObjBody + content.slice(objCloseIdx);
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({ message, content: Buffer.from(updatedContent, 'utf-8').toString('base64'), sha, branch: GITHUB_BRANCH }),
    });
    if (!putRes.ok) return { statusCode: 500, headers, body: JSON.stringify({ error: await putRes.text() }) };

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Subcategories updated. Site will redeploy in ~1 min.' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
