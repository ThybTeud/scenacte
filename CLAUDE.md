# Scenacte — Contexte Claude Code

> Éditeur de théâtre accessible — fullstack React + Express + PostgreSQL
> Développeur : Benjamin (seul mainteneur) | Licence : MIT | URL : scenacte.fr

---

## Stack

React 19 + Vite 7 + TailwindCSS v4 + shadcn/ui | Express 4 + PostgreSQL (Neon) | PagedJS 0.4.3
Tests : Vitest (client) + Jest (serveur) | Déploiement : Render

## Architecture

```
client/src/  → components/ config/ contexts/ hooks/ pages/ services/ utils/
server/src/  → controllers/ config/ db/ middleware/ routes/ services/ utils/
```

## Conventions de code

### Nommage
- Composants : `PascalCase.jsx` | Utilitaires : `camelCase.js` | shadcn/ui : `kebab-case.jsx`
- Services : `camelCase.service.js` | Controllers : `camelCase.controller.js` | Routes : `camelCase.routes.js`
- Hooks : `useCamelCase` | Constantes : `UPPER_SNAKE_CASE` | Colonnes DB : `snake_case`

### Patterns
- **Imports** : toujours `@/` pour les imports hors du dossier courant (`@/` → `client/src/`). Jamais de mix avec chemins relatifs `../../`.
- **Barrel exports** pour `modals/` et `sidebar/`
- **Context unique** : `AuthContext` — pas de Redux/Zustand
- **Service layer** : `storageService` bascule localStorage (invité) / API (connecté)
- **Erreurs client** : `ErrorBoundary`, 401 → `auth:logout` event, toasts `sonner`
- **Erreurs serveur** : classes custom (`BadRequestError`, `NotFoundError`…), `errorHandler` middleware, `pino`

### Tests
- Client : Vitest + Testing Library, env `jsdom`, `describe` imbriqués
- Serveur : Jest + Supertest + faker, ESM (`--experimental-vm-modules`), cleanup `afterEach`

## Workflow Git

- Branches : `main` (prod), `staging` (intégration), `claude/*` (travail IA)
- Commits conventionnels : `feat:`, `fix:`, `refactor:`, `feat!:` (breaking)
- Auto-tag sur merge vers main (feat!=major, feat=minor, autre=patch)
- Toujours travailler sur une branche `claude/*`, jamais push direct sur staging/main

## Design system

- Style : néo-brutaliste adouci, bordures noires épaisses, ombres plates, radius 4px
- Primary : rose-600 `oklch(71.2% 0.194 13.428)` | Fond : crème `#f8f5f2` | Texte : `#0f172a`
- UI : exclusivement shadcn/ui + Tailwind. Pas de composants custom hors shadcn.
- Polices : Inter/Space Grotesk (UI), Crimson Text/Georgia (théâtre), Source Code Pro/Fira Code (éditeur)
- CodeMirror : rose pour `#`/`##`, bleu pour `@`

## Règles importantes

1. **RGPD** : conformité requise
2. **PagedJS** : choix définitif pour PDF
3. **Didascalies** : 4 types verrouillés (opening, between, pre, intra). Parenthèses en CSS, jamais dans le contenu
4. **Parser** : debounce 300ms, O(n) lignes. Refonte en cours.
5. **Versioning auto** : inactivité 10min, seuil 500 chars, session_close

## Documentation détaillée

Pour les détails complets, consulter les skills dans `docs/skills/` :
- `SCENACTE_PARSER_SKILL.md` — syntaxe markup, AST, pipeline, 4 types de didascalies
- `SCENACTE_CSS_PDF_SKILL.md` — presets PDF, conventions typo, layouts, pipeline PagedJS
- `PAGEDJS_SKILL.md` — API PagedJS, hooks, CSS Paged Media, web component `<paged-page>`
