# Hostinger deployment — Vite SPA + Express

## Project structure

```
project/
├── dist/              ← build output (upload / served by Node)
├── public/
├── src/
├── server/
│   └── api.mjs        ← signup + orders API
├── index.html         ← Vite entry
├── index.mjs          ← Express (static + SPA fallback + API)
├── vite.config.js
├── package.json
├── .htaccess          ← copied to dist/ on build
└── scripts/
    └── copy-htaccess.mjs
```

## Local commands

```bash
npm ci
npm run build          # → dist/index.html + dist/assets/ + dist/.htaccess
npm start              # Express on PORT (default 3000)

# Development (two terminals):
npm run dev:server     # API + optional preview of built dist
npm run dev            # Vite on :8080, proxies /api → :3000
```

## Hostinger Node.js Web App (recommended)

| Setting | Value |
|---------|--------|
| Node version | **22** |
| Install | `npm ci` |
| Build | `npm run build` |
| **Output directory** | **`dist`** |
| **Start command** | **`npm start`** |
| Entry file | `index.mjs` |

### Environment variables (hPanel)

```
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Set `VITE_*` **before** build so they are embedded in the frontend bundle.

Link the **domain to the Node.js app**, not a static site-only `public_html`.

---

## Static-only deploy (Apache / public_html)

If you only upload static files (no Node):

1. Run `npm run build` locally or on CI.
2. Upload **everything inside `dist/`** to `public_html/` (including `.htaccess` and `index.html`).
3. Signup and checkout **will not work** (they need `/api` on Node).

For full features, use **Node.js Web App** with `npm start`.

---

## Fix 403 Forbidden

| Cause | Fix |
|-------|-----|
| Domain points to empty `public_html` | Use Node.js Web App or upload `dist/` + `.htaccess` |
| Old `.htaccess` with `Deny` | Rename to `.htaccess.bak`, redeploy |
| No `index.html` in web root | Run `npm run build`, deploy `dist/` |
| Node app stopped | hPanel → Restart, check logs |

---

## Fix blank page / missing CSS

- Use `base: '/'` at domain root (default in `vite.config.js`).
- For subdirectory only: `VITE_BASE_PATH=./ npm run build`.
- Hard-refresh cache (Ctrl+F5).

## Fix React / TanStack Router 404 on refresh

`dist/.htaccess` rewrites all non-file routes to `index.html`.  
With Express (`npm start`), the server already sends `index.html` for SPA routes.

---

## What to upload

**Git deploy (best):** push repo, let Hostinger build — do not upload `node_modules`.

**Manual ZIP:** project without `node_modules`, `.env`, `.output`. Hostinger runs `npm ci && npm run build && npm start`.

**Static only:** contents of `dist/` → `public_html/`.
