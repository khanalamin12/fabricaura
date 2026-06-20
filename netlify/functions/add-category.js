

function slugify(s) {
  return String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Escape a string for safe interpolation inside an HTML attribute / text node.
function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// Escape a string for safe interpolation inside a single-quoted JS string literal.
function escJsString(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Fetch a file's content + sha from GitHub. Returns null if it doesn't exist.
async function ghGetFile(owner, repo, path, branch, ghHeaders) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(`${url}?ref=${branch}`, { headers: ghHeaders });
  if (!res.ok) return null;
  const data = await res.json();
  return { sha: data.sha, content: Buffer.from(data.content, 'base64').toString('utf-8'), url };
}

// Commit a new version of a file's content to GitHub.
async function ghPutFile(url, content, sha, branch, message, ghHeaders) {
  const res = await fetch(url, {
    method: 'PUT', headers: ghHeaders,
    body: JSON.stringify({
      message, content: Buffer.from(content, 'utf-8').toString('base64'),
      sha, branch,
    }),
  });
  if (!res.ok) throw new Error(`Failed to update ${url}: ${await res.text()}`);
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
      let deletedFileName = null;
      try {
        // Find the file name from the old content
        const fileMatch = sharedContent.match(new RegExp(`'${categoryKey}'\\s*:\\s*\\{[^}]*file:\\s*'([^']+)'`));
        if (fileMatch) {
          deletedFileName = fileMatch[1];
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

      // ── Unwire from storefront: index.html + app.js (best effort) ──
      const storefrontWarnings = [];
      try {
        const indexFile = await ghGetFile(GITHUB_OWNER, GITHUB_REPO, 'index.html', GITHUB_BRANCH, ghHeaders);
        if (indexFile) {
          let html = indexFile.content;
          if (deletedFileName) {
            html = html.replace(new RegExp(`\\s*<script src="${deletedFileName}"></script>\\n?`), '\n');
          }
          html = html.replace(new RegExp(`\\s*<button class="cat-tab"[^>]*data-cat="${categoryKey}"[\\s\\S]*?</button>\\n?`), '\n');
          html = html.replace(new RegExp(`\\s*<a href="#products" onclick="setCategory\\('${categoryKey}',null\\)">[\\s\\S]*?</a>\\n?`), '\n');
          if (html !== indexFile.content) {
            await ghPutFile(indexFile.url, html, indexFile.sha, GITHUB_BRANCH,
              `Remove category '${categoryKey}' from storefront nav via admin dashboard`, ghHeaders);
          }
        } else {
          storefrontWarnings.push('Could not read index.html to remove its nav entry.');
        }
      } catch (e) { storefrontWarnings.push(`index.html cleanup failed: ${e.message}`); }

      try {
        const appFile = await ghGetFile(GITHUB_OWNER, GITHUB_REPO, 'app.js', GITHUB_BRANCH, ghHeaders);
        if (appFile) {
          const metaRe = new RegExp(`\\n\\s*'${categoryKey}':\\s*\\{[^}]*\\},?`);
          if (metaRe.test(appFile.content)) {
            const updatedApp = appFile.content.replace(metaRe, '');
            await ghPutFile(appFile.url, updatedApp, appFile.sha, GITHUB_BRANCH,
              `Remove category '${categoryKey}' from CAT_META via admin dashboard`, ghHeaders);
          }
        } else {
          storefrontWarnings.push('Could not read app.js to remove its CAT_META entry.');
        }
      } catch (e) { storefrontWarnings.push(`app.js cleanup failed: ${e.message}`); }

      const warnSuffix = storefrontWarnings.length ? ` (Note: ${storefrontWarnings.join(' ')})` : '';
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: `Category '${categoryKey}' deleted and removed from storefront nav. Redeploying now.${warnSuffix}` }) };
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

    // ── Wire into storefront: index.html + app.js (best effort; category still works without this) ──
    const icon    = (body.icon || 'fa-shirt').trim();
    const eyebrow = (body.eyebrow || label).trim();
    const storefrontWarnings = [];
    let storefrontWired = true;

    try {
      const indexFile = await ghGetFile(GITHUB_OWNER, GITHUB_REPO, 'index.html', GITHUB_BRANCH, ghHeaders);
      if (!indexFile) throw new Error('index.html not found at repo root');
      let html = indexFile.content;

      // 1) <script src="..."> tag — insert right before products.js (or before app.js if products.js absent)
      const scriptTag = `<script src="${fileName}"></script>\n`;
      if (html.includes('<script src="products.js"></script>')) {
        html = html.replace('<script src="products.js"></script>', scriptTag + '<script src="products.js"></script>');
      } else if (html.includes('<script src="app.js"></script>')) {
        html = html.replace('<script src="app.js"></script>', scriptTag + '<script src="app.js"></script>');
      } else {
        throw new Error('Could not find a script tag anchor to insert the new data file <script> tag');
      }

      // 2) category tab button — insert before the closing </div> of #categoryFilter
      const tabBtn = `    <button class="cat-tab" data-cat="${categoryKey}" onclick="setCategory('${categoryKey}',this)">\n` +
                     `      <i class="fas ${escAttr(icon)}"></i><span>${escAttr(label)}</span>\n` +
                     `    </button>\n  `;
      const filterRe = /(<div class="category-filter" id="categoryFilter">[\s\S]*?)(\n\s*<\/div>)/;
      if (filterRe.test(html)) {
        html = html.replace(filterRe, (m, p1, p2) => `${p1}\n${tabBtn}${p2}`);
      } else {
        throw new Error('Could not find #categoryFilter block to insert the new tab button');
      }

      // 3) footer "Quick Links" entry — insert after the last existing setCategory(...) link in the footer column
      const footerLink = `\n      <a href="#products" onclick="setCategory('${categoryKey}',null)"><i class="fas ${escAttr(icon)}"></i> ${escAttr(label)}</a>`;
      const footerRe = /(<h4>Quick Links<\/h4>(?:\s*<a href="#products" onclick="setCategory\([^)]*\)">.*?<\/a>)+)/;
      if (footerRe.test(html)) {
        html = html.replace(footerRe, (m) => `${m}${footerLink}`);
      } else {
        storefrontWarnings.push('Could not find "Quick Links" footer block — footer link skipped.');
      }

      await ghPutFile(indexFile.url, html, indexFile.sha, GITHUB_BRANCH,
        `Wire category '${categoryKey}' into storefront nav via admin dashboard`, ghHeaders);
    } catch (e) {
      storefrontWired = false;
      storefrontWarnings.push(`index.html: ${e.message}`);
    }

    try {
      const appFile = await ghGetFile(GITHUB_OWNER, GITHUB_REPO, 'app.js', GITHUB_BRANCH, ghHeaders);
      if (!appFile) throw new Error('app.js not found at repo root');
      const metaStartRe = /const\s+CAT_META\s*=\s*\{/;
      const metaStart = appFile.content.match(metaStartRe);
      if (!metaStart) throw new Error('Could not find CAT_META in app.js');
      const insertAt = metaStart.index + metaStart[0].length;
      const newMetaEntry = `\n  '${escJsString(categoryKey)}': { eyebrow: '${escJsString(eyebrow)}', title: '${escJsString(label)}' },`;
      const updatedApp = appFile.content.slice(0, insertAt) + newMetaEntry + appFile.content.slice(insertAt);
      await ghPutFile(appFile.url, updatedApp, appFile.sha, GITHUB_BRANCH,
        `Add category '${categoryKey}' to CAT_META via admin dashboard`, ghHeaders);
    } catch (e) {
      storefrontWired = false;
      storefrontWarnings.push(`app.js: ${e.message}`);
    }

    const message = storefrontWired
      ? `Category '${label}' created and wired into the storefront. Redeploying now — it'll be live in under a minute.`
      : `Category '${label}' created, but the storefront nav couldn't be fully wired automatically (${storefrontWarnings.join(' ')}). The category data itself works — you may need to add the nav entry by hand.`;

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        success: true, categoryKey, fileName, arrayVar,
        idRange: `${newMin}-${newMax}`,
        storefrontWired, message,
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
                              
