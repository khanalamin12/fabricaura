# Setting up your Admin Dashboard

This gives you a page at `yoursite.com/admin.html` where you fill a form and
your product files in GitHub get updated automatically — Netlify then
redeploys your site. No code editing, ever again.

## Step 1 — Add the files to your GitHub repo

Copy these 3 files into your project repo, in these exact spots:

```
your-repo/
├── admin.html              ← put next to your index.html
├── netlify.toml             ← put in the repo root (if you already have one, just add the "functions" line to it)
└── netlify/
    └── functions/
        └── add-product.js
```

Commit and push these to GitHub (you can drag-and-drop them on github.com
in the browser — "Add file → Upload files" — no terminal needed).

## Step 2 — Create a GitHub Personal Access Token

This lets the dashboard write to your repo on your behalf.

1. Go to https://github.com/settings/tokens?type=beta
2. Click **"Generate new token"**
3. Give it a name like "product-admin"
4. Under **Repository access**, choose "Only select repositories" → pick your repo
5. Under **Permissions**, set **Contents** to **Read and write**
6. Generate, then **copy the token** (you won't see it again)

## Step 3 — Add environment variables in Netlify

In Netlify: your site → **Site configuration → Environment variables → Add a variable**

Add these:

| Key | Value |
|---|---|
| `GITHUB_TOKEN` | the token from Step 2 |
| `GITHUB_OWNER` | your GitHub username |
| `GITHUB_REPO` | your repo name |
| `GITHUB_BRANCH` | `main` (or whatever your default branch is called) |
| `ADMIN_PASSWORD` | a password you'll type into the dashboard — make it up |
| `PRODUCTS_PATH` | *(only add this if your .js product files are inside a subfolder, e.g. `src` — otherwise skip it)* |

Then trigger a redeploy (Netlify → Deploys → Trigger deploy) so the function
picks up the new variables.

## Step 4 — Use it

Go to `https://yoursite.com/admin.html`, type your password, fill the form,
click Save. Within about a minute your live site will have the new product.

### Notes
- Paste full Google Drive share links (`https://drive.google.com/file/d/.../view`) — the dashboard pulls out the file ID automatically. Make sure each file is set to "Anyone with the link can view."
- Product IDs and codes (e.g. `TS-010`) are picked automatically based on what already exists in that category.
- This isn't bank-level security — the password just stops randoms who find the URL from messing with your store. Don't share the admin link publicly.
