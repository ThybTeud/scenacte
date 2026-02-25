# Scenacte — Rapport d'audit complet du repository

> **Date** : 2026-02-25 | **Branche** : `master` | **Description** : Editeur de theatre accessible — fullstack React + Express + PostgreSQL

---

## 1. Arborescence

### Racine

```
.
├── client/                  # Frontend React (Vite)
├── server/                  # Backend Express (Node.js)
├── docs/                    # Documentation et archives
│   └── archives/            # Docs historiques (refactoring, audits)
├── .github/workflows/       # CI/CD GitHub Actions
├── package.json             # Scripts d'orchestration monorepo
├── render.yaml              # Config deploiement Render
├── LICENSE                  # MIT
├── README.md
├── DEPLOYMENT.md
├── MAINTENANCE.md
├── PRIVACY_POLICY.md
├── TERMS_OF_SERVICE.md
└── LEGAL_NOTICE.md
```

### Client (`client/`)

```
client/
├── src/
│   ├── assets/styles/
│   │   └── scenacte-template.css    # CSS de base PagedJS
│   ├── components/
│   │   ├── editor/                  # EditorHeader, SyntaxBar
│   │   ├── editors/                 # CodeMirrorEditor, PlayPreview
│   │   ├── layout/                  # AppLayout
│   │   ├── library/                 # PlayCard, CreatePlayCard
│   │   ├── modals/                  # 8 modals + index.js barrel
│   │   ├── pdf/                     # PdfPreview
│   │   ├── plays/                   # VersionsSidebar
│   │   ├── routing/                 # PrivateRoute
│   │   ├── sidebar/                 # EditorSidebar, LibrarySidebar + index.js
│   │   ├── ui/                      # shadcn/ui primitives (25+ composants)
│   │   ├── ErrorBoundary.jsx
│   │   └── ServerWakeUp.jsx
│   ├── config/
│   │   └── template-presets.js      # Presets PDF (classique, moderne)
│   ├── contexts/
│   │   └── AuthContext.jsx          # Auth + guest mode
│   ├── hooks/                       # 7 hooks customs
│   ├── lib/utils.js                 # cn() (clsx + tailwind-merge)
│   ├── pages/                       # 6 domaines + dev tools
│   ├── services/                    # 8 services (api, auth, plays, storage...)
│   ├── utils/                       # Parser, AST, transformers, stats, PDF
│   ├── test/setup.js
│   ├── App.jsx / main.jsx / index.css
├── dev-tools/pdf-lab/               # Outil dev standalone PagedJS
├── public/                          # Logos, sitemap, robots.txt, legal
├── vite.config.js / vitest.config.js / eslint.config.js / postcss.config.js
├── jsconfig.json / components.json  # Config shadcn/ui
└── package.json
```

### Serveur (`server/`)

```
server/
├── src/
│   ├── controllers/       # 7 controllers (auth, plays, versions, export, templates, users, bugReports)
│   ├── config/            # database.js, env.js (validation envalid)
│   ├── db/index.js        # ORM maison Prisma-like (snake_case → camelCase)
│   ├── jobs/              # cleanup.job.js (cron nettoyage versions)
│   ├── middleware/        # auth.js, errorHandler.js, rateLimiter.js
│   ├── routes/            # 8 fichiers de routes + index.js
│   ├── services/          # email, queue (PgBoss), pdf, version-cleanup
│   ├── utils/             # jwt.js, logger.js (pino), validation.js
│   ├── __tests__/         # 4 fichiers de tests (auth, plays, version-cleanup, playStats)
│   ├── app.js / server.js
├── db/
│   ├── schema.sql
│   ├── migrate.js
│   └── migrations/        # 000_init.sql, 001_add_password_updated_at.sql
├── scripts/start-test-services.sh
├── jest.config.js
└── package.json
```

---

## 2. Stack & Config

### Dependencies principales

| Couche | Technologie | Version |
|--------|------------|---------|
| **Runtime** | Node.js | >= 18.0.0 |
| **Frontend** | React | 19.1.1 |
| **Routing** | react-router-dom | 7.9.5 |
| **Bundler** | Vite | 7.1.7 |
| **CSS** | Tailwind CSS v4 | 4.1.17 |
| **UI Kit** | shadcn/ui (Radix) | new-york style |
| **Editeur** | CodeMirror 6 | 6.x |
| **Icones** | lucide-react | 0.562.0 |
| **Markdown** | marked | 17.0.1 |
| **Backend** | Express | 4.21.1 |
| **Base de donnees** | PostgreSQL (pg) | 8.11.3 |
| **Auth** | jsonwebtoken + bcrypt | 9.0.2 / 5.1.1 |
| **Email** | Resend | 6.7.0 |
| **Job Queue** | pg-boss | 12.5.2 |
| **Logging** | pino | 10.1.0 |
| **PDF** | PagedJS | 0.4.3 |
| **Cron** | node-cron | 3.0.3 |
| **Securite** | helmet, cors, express-rate-limit | 8.1.0 / 2.8.5 / 8.2.1 |
| **Tests client** | Vitest + Testing Library | 4.0.16 |
| **Tests serveur** | Jest + Supertest | 30.2.0 / 7.1.4 |

### Scripts

**Racine** :
```json
{
  "install:all": "npm run install:client && npm run install:server",
  "build:client": "cd client && npm run build",
  "start": "cd server && npm start",
  "deploy": "npm run build:client && npm run start"
}
```

**Client** :
```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage",
  "bench:parser": "node src/utils/__benchmarks__/parser-benchmark.js"
}
```

**Serveur** :
```json
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "db:migrate": "psql $DATABASE_URL -f db/migrations/000_init.sql",
  "test": "NODE_OPTIONS=--experimental-vm-modules NODE_ENV=test jest --runInBand"
}
```

### Config Vite

```js
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

### Config ESLint (flat config v9)

- `@eslint/js` recommended + `react-hooks` + `react-refresh`
- `no-unused-vars: ['error', { varsIgnorePattern: '^[A-Z_]' }]`

### Config Tailwind / PostCSS

```js
// postcss.config.js
export default { plugins: { '@tailwindcss/postcss': {}, autoprefixer: {} } }
```

- Tailwind v4 via `@tailwindcss/postcss` + plugin `@tailwindcss/typography` + `tw-animate-css`

### Variables d'environnement

**Client** : `VITE_API_URL`

**Serveur** :

| Variable | Requis | Description |
|----------|--------|-------------|
| `DATABASE_URL` | Oui | Connection string PostgreSQL |
| `JWT_SECRET` | Oui | Cle secrete (min 32 chars) |
| `CLIENT_URL` | Oui | URL du frontend (CORS) |
| `JWT_EXPIRES_IN` | Non | Duree token (defaut `7d`) |
| `RESET_TOKEN_SECRET` | Non | Secret reset password |
| `RESEND_API_KEY` | Non | Cle API Resend |
| `EMAIL_FROM` | Non | Expediteur (defaut `noreply@scenacte.fr`) |
| `PORT` | Non | Port serveur (defaut `3000`) |
| `NODE_ENV` | Non | Environnement |
| `MAX_CONTENT_SIZE_MB` | Non | Taille max body (defaut `10`) |

---

## 3. Architecture

### Patterns recurrents

**Barrel exports** — Utilises pour `modals/` et `sidebar/` :
```js
// components/modals/index.js
export { default as ExportModal } from './ExportModal';
export { default as CreatePlayModal } from './CreatePlayModal';
// ... 7 exports
```

**Hooks customs** (7) :

| Hook | Role |
|------|------|
| `useAuth` | Consumer du `AuthContext` |
| `usePlayParsing` | Pipeline content → AST → HTML + structure + stats (memoize) |
| `useVersioning` | Versioning auto : inactivite 10min, seuil 500 chars, session_close |
| `useKeyboardShortcuts` | Raccourcis Ctrl+1/2/3/4 (acte/personnage/didascalie/dialogue) |
| `useDebouncedValue` | Debounce generique (300ms) |
| `useSyncScroll` | Synchronisation scroll editeur / preview |
| `use-mobile` | Detection viewport < 768px |

**Context unique** — `AuthContext` gere : `user`, `token`, `guestMode`, `isLoading` + methodes `login`, `register`, `logout`, `enableGuestMode`. Pas de store global (Redux/Zustand).

**Service layer** — Abstraction HTTP dans `api.js` (fetch wrapper avec JWT auto), puis services domaine. `storageService` bascule entre localStorage (invite) et API (connecte) de facon transparente :

```js
// services/storage.service.js — bascule transparente
export const storageService = {
  async listPlays(params) {
    if (isGuest()) return getLocalPlays();
    return playsService.listPlays(params);
  },
  // ...
};
```

### Structure des composants

```
pages/{domaine}/         # 1 dossier par feature (auth, editor, library, profile, legal)
components/
  ui/                    # Primitives shadcn/ui (Radix), kebab-case.jsx
  editor/                # Barre d'outils (EditorHeader, SyntaxBar)
  editors/               # CodeMirror + PlayPreview
  modals/                # Dialogues (ExportModal, CreatePlayModal...) + barrel
  sidebar/               # Navigation laterale + barrel
  routing/               # PrivateRoute
  pdf/                   # PdfPreview (iframe PagedJS)
  layout/                # AppLayout
  library/               # PlayCard, CreatePlayCard
  plays/                 # VersionsSidebar
```

### Gestion du state

| Scope | Mecanisme | Exemple |
|-------|-----------|---------|
| Global | `AuthContext` | user, token, guestMode |
| Page | `useState` | contenu editeur, modals, loading |
| Derive | `useMemo` via `usePlayParsing` | AST, HTML, stats, structure |
| Perf | `useRef` | compteur chars versioning, flags scroll sync |
| Persistance | `localStorage` | token JWT, donnees invite, presets |
| Sync | Custom event `auth:logout` | Deconnexion forcee sur 401 |

### Routing

```
/                     → RootRedirect → /library (si auth/guest) ou /login
/login                → AuthPage
/register             → AuthPage
/forgot-password      → AuthPage
/reset-password       → ResetPasswordPage
/library              → LibraryPage       [PrivateRoute]
/editor/:id           → EditorPage        [PrivateRoute]
/profile              → ProfilePage       [PrivateRoute requireAuth]
/legal/:docType       → LegalPage
/dev, /lab            → DevPlayground, TemplateLab  [DEV only]
*                     → NotFound (404)
```

**Guard `PrivateRoute`** — deux niveaux :
```jsx
// Accepte connectes + invites
<PrivateRoute><LibraryPage /></PrivateRoute>

// N'accepte que les connectes
<PrivateRoute requireAuth><ProfilePage /></PrivateRoute>
```

Logique interne :
```jsx
export function PrivateRoute({ children, requireAuth = false }) {
  const { user, guestMode, isLoading } = useAuth();
  if (isLoading) return <Loader fullScreen />;
  if (requireAuth && !user) return <Navigate to="/login" />;
  if (user) return children;
  if (guestMode) return children;
  return <Navigate to="/login" />;
}
```

---

## 4. API & Backend

### Endpoints complets

#### Health
| Methode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/api/health` | - | Sante DB + timestamp |

#### Auth (`/api/auth`) — 5 req/15 min
| Methode | Route | Description |
|---------|-------|-------------|
| `POST` | `/auth/register` | Inscription → JWT + email bienvenue |
| `POST` | `/auth/login` | Connexion → JWT |
| `POST` | `/auth/forgot-password` | Demande reset → email |
| `GET` | `/auth/validate-reset-token` | Valide token reset |
| `POST` | `/auth/reset-password` | Reset password |
| `GET` | `/auth/me` | Utilisateur courant (JWT) |

#### Users (`/api/users`) — 100 req/min, JWT
| Methode | Route | Description |
|---------|-------|-------------|
| `GET` | `/users/profile` | Profil + nombre de pieces |
| `PUT` | `/users/profile` | Modifier email/password |
| `DELETE` | `/users/account` | Supprimer compte (confirmation password, CASCADE) |

#### Plays (`/api/plays`) — 100 req/min, JWT
| Methode | Route | Description |
|---------|-------|-------------|
| `GET` | `/plays` | Lister (pagine, filtrable par statut) |
| `POST` | `/plays` | Creer une piece |
| `GET` | `/plays/:id` | Recuperer avec template |
| `GET` | `/plays/:id/ast` | AST debug endpoint |
| `PUT` | `/plays/:id` | Sauvegarder contenu (cree une version auto) |
| `PATCH` | `/plays/:id` | Modifier metadata (titre, sous-titre, template, paperSize) |
| `PATCH` | `/plays/:id/status` | Changer statut (draft/completed/archived) |
| `DELETE` | `/plays/:id` | Supprimer + toutes les versions |

#### Versions (`/api/plays/:id/versions`) — 100 req/min, JWT
| Methode | Route | Description |
|---------|-------|-------------|
| `GET` | `/versions` | Lister (pagine, filtrable par type) |
| `GET` | `/versions/:vid` | Detail version + contenu |
| `POST` | `/versions` | Snapshot auto |
| `POST` | `/versions/manual` | Snapshot manuel avec label |
| `POST` | `/versions/restore` | Restaurer (cree une version manuelle) |

#### Templates (`/api/templates`)
| Methode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/templates/public` | - | Templates systeme |
| `GET` | `/templates` | JWT | User + systeme |
| `POST` | `/templates` | JWT | Creer |
| `GET/PUT/DELETE` | `/templates/:id` | JWT | CRUD |

#### Export (`/api/plays/:id/export`) — 5 req/min, JWT
| Methode | Route | Description |
|---------|-------|-------------|
| `POST` | `/export/pdf` | Export PDF (templateId, versionId optionnels) |

#### Bug Reports (`/api/bug-reports`) — 100 req/min
| Methode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/bug-reports` | Optionnel | Signaler un bug (categories, screenshot base64 max 5MB) |

### Middleware

| Middleware | Role |
|-----------|------|
| `helmet` | CSP, X-Frame-Options, etc. |
| `compression` | gzip |
| `cors` | Whitelist dynamique (CLIENT_URL, localhost, Vercel, Codespaces) |
| `express.json` | Parsing body (limite configurable) |
| `authMiddleware` | JWT → `req.user { id, email }` |
| `optionalAuthMiddleware` | JWT non bloquant (bug reports) |
| `authLimiter` | 5 req/15 min |
| `apiLimiter` | 100 req/min (skip health checks) |
| `exportLimiter` | 5 req/min |
| `errorHandler` | Handler global avec classes custom (400-500) |
| `notFoundHandler` | 404 routes indefinies |

**Classes d'erreur** : `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `ValidationError` (422), `InternalServerError` (500).

### Structure de la DB

```
users ─1→N─ plays ─1→N─ play_history
  │                │
  └─1→N── export_templates ──N→1─┘

bug_reports (standalone, FK optionnel vers users)
```

**Tables** :

| Table | Colonnes cles | Notes |
|-------|--------------|-------|
| `users` | id (UUID), email (unique), username (unique), password_hash, password_updated_at | pgcrypto gen_random_uuid() |
| `plays` | id, user_id FK, title, raw_content, html_content, ast_content, statistics (JSONB), status (draft/completed/archived), paper_size (A4/A5), template_id FK | CASCADE delete |
| `play_history` | id, play_id FK, version_number, version_type (auto/manual), manual_label, file_size_bytes, preserved_reason, statistics (JSONB) | Pas de html_content stocke |
| `export_templates` | id, user_id FK (NULL=systeme), play_id FK (NULL=global), name, settings (JSONB), is_default | |
| `bug_reports` | id (SERIAL), title (auto 50 chars), description, categories (VARCHAR[]), screenshot (TEXT base64), user_id FK | |

**Index** : GIN sur JSONB `statistics`, B-tree sur FK, composite (user_id, status, last_edited_at), index cleanup (version_type, created_at).

### Auth flow

```
Register → bcrypt hash → INSERT → JWT (7j) → email bienvenue (queue PgBoss)
Login    → bcrypt compare → JWT (7j)
Forgot   → reset token (1h, RESET_TOKEN_SECRET) → email (queue)
Reset    → verify token → check password_updated_at → bcrypt → UPDATE
401 API  → client supprime token → window event 'auth:logout' → AuthContext reset
```

### Services backend

| Service | Role |
|---------|------|
| `email.service` | Resend API (bienvenue, reset, confirmation bug). Mode dev : affichage console |
| `queue.service` | PgBoss (PostgreSQL job queue). Worker teamSize=5, retry 3x, 60s delay, expire 24h |
| `pdf.service` | Generation HTML pagine avec PagedJS (MVP server-side, retourne Buffer HTML) |
| `version-cleanup.service` | Retention : manual=indefini, recent <7j=tout, old >7j=1 snapshot/jour |

### Job cron

`cleanup.job.js` — Tous les jours a 3h (Europe/Paris) via `node-cron` :

```
1. Mark manual → preserved_reason='manual' (garde indefiniment)
2. Mark recent auto < 7j → preserved_reason='recent'
3. Pour chaque piece avec auto > 7j :
   - Grouper par jour, garder la derniere → preserved_reason='daily_snapshot'
4. DELETE auto > 7j WHERE preserved_reason IS NULL
   (safety: created_at < NOW() - 5 minutes)
```

---

## 5. Parser Scenacte

### Syntaxe markup

| Balise | Regex | Usage | Exemple |
|--------|-------|-------|---------|
| `#` | `^#(?!#)\s*(.+?)\s*$` | Acte / Section | `#Acte I` |
| `##` | `^##\s*(.+?)\s*$` | Scene / Sous-section | `##Scene 1` |
| `@` | `^@\s*(.+?)\s*$` | Personnage | `@HAMLET` |
| `(…)` ligne | `^\(\s*([^)]+)\s*\)$` | Didascalie (bloc) | `(Il entre)` |
| `(…)` inline | `\(([^)]+)\)` | Didascalie (dans dialogue) | `Bonjour (il sourit)` |
| `(…) texte` | `^\(([^)]+)\)\s*(.+)$` | Pre-replique + dialogue | `(hesitant) Bonjour` |

### Exemple complet input → output

**Input** :
```
#Acte I
##Scene 1
(Un jardin)
@JEAN
(hesitant) Bonjour (il tousse) comment vas-tu ?
(Un temps)
@MARIE
Bien merci
```

**AST** :
```
ROOT
└── SECTION { title: "Acte I" }
    └── SUBSECTION { title: "Scene 1" }
        ├── STAGE_DIRECTION [opening] "Un jardin"
        ├── SPEECH { speaker: "JEAN" }
        │   ├── STAGE_DIRECTION [pre] "hesitant"
        │   └── LINE { speaker: "JEAN" }
        │       ├── TEXT_RUN "Bonjour"
        │       ├── STAGE_DIRECTION [intra] "il tousse"
        │       └── TEXT_RUN "comment vas-tu ?"
        ├── STAGE_DIRECTION [between] "Un temps"
        └── SPEECH { speaker: "MARIE" }
            └── LINE → TEXT_RUN "Bien merci"
```

**HTML** :
```html
<div class="play-root">
  <div class="acte-container">
    <h1 class="acte">Acte I</h1>
    <div class="scene-container">
      <h2 class="scene">Scene 1</h2>
      <p class="didascalie" data-type="opening">Un jardin</p>
      <div class="personnage-container">
        <h3 class="personnage" data-name="JEAN">JEAN</h3>
        <p class="didascalie" data-type="pre">hesitant</p>
        <p class="dialogue" data-speaker="JEAN">
          Bonjour <span class="didascalie" data-type="intra">il tousse</span> comment vas-tu ?
        </p>
      </div>
      <p class="didascalie" data-type="between">Un temps</p>
      <div class="personnage-container">
        <h3 class="personnage" data-name="MARIE">MARIE</h3>
        <p class="dialogue" data-speaker="MARIE">Bien merci</p>
      </div>
    </div>
  </div>
</div>
```

**Structure extraite** :
```js
{ items: [{ type: 'acte', value: 'Acte I', scenes: [{ type: 'scene', value: 'Scene 1' }] }],
  orphanScenes: [],
  personnages: ['JEAN', 'MARIE'] }
```

**Statistiques** :
```js
{ totalActs: 1, totalScenes: 1, totalCharacters: 2, totalRepliques: 2,
  wordCount: 12, estimatedDurationMinutes: 1 /* ceil(wordCount/150) */ }
```

### Structure de l'AST

```js
// playAST.js
const NodeType = {
  ROOT: 'root',
  SECTION: 'section',              // # Acte
  SUBSECTION: 'subsection',        // ## Scene
  SPEECH: 'speech',                // @ Personnage
  STAGE_DIRECTION: 'stage_direction',
  LINE: 'line',                    // Ligne de dialogue
  TEXT_RUN: 'text_run',            // Fragment de texte
  LINE_BREAK: 'line_break'
};

class ASTNode {
  type        // NodeType
  value       // string|null (contenu textuel)
  attributes  // { speaker?, title?, directionType? }
  children    // ASTNode[]
  position    // { start: number, end: number } (lignes, base 0)

  addChild(node) { this.children.push(node); }
  toJSON()       { /* serialisation recursive */ }
}
```

### Pipeline de transformation

```
Texte brut (markup)
       │
  PlayParser.parse()           → AST (arbre ASTNode)    [O(n) lignes]
       │
       ├── astToHTML()         → HTML semantique (classes CSS theatrales)
       ├── extractStructure()  → { items[], orphanScenes[], personnages[] }
       └── calculateStatsFromAST() → { totalActs, totalScenes, totalCharacters,
                                        totalRepliques, wordCount, estimatedDurationMinutes }
```

Orchestre par `usePlayParsing(content, parser)` avec `useMemo` — parse une seule fois, derive tout.

### Les 4 types de didascalies

| Type | Nom | Condition de detection | Balise HTML | Rendu CSS |
|------|-----|----------------------|-------------|-----------|
| **`opening`** | Liminaire | `(texte)` avant tout `@PERSONNAGE` dans le conteneur | `<p class="didascalie" data-type="opening">` | italic, justify, margin 0.8em |
| **`between`** | Inter-replique | `(texte)` apres au moins un SPEECH dans le conteneur | `<p class="didascalie" data-type="between">` | italic, text-align: right, width: fit-content, margin-left: auto |
| **`pre`** | Pre-replique | `(texte)` en premiere ligne apres `@PERSONNAGE` | `<p class="didascalie" data-type="pre">` | display: inline, text-transform: lowercase |
| **`intra`** | Intra-replique | `(texte)` a l'interieur d'une ligne de dialogue | `<span class="didascalie" data-type="intra">` | inline italic, `::before { content: '(' }` `::after { content: ')' }` |

**Algorithme de classification** :
```js
// Contexte suivi par le parser
let hasSpeechInCurrentContainer = false;
let isFirstLineInSpeech = false;

// Standalone (texte)
if (isFirstLineInSpeech)        → 'pre'
else if (!hasSpeechInContainer) → 'opening'
else                            → 'between'

// Inline dans parseLine()      → toujours 'intra'
```

---

## 6. CSS Templates & PDF

### Presets

| ID | Nom | Layout | Format | Police | Marges (T/B/I/O mm) |
|----|-----|--------|--------|--------|----------------------|
| `classique` | Classique | `centered` | A5 148x210mm | EB Garamond, Garamond, serif | 15/20/15/15 |
| `moderne` | Moderne | `inline` | A5 148x210mm | Crimson Text, Georgia, serif | 18/20/15/15 |

Default : `classique`. Fonction `getPreset(id)` avec fallback. `generatePresetCSS(preset)` genere les `:root` variables + `@page` avec valeurs resolues.

### Variables CSS de base (`scenacte-template.css`)

```css
:root {
  --page-width: 148mm;       --page-height: 210mm;
  --margin-top: 20mm;        --margin-bottom: 25mm;
  --margin-inside: 20mm;     --margin-outside: 15mm;
  --font-body: 'Crimson Text', Georgia, serif;
  --font-size-body: 11pt;    --font-size-personnage: 11.5pt;
  --font-size-acte: 18pt;    --font-size-scene: 14pt;
  --line-height: 1.45;
  --space-replique: 0.8em;   --space-acte: 2em;  --space-scene: 1.5em;
  --color-text: #1a1a1a;     --color-subtitle: #555;
}
```

### Conventions typographiques

| Element | Taille | Poids | Casse | Alignement |
|---------|--------|-------|-------|------------|
| Acte | 16-18pt | 900 | UPPERCASE | centre |
| Scene | 13-14pt | 700 | UPPERCASE | centre |
| Personnage | 11-11.5pt | 600 | UPPERCASE | centre ou inline |
| Dialogue | 11pt | 400 | normal | justify |
| Didascalie | 11pt | 400 italic | variable | selon type |
| Numero de page | 10pt | 400 | - | centre bas |
| Running header | 9pt | 400 italic | UPPERCASE | centre haut |

**Polices Google Fonts** : EB Garamond, Crimson Text, Inter, Space Grotesk (avec fallbacks).

### Layouts (`data-layout`)

**`centered`** — Personnage centre, dialogue en dessous :
```css
.play-root[data-layout="centered"] h3.personnage { display: block; text-align: center; }
/* Sans pre-replique : JEAN (seul, centre) */
/* Avec pre-replique : JEAN, hesitant. (inline + virgule via ::after) */
```

**`inline`** — Personnage en ligne avec tiret cadratin :
```css
.play-root[data-layout="inline"] h3.personnage { display: inline; }
/* Sans pre-replique : JEAN. — Bonjour (::after { content: '. \2014\a0 ' }) */
/* Avec pre-replique : JEAN, hesitant. — Bonjour */
```

Les regles utilisent `:has(> .didascalie[data-type="pre"])` pour adapter la ponctuation.

### Integration PagedJS

**Pipeline complet** :
```
1. usePlayParsing()           →  htmlContent (HTML semantique)
2. generatePdfHtml({          →  HTML complet standalone
     htmlContent,
     playTitle, playSubtitle,
     presetId                    # → baseCSS + presetCSS + Google Fonts + PagedJS CDN
   })
3. PdfPreview.jsx             →  Blob URL → <iframe src={blobUrl}>
4. PagedJS (dans l'iframe)    →  Pagination, headers courantes, page breaks
5. Event 'pagedjs-ready'      →  Affichage responsive (scale = min(1, width/pageWidth))
6. printPdf(iframeRef)        →  iframe.contentWindow.print() → dialogue impression
```

**Regles @page** :
```css
@page {
  size: var(--page-width) var(--page-height);
  margin: var(--margin-top) var(--margin-outside) var(--margin-bottom) var(--margin-inside);
  @bottom-center { content: counter(page); }
}
@page :left  { @top-center { content: string(play-title); } }     /* Titre piece */
@page :right { @top-center { content: string(current-acte); }     /* Acte courant */
               @top-right  { content: string(current-scene); } }  /* Scene courante */
@page :first { @bottom-center, @top-center { content: none; } }   /* Page titre sans header */
```

**Scoping preview** : `buildPreviewCSS()` reecrit `body {}` → `.preview-content {}`, supprime `visibility: hidden`.

**Dev tool** : `client/dev-tools/pdf-lab/` — environnement standalone pour tester les templates avec `Paged.Previewer`.

---

## 7. Conventions de code

### Nommage

| Element | Convention | Exemple |
|---------|-----------|---------|
| Composants React | `PascalCase.jsx` | `EditorPage.jsx`, `PlayCard.jsx` |
| Utilitaires | `camelCase.js` | `playParser.js`, `pdfExport.js` |
| Primitives shadcn/ui | `kebab-case.jsx` | `alert-dialog.jsx` |
| Services | `camelCase.service.js` | `plays.service.js` |
| Routes serveur | `camelCase.routes.js` | `auth.routes.js` |
| Controllers | `camelCase.controller.js` | `plays.controller.js` |
| Tests | `*.test.js` (co-localises) | `playParser.test.js` |
| Hooks | `useCamelCase` | `usePlayParsing` |
| Constantes | `UPPER_SNAKE_CASE` | `INACTIVITY_DELAY` |
| Colonnes DB | `snake_case` | `raw_content`, `user_id` |

### Gestion d'erreurs

**Client** :
- `ErrorBoundary` (class component) : `getDerivedStateFromError` + fallback UI avec reload
- `api.js` : 401 → supprime token → dispatch `auth:logout` → AuthContext reset
- Notifications : `sonner` (toast success/error)
- Erreurs parsing : catch silencieux dans `usePlayParsing`, retourne valeurs vides

**Serveur** :
- Classes custom (`BadRequestError`, `NotFoundError`, etc.) avec `statusCode`
- `errorHandler` middleware : gere erreurs PG (23505=unique, 22xxx=validation), pas de stack en prod
- Logging structure avec `pino` (niveaux info/warn/error)
- Validation entrees : fonctions dediees dans `utils/validation.js`

### Tests

**Client (Vitest 4.x)** :
- Env : `jsdom` | Setup : `@testing-library/jest-dom`
- Coverage : `@vitest/coverage-v8`
- 4 fichiers de test, 25+ tests pour le parser

```js
// Pattern : describe nested + instance par test
describe('PlayParser', () => {
  describe('parsing sections (#)', () => {
    it('should parse a single section', () => {
      const parser = new PlayParser();
      const ast = parser.parse('#Acte I');
      expect(ast.children[0].type).toBe(NodeType.SECTION);
      expect(ast.children[0].value).toBe('Acte I');
    });
  });
});
```

**Serveur (Jest 30.x)** :
- Env : `node` | ESM via `--experimental-vm-modules` | `--runInBand`
- Teardown global : fermeture pool PG
- Pattern : supertest + `@faker-js/faker` + cleanup `afterEach`

```js
// Pattern : integration API
describe('POST /api/auth/register', () => {
  afterEach(async () => {
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['test_%']);
  });
  it('devrait creer un nouvel utilisateur', async () => {
    const res = await request(app).post('/api/auth/register').send(userData).expect(201);
    expect(res.body).toHaveProperty('token');
  });
});
```

**Benchmark** : `parser-benchmark.js` — corpus ~500 lignes, 1000 iterations + 10 warmup, mesure moyenne + P95 (ms).

---

## 8. Workflow Git

### Branches

| Branche | Role |
|---------|------|
| `master` | Production |
| `staging` | Pre-production / integration |
| `claude/*` | Branches de travail IA |

### GitHub Actions

**`auto-tag.yml`** — Auto Tag Release on PR merge vers `main` :
```
feat!: ou BREAKING → major (vX+1.0.0)
feat:              → minor (vX.Y+1.0)
autre              → patch (vX.Y.Z+1)
```
Cree un tag git et le push.

### Convention de commits

```
feat: description          # Nouvelle fonctionnalite
fix: description           # Correction de bug
refactor: description      # Refactoring
feat!: / BREAKING          # Breaking change
```

Exemples recents :
```
Refactor: Extract AST model and transformers into separate modules (#114)
fix: ajuster les styles de marges et de police dans les presets PDF
feat: Add SEO files: robots.txt, sitemap.xml, and meta tags (#107)
Implement preset-based PDF template system with PagedJS (#109)
```

### Deploiement (Render)

```yaml
# render.yaml
databases:
  - name: scenacte-db (PostgreSQL free, Frankfurt)
services:
  - type: web  # API Node.js
    buildCommand: npm run install:all && npm run build:client
    startCommand: node server/src/server.js
    healthCheckPath: /api/health
  - type: web  # Frontend static
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: ./client/dist
    routes: [{ type: rewrite, source: /*, destination: /index.html }]
```

Mode monolithique disponible via `SERVE_FRONTEND=true` (le backend sert le frontend build).

---

> *Rapport genere par analyse statique du code source — aucun fichier du projet n'a ete modifie.*
