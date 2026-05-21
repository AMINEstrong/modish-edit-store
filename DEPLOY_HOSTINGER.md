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

## Corriger le 403 Forbidden

Ce message vient en général **d’Apache** (`public_html`), pas de votre app React. Le visiteur n’atteint pas le processus Node.

### 1. Vérifier que l’app Node tourne

Dans **hPanel** → **Websites** → votre site → tableau de bord **Node.js** :

- Statut : **Running** (pas Stopped / Failed).
- Si besoin : **Restart**, puis attendre 1–2 minutes.

Consultez les **logs** (Deployments → dernier déploiement). Si `npm start` plante (variables Supabase manquantes, Node 20, etc.), Apache affiche souvent 403 ou 502.

### 2. Type de site : Node.js Web App (pas site statique)

Le domaine **slistyle.com** doit être une **Node.js Web App**, pas un ancien site PHP/HTML dans `public_html` seul.

Si le domaine existait déjà :

1. Sauvegardez les fichiers si besoin.
2. **Supprimez l’ancien site** (hPanel → Websites → Remove website).
3. **Add Website** → **Node.js Apps** → import Git → redéployez.

Hostinger crée alors le dossier `nodejs` et un **`.htaccess` dans `public_html`** qui redirige vers Node.

### 3. Réglages de déploiement (Settings)

| Champ | Valeur |
|--------|--------|
| Output directory | `dist` |
| Entry file (si demandé) | `dist/server/index.mjs` |
| Start command | `npm start` |
| Node | **22** |

Variables obligatoires : `HOST=0.0.0.0`, `PORT=3000` (ou laisser Hostinger définir `PORT`), plus les `VITE_*` et `SUPABASE_*` (voir `.env.example`).

### 4. Fichier `.htaccess` dans `public_html`

**File Manager** → `domains/votredomaine.com/public_html/` :

- Si un ancien `.htaccess` contient `Deny from all` ou bloque tout → renommez-le en `.htaccess.old`.
- **Redéployez** l’app Node pour que Hostinger régénère le `.htaccess` de proxy.

Ne mettez **pas** votre code source uniquement dans `public_html` : le build vit sous `nodejs` / `.builds`, et c’est **npm start** qui sert le site.

### 5. DNS

**DNS Zone** : l’enregistrement **A** du domaine doit pointer vers l’hébergement Hostinger (pas une ancienne IP).

---

## Routage

Nitro + TanStack Router gèrent toutes les routes (`/`, `/homme`, `/femme`, `/products/...`, `/admin`, etc.). Aucun `.htaccess` ni rewrite Apache n’est nécessaire.

## Build sur le serveur

Le build doit s’exécuter **sur Hostinger** (Linux), pas en uploadant un dossier `.output` compilé sur Windows — évite les problèmes de binaires natifs (message Nitro « builder OS »).

## Dépannage

| Symptôme | Cause probable |
|----------|----------------|
| **403 Forbidden** (page Apache « Access denied ») | Voir section **Corriger le 403** ci-dessous |
| **404** | Mauvais start command ou `.output` absent après build |
| **No output directory found** | Output directory dans hPanel ≠ **`dist`**, ou build sans `scripts/hostinger-postbuild.mjs` |
| Build failed | Node **20** au lieu de **22**, ou variables `VITE_*` manquantes au build |
| `ERR_REQUIRE_CYCLE_MODULE` | Ancienne config Lovable — mettre à jour le dépôt (vite.config.ts natif) |
| App crash au run | Variables `SUPABASE_*` manquantes en production |

## Fichiers utiles

- `vite.config.ts` — config Vite ESM native + `nitro({ preset: "node-server" })` (sans package Lovable)
- `hostinger.json` — rappel des valeurs hPanel
- `.env.example` — liste des variables
