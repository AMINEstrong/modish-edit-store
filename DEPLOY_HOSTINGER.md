# Déploiement Hostinger Business (Node.js)

Ce projet utilise **TanStack Start + Nitro** (`preset: node-server`). Le domaine doit pointer vers l’**application Node.js**, pas vers `public_html`.

## Prérequis

- Plan **Business** (ou Cloud) avec **Node.js Web App**
- Node.js **22.x** minimum **22.12** (voir `.nvmrc` — TanStack Start l’exige)
- Dépôt Git ou archive ZIP (**sans** `node_modules`, **sans** `.output`)

## Configuration hPanel

1. **Websites** → **Node.js** → **Create application**
2. Connecter le dépôt Git ou importer le projet
3. Renseigner :

| Champ | Valeur |
|--------|--------|
| Framework | **Other** (ou Vite si proposé) |
| Node version | **22** (obligatoire, pas 20) |
| Install command | `npm ci` (ou `npm install`) |
| Build command | `npm run build` |
| Start command | `npm start` |
| Output directory | **`dist`** (obligatoire — créé par le post-build Hostinger) |
| Root directory | `/` (racine du repo) |

4. **Environment variables** (voir `.env.example`) — **avant** le build pour `VITE_*` :

```
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

5. Lier le **domaine** à cette application Node (pas à un site statique / `public_html`).

## Scripts locaux

```bash
npm ci
npm run build    # génère .output/ + dist/ (pour la vérif Hostinger)
npm start        # node .output/server/index.mjs (PORT, HOST via env)
```

Test local :

```bash
set PORT=3000
npm start
# http://localhost:3000/
```

## Routage

Nitro + TanStack Router gèrent toutes les routes (`/`, `/homme`, `/femme`, `/products/...`, `/admin`, etc.). Aucun `.htaccess` ni rewrite Apache n’est nécessaire.

## Build sur le serveur

Le build doit s’exécuter **sur Hostinger** (Linux), pas en uploadant un dossier `.output` compilé sur Windows — évite les problèmes de binaires natifs (message Nitro « builder OS »).

## Dépannage

| Symptôme | Cause probable |
|----------|----------------|
| **403** sur le domaine | Domaine encore sur `public_html` / site statique |
| **404** | Mauvais start command ou `.output` absent après build |
| **No output directory found** | Output directory dans hPanel ≠ **`dist`**, ou build sans `scripts/hostinger-postbuild.mjs` |
| Build failed | Node **20** au lieu de **22**, ou variables `VITE_*` manquantes au build |
| `ERR_REQUIRE_CYCLE_MODULE` | Ancienne config Lovable — mettre à jour le dépôt (vite.config.ts natif) |
| App crash au run | Variables `SUPABASE_*` manquantes en production |

## Fichiers utiles

- `vite.config.ts` — config Vite ESM native + `nitro({ preset: "node-server" })` (sans package Lovable)
- `hostinger.json` — rappel des valeurs hPanel
- `.env.example` — liste des variables
