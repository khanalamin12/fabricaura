

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

    const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER  = process.env.GITHUB_OWNER;
    const GITHUB_REPO   = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server is missing GitHub env vars' }) };
    }
    const ghHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'admin-dashboard',
      Accept: 'application/vnd.github+json',
    };

    // Product files may be in a subfolder; _shared.js is always in netlify/functions/
    const productDir  = process.env.PRODUCTS_PATH ? `${process.env.PRODUCTS_PATH}/` : '';
    const sharedPath  = 'netlify/functions/_shared.js';
    const sharedApiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${sharedPath}`;

    // ── READ _shared.js ──
    const sharedRes = await fetch(`${sharedApiUrl}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders });
    if (!sharedRes.ok) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not read _shared.js: ${await sharedRes.text()}` }) };
    }
    const sharedData    = await sharedRes.json();
    const sharedSha     = sharedData.sha;
    const sharedContent = Buffer.from(sharedData.content, 'base64').toString('utf-8');

    // ── DELETE CATEGORY ──
    if (body.action === 'delete') {
      const categoryKey = (body.categoryKey || '').trim();
      if (!categoryKey) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing categoryKey' }) };

      // Remove entry from CATEGORY_MAP — find and remove the line that starts with the key
      const lineRe = new RegExp(`\\n\\s*'${categoryKey}'\\s*:\\s*\\{[^}]*\\},?`, 'g');
      if (!lineRe.test(sharedContent)) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: `Category '${categoryKey}' not found in _shared.js` }) };
      }
      const updatedShared = sharedContent.replace(
        new RegExp(`\\n\\s*'${categoryKey}'\\s*:\\s*\\{[^}]*\\},?`, 'g'), ''
      );

      // Commit updated _shared.js
      const putRes = await fetch(sharedApiUrl, {
        method: 'PUT', headers: ghHeaders,
        body: JSON.stringify({
          message: `Remove category '${categoryKey}' from CATEGORY_MAP via admin dashboard`,
          content: Buffer.from(updatedShared, 'utf-8').toString('base64'),
          sha: sharedSha, branch: GITHUB_BRANCH,
        }),
      });
      if (!putRes.ok) return { statusCode: 500, headers, body: JSON.stringify({ error: `Failed to update _shared.js: ${await putRes.text()}` }) };

      // Try to delete the data file too (best effort — don't fail if it's already gone)
      try {
        // Find the file name from the old content
        const fileMatch = sharedContent.match(new RegExp(`'${categoryKey}'\\s*:\\s*\\{[^}]*file:\\s*'([^']+)'`));
        if (fileMatch) {
          const filePath = `${productDir}${fileMatch[1]}`;
          const fileApiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
          const fileRes = await fetch(`${fileApiUrl}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders });
          if (fileRes.ok) {
            const fileData = await fileRes.json();
            await fetch(fileApiUrl, {
              method: 'DELETE', headers: ghHeaders,
              body: JSON.stringify({
                message: `Delete category file ${fileMatch[1]} via admin dashboard`,
                sha: fileData.sha, branch: GITHUB_BRANCH,
              }),
            });
          }
        }
      } catch(e) { /* best effort */ }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Category '${categoryKey}' deleted. Redeploy to take effect.` }) };
    }

    // ── ADD CATEGORY ──
    const label = (body.label || '').trim();
    if (!label) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing category label' }) };

    const categoryKey = slugify(body.categoryKey || label);
    if (!categoryKey) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Could not derive a valid category key' }) };

    const codePrefix = (body.codePrefix || categoryKey.slice(0, 2)).toUpperCase().slice(0, 3);
    const fileName   = `${categoryKey}.js`;
    const arrayVar   = `${categoryKey.replace(/-/g, '_').toUpperCase()}_PRODUCTS`;

    if (sharedContent.includes(`'${categoryKey}':`)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `Category '${categoryKey}' already exists` }) };
    }

    // Compute free ID range
    const maxValues  = Array.from(sharedContent.matchAll(/max:\s*(\d+)/g)).map(m => parseInt(m[1], 10));
    const highestMax = maxValues.length ? Math.max(...maxValues) : 1000;
    const newMin     = Math.ceil((highestMax + 1000) / 1000) * 1000 + 1;
    const newMax     = newMin + 998;

    const mapStartRe = /const\s+CATEGORY_MAP\s*=\s*\{/;
    const mapStart   = sharedContent.match(mapStartRe);
    if (!mapStart) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not find CATEGORY_MAP in _shared.js' }) };
    const insertAt   = mapStart.index + mapStart[0].length;
    const newEntry   = `\n  '${categoryKey}': { file: '${fileName}', arrayVar: '${arrayVar}', min: ${newMin}, max: ${newMax}, codePrefix: '${codePrefix}', label: '${label}' },`;
    const updatedShared = sharedContent.slice(0, insertAt) + newEntry + sharedContent.slice(insertAt);

    // Create new data file
    const newFileApiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${productDir}${fileName}`;
    const existsRes = await fetch(`${newFileApiUrl}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders });
    if (existsRes.ok) return { statusCode: 400, headers, body: JSON.stringify({ error: `File ${fileName} already exists in the repo` }) };

    const newFileContent = `// ── ${label.toUpperCase()} (${newMin}–${newMax}) ─────────────────────────────────\nconst ${arrayVar} = [\n];\n`;
    const createRes = await fetch(newFileApiUrl, {
      method: 'PUT', headers: ghHeaders,
      body: JSON.stringify({
        message: `Create category file ${fileName} via admin dashboard`,
        content: Buffer.from(newFileContent, 'utf-8').toString('base64'),
        branch: GITHUB_BRANCH,
      }),
    });
    if (!createRes.ok) return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not create ${fileName}: ${await createRes.text()}` }) };

    // Commit updated _shared.js
    const putSharedRes = await fetch(sharedApiUrl, {
      method: 'PUT', headers: ghHeaders,
      body: JSON.stringify({
        message: `Register category '${categoryKey}' in CATEGORY_MAP via admin dashboard`,
        content: Buffer.from(updatedShared, 'utf-8').toString('base64'),
        sha: sharedSha, branch: GITHUB_BRANCH,
      }),
    });
    if (!putSharedRes.ok) return { statusCode: 500, headers, body: JSON.stringify({ error: `Created ${fileName} but failed to register in _shared.js: ${await putSharedRes.text()}` }) };

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        success: true, categoryKey, fileName, arrayVar,
        idRange: `${newMin}-${newMax}`,
        message: `Category '${label}' created! Remember to add a nav entry for it in your storefront.`,
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
      
