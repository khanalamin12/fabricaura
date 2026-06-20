// Netlify Function: manage-trash
// action: 'list'    -> returns all soft-deleted products across every category,
//                       and permanently purges anything older than 7 days first.
// action: 'restore' -> un-deletes a product (clears deletedAt).
// action: 'purge'   -> permanently deletes one trashed product right now.

const { CATEGORY_MAP } = require('./_shared');

const RETENTION_DAYS = 7;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'User-Agent': 'admin-dashboard',
    Accept: 'application/vnd.github+json',
  };
}

async function getFile(apiBase, headers, branch) {
  const res = await fetch(`${apiBase}?ref=${branch}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { sha: data.sha, content: Buffer.from(data.content, 'base64').toString('utf-8') };
}

async function putFile(apiBase, headers, branch, content, sha, message) {
  const res = await fetch(apiBase, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message, content: Buffer.from(content, 'utf-8').toString('base64'), sha, branch }),
  });
  if (!res.ok) throw new Error(await res.text());
}

function findArrayBounds(content, arrayVar) {
  const startMatch = content.match(new RegExp(`const\\s+${arrayVar}\\s*=\\s*\\[`));
  if (!startMatch) return null;
  const arrayStartIdx = startMatch.index + startMatch[0].length;
  const closeIdx = content.indexOf('\n];', arrayStartIdx);
  if (closeIdx === -1) return null;
  return { arrayStartIdx, closeIdx };
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const body = JSON.parse(event.body || '{}');
    if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Wrong password' }) };
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server is missing GitHub env vars' }) };
    }
    const gh = ghHeaders(GITHUB_TOKEN);

    function apiBaseFor(cfg) {
      const filePath = process.env.PRODUCTS_PATH ? `${process.env.PRODUCTS_PATH}/${cfg.file}` : cfg.file;
      return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    }

    // ── ACTION: list (also lazily purges anything past retention) ──
    if (body.action === 'list') {
      const allTrashed = [];
      const now = Date.now();

      for (const [categoryKey, cfg] of Object.entries(CATEGORY_MAP)) {
        const apiBase = apiBaseFor(cfg);
        let file;
        try { file = await getFile(apiBase, gh, GITHUB_BRANCH); } catch (e) { continue; }
        const bounds = findArrayBounds(file.content, cfg.arrayVar);
        if (!bounds) continue;
        const arrayBody = file.content.slice(bounds.arrayStartIdx, bounds.closeIdx);

        const objRe = /\s*\{[^{}]*\}\s*,?/gs;
        const chunks = arrayBody.match(objRe) || [];
        let changed = false;

        const keptChunks = chunks.filter((chunk) => {
          const delMatch = chunk.match(/deletedAt:\s*'([^']*)'/);
          if (!delMatch) return true; // not trashed, keep as-is
          const deletedAt = new Date(delMatch[1]).getTime();
          const age = now - deletedAt;
          if (age > RETENTION_MS) {
            changed = true; // expired — purge permanently
            return false;
          }
          // still within window — report it, keep it
          const idMatch = chunk.match(/id:\s*(\d+)/);
          const nameMatch = chunk.match(/name:\s*'([^']*)'/);
          const codeMatch = chunk.match(/code:\s*'([^']*)'/);
          const photosMatch = chunk.match(/photos:\s*\[([\s\S]*?)\]/);
          const photoIds = photosMatch ? Array.from(photosMatch[1].matchAll(/'([^']+)'/g)).map(m => m[1]) : [];
          allTrashed.push({
            category: categoryKey,
            id: idMatch ? idMatch[1] : null,
            name: nameMatch ? nameMatch[1] : '(unnamed)',
            code: codeMatch ? codeMatch[1] : '',
            deletedAt: delMatch[1],
            daysLeft: Math.max(0, Math.ceil((RETENTION_MS - age) / (24 * 60 * 60 * 1000))),
            photoIds,
          });
          return true;
        });

        if (changed) {
          const newArrayBody = keptChunks.join('');
          const updatedContent = file.content.slice(0, bounds.arrayStartIdx) + newArrayBody + file.content.slice(bounds.closeIdx);
          try {
            await putFile(apiBase, gh, GITHUB_BRANCH, updatedContent, file.sha, `Auto-purge expired trash in ${cfg.file}`);
          } catch (e) { /* non-fatal — try again next time list is called */ }
        }
      }

      allTrashed.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
      return { statusCode: 200, headers, body: JSON.stringify({ trashed: allTrashed }) };
    }

    // ── ACTION: restore or purge (single item, specific category) ──
    if (body.action === 'restore' || body.action === 'purge') {
      const cfg = CATEGORY_MAP[body.category];
      if (!cfg) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown category' }) };
      const targetId = String(body.id);
      const apiBase = apiBaseFor(cfg);
      const file = await getFile(apiBase, gh, GITHUB_BRANCH);
      const bounds = findArrayBounds(file.content, cfg.arrayVar);
      if (!bounds) return { statusCode: 500, headers, body: JSON.stringify({ error: `Could not find ${cfg.arrayVar}` }) };
      const arrayBody = file.content.slice(bounds.arrayStartIdx, bounds.closeIdx);

      const objRe = /\s*\{[^{}]*\}\s*,?/gs;
      const chunks = arrayBody.match(objRe) || [];
      let found = false;

      const updatedChunks = chunks.flatMap((chunk) => {
        const idMatch = chunk.match(/id:\s*(\d+)/);
        if (!idMatch || idMatch[1] !== targetId) return [chunk];
        found = true;
        if (body.action === 'purge') return []; // remove entirely
        // restore: strip the deletedAt tag
        return [chunk.replace(/\n\s*deletedAt:\s*'[^']*',?/, '')];
      });

      if (!found) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: `Product id ${targetId} not found` }) };
      }

      const newArrayBody = updatedChunks.join('');
      const updatedContent = file.content.slice(0, bounds.arrayStartIdx) + newArrayBody + file.content.slice(bounds.closeIdx);
      await putFile(
        apiBase, gh, GITHUB_BRANCH, updatedContent, file.sha,
        body.action === 'purge'
          ? `Permanently delete product id ${targetId} via admin trash`
          : `Restore product id ${targetId} from trash via admin dashboard`
      );

      return {
        statusCode: 200, headers,
        body: JSON.stringify({ success: true, message: body.action === 'purge' ? 'Permanently deleted.' : 'Product restored. Site will redeploy in ~1 min.' }),
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
    
