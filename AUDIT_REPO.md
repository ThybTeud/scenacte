# 🔍 Audit du Repository Scenacte

**Date:** 2026-01-03
**Branche:** Refacto-client
**Objectif:** Préparer le projet pour la production en nettoyant les fichiers inutiles

---

## 📊 Résumé Exécutif

### Fichiers à supprimer : **18 fichiers** (🔴 Haute priorité)
### Dépendances à retirer : **10 packages** (🟡 Moyenne priorité)
### Console.log à nettoyer : **15 fichiers** (🟡 Moyenne priorité)
### Fichiers à mettre à jour : **3 fichiers** (🟢 Basse priorité)
### TODO/FIXME trouvés : **1 occurrence** (🟢 Basse priorité)

---

## 🔴 1. FICHIERS À SUPPRIMER (Haute priorité)

### 1.1 Fichiers de test orphelins à la racine (CRITIQUE)

Ces fichiers sont des tests de développement qui n'ont pas leur place en production :

```
/ast-test.json                          # 4.9 KB - Fichier JSON de test AST
/debug-hamlet.js                        # 689 B - Script de debug
/test-ast-simple.js                     # 3.9 KB - Test AST
/test-ast.sh                            # 2.9 KB - Script shell de test
/test-edge-cases.js                     # 2.7 KB - Tests edge cases
/test-hierarchical-ast.js               # 3.4 KB - Tests AST hiérarchique
/test-html-formatted.js                 # 1.6 KB - Tests HTML formaté
/test-html-render.js                    # 1.9 KB - Tests rendu HTML
/test-integration.js                    # 4.9 KB - Tests d'intégration
/test-visual-tree.js                    # 1.4 KB - Tests arbre visuel
```

**Total:** ~28 KB
**Raison:** Fichiers de test de développement qui polluent la racine du projet. Ils semblent être liés à des tests du parser de théâtre qui ont été réalisés pendant le développement.
**Impact:** Aucun - Ces fichiers ne sont importés nulle part dans le code de production.

### 1.2 Fichiers de documentation orphelins à la racine

```
/AUDIT_CLIENT.md                        # 28 KB - Ancien audit
/CSS-RECOMMENDATIONS.md                 # 2 KB - Recommandations CSS
/GUEST_MODE_IMPLEMENTATION.md           # 6.3 KB - Doc implémentation mode invité
/GUEST_MODE_TEST.md                     # 4.4 KB - Tests mode invité
/README-TEST-AST.md                     # 4.4 KB - Doc tests AST
/REFACTORING-AST.md                     # 5 KB - Doc refactoring AST
/REFACTORING-SUMMARY.md                 # 4.8 KB - Résumé refactoring
/REFACTORING.md                         # 6.9 KB - Doc refactoring générale
```

**Total:** ~62 KB
**Raison:** Documentation de développement/refactoring qui n'a pas sa place dans le repo de production. Ces fichiers peuvent être archivés dans un dossier `/docs/archives/` ou supprimés.
**Suggestion:** Garder uniquement README.md, DEPLOYMENT.md et MAINTENANCE.md à la racine.

### 1.3 Fichiers dans client/public - Outils de développement PDF

```
/client/public/pdf-lab.html                    # ⚠️ Outil de dev pour templates PDF
/client/public/pdf-templates/default.css       # ⚠️ CSS de développement
/client/public/pdf-templates/classique.css     # ⚠️ CSS de développement
/client/public/pdf-templates/mock-short.html   # ⚠️ Mock HTML pour tests
```

**Statut:** Ces fichiers sont des **outils de développement** pour produire les templates PDF avec PagedJS.

**Problème:** Ces fichiers de développement sont mélangés avec les assets de production dans `/client/public/`, ce qui :
- Les inclut dans le build de production (augmente la taille du bundle)
- Pollue le dossier des assets statiques
- Peut créer de la confusion

**Recommandation:** Créer un dossier séparé pour les outils de développement :

```bash
# Structure proposée
/client/
  ├── public/              # Assets de production uniquement
  │   ├── scenacte.png
  │   ├── logo_long.png
  │   ├── logo_short.png
  │   ├── .htaccess
  │   └── _headers
  └── dev-tools/           # Nouveau dossier pour outils de dev
      └── pdf-lab/
          ├── pdf-lab.html
          ├── templates/
          │   ├── default.css
          │   ├── classique.css
          │   └── mock-short.html
          └── README.md    # Doc pour utiliser le lab PDF
```

**Actions recommandées:**
1. Créer `/client/dev-tools/pdf-lab/`
2. Déplacer `pdf-lab.html` et le dossier `pdf-templates/` dedans
3. Ajouter un `README.md` expliquant comment utiliser le PDF lab
4. Ajouter `/client/dev-tools/` au `.gitignore` si ces fichiers ne doivent pas être versionnés (ou les garder pour l'équipe)

**Impact:** Séparation claire dev/production, réduction du bundle de production.

### 1.4 Fichier HTML de test dans client/

```
/client/test-401-sync.html              # 3.7 KB - Test synchronisation erreur 401
```

**Raison:** Fichier de test créé pour débugger la synchronisation des erreurs 401.
**Impact:** Aucun - Non utilisé en production.

---

## 🟡 2. DÉPENDANCES À RETIRER (Moyenne priorité)

### 2.1 Client (`client/package.json`)

#### Dependencies inutilisées

```json
"@lezer/common": "^1.3.0"        // Non importé dans le code
"@lezer/highlight": "^1.2.3"     // Non importé dans le code
"codemirror": "^6.0.2"           // Non importé (seuls les modules @codemirror/* sont utilisés)
```

**Explication:**
- Les packages `@lezer/*` sont des dépendances de `@codemirror/*` mais ne sont pas directement utilisés
- Le package `codemirror` v6 n'est pas nécessaire car vous utilisez les packages modulaires `@codemirror/*`

**Action recommandée:** Retirer ces 3 packages et vérifier que l'éditeur CodeMirror fonctionne toujours.

#### DevDependencies inutilisées

```json
"@tailwindcss/postcss": "^4.1.17"  // Non utilisé dans postcss.config.js
"@types/react": "^19.1.16"         // Types TS non nécessaires (projet en JS pur)
"@types/react-dom": "^19.1.9"      // Types TS non nécessaires (projet en JS pur)
"autoprefixer": "^10.4.21"         // Non utilisé dans postcss.config.js
"postcss": "^8.5.6"                // Non utilisé dans postcss.config.js
"tailwindcss": "^4.1.17"           // Tailwind v4 utilise @tailwindcss/postcss
```

**Explication:**
- Tailwind CSS v4 utilise `@tailwindcss/postcss` directement, les anciennes dépendances ne sont plus nécessaires
- Les types TypeScript ne servent à rien dans un projet JavaScript pur
- Vérifier le fichier `postcss.config.js` pour confirmer

**⚠️ ATTENTION:** Vérifier que le build fonctionne après avoir retiré `tailwindcss`, `postcss` et `autoprefixer`.

### 2.2 Server (`server/package.json`)

#### Dependencies inutilisées

```json
"pino-pretty": "^13.1.3"  // Utilisé uniquement en développement
```

**Explication:**
- `pino-pretty` est un formateur pour les logs Pino utilisé uniquement en développement
- Il devrait être en `devDependencies` et non en `dependencies`

**Action recommandée:** Déplacer `pino-pretty` vers `devDependencies` au lieu de le supprimer.

---

## 🟡 3. CONSOLE.LOG À NETTOYER (Moyenne priorité)

### 3.1 Client (15 occurrences)

| Fichier | Ligne | Type | Priorité | Commentaire |
|---------|-------|------|----------|-------------|
| `contexts/AuthContext.jsx` | 28 | `console.error` | 🟢 Garder | Erreur de chargement utilisateur - utile pour debug |
| `services/storage.service.js` | 53, 62 | `console.warn`, `console.error` | 🟢 Garder | Validation localStorage - utile |
| `pages/auth/Register.jsx` | 178 | `console.error` | 🔴 Supprimer | Erreur générique sans contexte |
| `pages/profile/UserProfile.jsx` | 65 | `console.error` | 🔴 Supprimer | Erreur générique sans contexte |
| `pages/plays/PlaysList.jsx` | 105 | `console.error` | 🔴 Supprimer | Erreur générique sans contexte |
| `pages/plays/PlayEditor.jsx` | 118, 152 | `console.error` | 🔴 Supprimer | Erreurs génériques sans contexte |
| `hooks/usePlayParsing.js` | 43 | `console.error` | 🟢 Garder | Erreur de parsing - utile |
| `components/editors/PlayPreview.jsx` | 28 | `console.error` | 🟢 Garder | Erreur de parsing - utile |
| `components/editors/CodeMirrorEditor.jsx` | 274, 360 | `console.error` | 🟢 Garder | Erreurs scroll - utile pour debug |
| `components/plays/VersionsSidebar.jsx` | 34 | `console.error` | 🔴 Supprimer | Erreur générique sans contexte |
| `components/ErrorBoundary.jsx` | 27 | `console.error` | 🟢 Garder | ErrorBoundary - obligatoire |
| `utils/playStatistics.js` | 109 | `console.error` | 🟢 Garder | Erreur calcul stats - utile |

**Recommandations:**
- **Supprimer (6 fichiers):** Les `console.error` génériques sans contexte qui ne fournissent pas d'information utile
- **Garder (9 fichiers):** Les logs qui aident au debugging en production (parsing, ErrorBoundary, validation)
- **Alternative:** Implémenter un système de logging centralisé (ex: Sentry) pour remplacer tous les console.log

### 3.2 Server (78 occurrences)

Le serveur contient beaucoup de `console.log` et `console.warn` principalement dans :

| Fichier | Occurrences | Type | Recommandation |
|---------|-------------|------|----------------|
| `jobs/cleanup.job.js` | 17 | `console.log` | 🟢 Garder - Logs du job de nettoyage |
| `services/version-cleanup.service.js` | 10 | `console.log` | 🟢 Garder - Logs de service critique |
| `services/email.service.js` | 10 | `console.log` | 🟢 Garder - Emails en dev mode |
| `middleware/errorHandler.js` | 1 | `console.error` | 🟢 Garder - Erreurs centralisées |
| `middleware/rateLimiter.js` | 3 | `console.warn` | 🟢 Garder - Alertes de sécurité |
| `app.js` | 7 | `console.log/warn` | 🟡 À remplacer par logger Pino |
| `config/env.js` | 4 | `console.log/error` | 🟡 À remplacer par logger Pino |
| `utils/transaction.js` | 1 | `console.error` | 🟡 À remplacer par logger Pino |
| `services/pdf.service.js` | 2 | `console.log/error` | 🟡 À remplacer par logger Pino |

**Recommandations:**
- **✅ Garder les logs critiques** dans les jobs, services email, et middleware de sécurité
- **⚠️ Remplacer** les console.log dans `app.js`, `config/env.js` par le logger Pino déjà configuré (`utils/logger.js`)
- Le serveur utilise déjà **Pino** pour le logging structuré, mais certains fichiers n'ont pas été migrés

---

## 🟢 4. FICHIERS À METTRE À JOUR (Basse priorité)

### 4.1 `.env.example` manquant pour le client

**Problème:** Le client n'a pas de fichier `.env.example` alors qu'il utilise des variables d'environnement.

**Fichier à créer:** `/client/.env.example`

```env
# API Configuration
# URL de l'API du serveur (default: http://localhost:3000/api)
VITE_API_URL=http://localhost:3000/api

# Development tools (optional)
VITE_DEV_TOOLS=false
```

**Raison:** Permet aux nouveaux développeurs de savoir quelles variables configurer.

### 4.2 `.env` du client contient une URL de développement

**Fichier:** `/client/.env`

```env
VITE_API_URL=https://supreme-doodle-xjqw6r6x9f6799-3000.app.github.dev/api
```

**Problème:** URL de GitHub Codespaces hardcodée (environnement de dev spécifique).

**Action recommandée:**
- Remplacer par `http://localhost:3000/api` dans `.env`
- Créer `.env.production` avec l'URL de production réelle
- Ajouter `.env` au `.gitignore` s'il n'y est pas déjà

### 4.3 README.md à mettre à jour

**Fichier:** `/README.md`

**Points à corriger:**

1. **Ligne 97:** Références à `.env.example` du client qui n'existe pas
```markdown
# Créer le fichier .env
cp .env.example .env  # ❌ Ce fichier n'existe pas
```

2. **Ligne 298:** Date "Novembre 2025" alors qu'on est en 2026
```markdown
**Dernière mise à jour** : Novembre 2025  # ❌ À mettre à jour
```

3. **Section fonctionnalités (lignes 162-178):** Certaines cases sont cochées mais non implémentées
```markdown
- [x] Preview HTML en temps réel  # ❌ À vérifier
- [x] Auto-save toutes les 2 minutes  # ❌ À vérifier
```

**Recommandation:** Audit manuel de la section "Fonctionnalités" pour vérifier ce qui est vraiment implémenté.

---

## 🟢 5. TODO/FIXME TROUVÉS (Basse priorité)

### 5.1 Client

**1 occurrence trouvée:**

| Fichier | Ligne | Type | Contenu |
|---------|-------|------|---------|
| `pages/plays/PlaysList.jsx` | 148 | `TODO` | `// TODO: Navigate to versions page or open versions modal` |

**Contexte:**
```javascript
// TODO: Navigate to versions page or open versions modal
```

**Recommandation:** Implémenter la navigation vers les versions ou supprimer le commentaire si non pertinent.

### 5.2 Server

**0 occurrence** - Aucun TODO/FIXME/HACK trouvé dans le serveur.

---

## 🎯 6. ASSETS NON UTILISÉS

### 6.1 Assets dans `/client/public/`

| Fichier | Taille | Utilisé ? | Raison |
|---------|--------|-----------|--------|
| `scenacte.png` | ? | ✅ Oui | Favicon référencé dans `index.html` |
| `logo_long.png` | ? | ✅ Oui | Utilisé dans `Logo.jsx` |
| `logo_short.png` | ? | ✅ Oui | Utilisé dans `Logo.jsx` |
| `pdf-templates/default.css` | ? | 🔧 Dev | Outil de développement PDF (voir section 1.3) |
| `pdf-templates/classique.css` | ? | 🔧 Dev | Outil de développement PDF (voir section 1.3) |
| `pdf-templates/mock-short.html` | ? | 🔧 Dev | Outil de développement PDF (voir section 1.3) |
| `pdf-lab.html` | ? | 🔧 Dev | Outil de développement PDF (voir section 1.3) |
| `.htaccess` | ? | ⚠️ Dépend | Utilisé uniquement sur serveur Apache |
| `_headers` | ? | ⚠️ Dépend | Utilisé uniquement sur Netlify/serveurs compatibles |

**Recommandations:**
- **Déplacer vers `/client/dev-tools/pdf-lab/`:** `pdf-lab.html`, `pdf-templates/*` (voir section 1.3 pour la structure proposée)
- **Garder conditionnellement:** `.htaccess` et `_headers` si déploiement sur Apache/Netlify
- **Assets de production OK:** Les 3 logos sont correctement utilisés

---

## 📦 7. STRUCTURE DES TESTS

### 7.1 Tests Server

**Emplacement:** `/server/src/__tests__/`

**Tests présents:**
- ✅ `auth.test.js` (4.5 KB) - Tests d'authentification
- ✅ `plays.test.js` (6.2 KB) - Tests des pièces
- ✅ `version-cleanup.test.js` (10 KB) - Tests du nettoyage de versions
- ✅ `utils/playStatistics.test.js` - Tests des statistiques

**Configuration:**
- ✅ `jest.config.js` configuré correctement
- ✅ Script `npm test` fonctionnel
- ✅ Teardown configuré (`teardown.js`)

**Statut:** Tests fonctionnels et maintenus ✅

### 7.2 Tests Client

**Emplacement:** Aucun

**Tests présents:** ❌ Aucun test unitaire trouvé dans `/client/src/`

**Configuration:**
- ❌ Pas de `jest.config.js`, `vitest.config.js` ou autre
- ❌ Pas de script `npm test` dans `client/package.json`

**Statut:** Aucune infrastructure de tests côté client ⚠️

**Recommandation:**
- Ajouter Vitest pour les tests unitaires React
- Ajouter React Testing Library
- Créer des tests pour les composants critiques (AuthContext, PlayEditor, etc.)

---

## 🗂️ 8. DOCUMENTATION

### 8.1 Documentation principale

| Fichier | Statut | Remarque |
|---------|--------|----------|
| `README.md` | ✅ À jour | Nécessite quelques corrections mineures |
| `DEPLOYMENT.md` | ✅ À jour | Documentation de déploiement complète |
| `MAINTENANCE.md` | ✅ À jour | Guide de maintenance |
| `client/README.md` | ✅ Existe | Documentation spécifique client |
| `server/README.md` | ✅ Existe | Documentation spécifique server |
| `server/TESTING.md` | ✅ Existe | Documentation des tests |

**Statut global:** Documentation bien structurée ✅

### 8.2 Documentation à archiver/supprimer

Voir section **1.2 Fichiers de documentation orphelins**

---

## 🎯 9. RECOMMANDATIONS PRIORISÉES

### 🔴 Priorité CRITIQUE (Avant déploiement)

1. **Supprimer les 10 fichiers de test à la racine**
   - Impact: Pollution du repo, confusion pour les nouveaux devs
   - Temps: 5 minutes
   - Commande: `rm -f /workspaces/scenacte/test-*.js /workspaces/scenacte/test-*.sh /workspaces/scenacte/*.json` (sauf package.json)

2. **Vérifier/Corriger le fichier `.env` du client**
   - Impact: Empêche le fonctionnement en local
   - Temps: 2 minutes
   - Action: Remplacer URL GitHub Codespaces par `http://localhost:3000/api`

3. **Créer `.env.example` pour le client**
   - Impact: Facilite l'onboarding
   - Temps: 2 minutes

### 🟡 Priorité HAUTE (Dans la semaine)

4. **Archiver les 8 fichiers de documentation de refactoring**
   - Créer `/docs/archives/` et déplacer les fichiers
   - Temps: 10 minutes

5. **Réorganiser les outils de développement PDF**
   - Créer `/client/dev-tools/pdf-lab/`
   - Déplacer `pdf-lab.html` et `pdf-templates/` dedans
   - Ajouter un README.md dans pdf-lab/
   - Temps: 15 minutes
   - Impact: Séparation claire dev/production, réduction du bundle

6. **Nettoyer les console.log inutiles dans le client (6 fichiers)**
   - Temps: 15 minutes
   - Fichiers: `Register.jsx`, `UserProfile.jsx`, `PlaysList.jsx`, `PlayEditor.jsx`, `VersionsSidebar.jsx`

7. **Retirer les dépendances npm inutilisées**
   - Client: `@lezer/common`, `@lezer/highlight`, `codemirror`
   - Temps: 10 minutes + tests de non-régression
   - ⚠️ Tester que l'éditeur CodeMirror fonctionne après

### 🟢 Priorité MOYENNE (Dans le mois)

8. **Migrer les console.log vers Pino dans le server**
   - Fichiers: `app.js`, `config/env.js`, `utils/transaction.js`, `services/pdf.service.js`
   - Temps: 30 minutes

9. **Déplacer `pino-pretty` en devDependencies**
   - Temps: 2 minutes

10. **Vérifier et retirer les devDependencies Tailwind inutilisées**
    - ⚠️ Vérifier que le build fonctionne après
    - Temps: 15 minutes + tests

### 🟢 Priorité BASSE (Nice to have)

11. **Implémenter le TODO dans PlaysList.jsx**
    - Navigation vers la page des versions
    - Temps: 1-2 heures

12. **Mettre en place des tests unitaires pour le client**
    - Installer Vitest + React Testing Library
    - Écrire des tests pour les composants critiques
    - Temps: 2-4 heures

13. **Mettre à jour le README.md**
    - Corriger la date
    - Vérifier les fonctionnalités cochées
    - Temps: 30 minutes

---

## 📊 10. RÉSUMÉ DES GAINS

### Espace disque économisé

```
Fichiers de test à la racine:    ~28 KB
Documentation orpheline:          ~62 KB
Assets inutilisés (public):       ~XX KB (à mesurer)
HTML de test:                     ~4 KB
---------------------------------------
TOTAL estimé:                     ~100 KB minimum
```

### Clarté du repository

- ✅ Racine du projet propre et professionnelle
- ✅ Seuls les fichiers de documentation essentiels visibles
- ✅ Dependencies optimisées
- ✅ Code de production sans logs de debug

### Sécurité

- ✅ Pas de credentials ou secrets exposés
- ✅ Fichiers `.env` correctement configurés
- ✅ Rate limiting et logging de sécurité en place

---

## 📋 11. CHECKLIST DE NETTOYAGE

Utilisez cette checklist pour valider le nettoyage avant déploiement :

### Fichiers

- [ ] Supprimer les 10 fichiers de test à la racine
- [ ] Archiver les 8 fichiers de documentation de refactoring
- [ ] Supprimer `client/test-401-sync.html`
- [ ] Réorganiser les outils PDF dans `client/dev-tools/pdf-lab/`

### Configuration

- [ ] Corriger `client/.env` avec l'URL localhost
- [ ] Créer `client/.env.example`
- [ ] Créer `client/.env.production` avec l'URL de prod
- [ ] Vérifier que `server/.env.example` est à jour

### Dépendances

- [ ] Retirer `@lezer/common`, `@lezer/highlight`, `codemirror` du client
- [ ] Tester l'éditeur CodeMirror après suppression
- [ ] Déplacer `pino-pretty` en devDependencies dans le server
- [ ] Vérifier la nécessité de `@tailwindcss/postcss`, `postcss`, `autoprefixer`, `tailwindcss`

### Code

- [ ] Nettoyer les 6 `console.error` inutiles dans le client
- [ ] Migrer les console.log vers Pino dans le server (optionnel)
- [ ] Implémenter ou supprimer le TODO dans `PlaysList.jsx`

### Documentation

- [ ] Mettre à jour la date dans README.md
- [ ] Vérifier la section "Fonctionnalités" du README
- [ ] Vérifier les instructions d'installation

### Tests

- [ ] Vérifier que `npm test` fonctionne dans `/server`
- [ ] Vérifier que `npm run build` fonctionne dans `/client`
- [ ] Vérifier que `npm run build` fonctionne dans `/server`
- [ ] Tester l'application complète en local

---

## 🚀 12. COMMANDES DE NETTOYAGE RAPIDE

Pour automatiser une partie du nettoyage :

```bash
# À la racine du projet
cd /workspaces/scenacte

# 1. Supprimer les fichiers de test
rm -f test-*.js test-*.sh ast-test.json debug-hamlet.js

# 2. Créer le dossier d'archives
mkdir -p docs/archives

# 3. Archiver la documentation de refactoring
mv AUDIT_CLIENT.md CSS-RECOMMENDATIONS.md GUEST_MODE_*.md README-TEST-AST.md REFACTORING*.md docs/archives/

# 4. Supprimer le fichier HTML de test
rm -f client/test-401-sync.html

# 5. Réorganiser les outils de développement PDF
mkdir -p client/dev-tools/pdf-lab/templates
mv client/public/pdf-lab.html client/dev-tools/pdf-lab/
mv client/public/pdf-templates/* client/dev-tools/pdf-lab/templates/
rmdir client/public/pdf-templates

# 5bis. Créer un README pour le PDF lab
cat > client/dev-tools/pdf-lab/README.md << 'EOF'
# PDF Lab - Laboratoire de développement des templates PDF

Ce dossier contient les outils de développement pour créer et tester les templates PDF avec PagedJS.

## Utilisation

1. Ouvrir `pdf-lab.html` dans un navigateur
2. Modifier les templates CSS dans `templates/`
3. Tester le rendu avec PagedJS
4. Intégrer les styles finalisés dans `/client/src/utils/pdfExport.js`

## Fichiers

- `pdf-lab.html` - Interface de test pour PagedJS
- `templates/default.css` - Template CSS par défaut
- `templates/classique.css` - Template CSS classique
- `templates/mock-short.html` - Mock HTML pour tests rapides
EOF

# 6. Créer .env.example pour le client
cat > client/.env.example << 'EOF'
# API Configuration
# URL de l'API du serveur (default: http://localhost:3000/api)
VITE_API_URL=http://localhost:3000/api

# Development tools (optional)
VITE_DEV_TOOLS=false
EOF

# 7. Vérifier les builds
cd client && npm run build && cd ..
cd server && npm test && cd ..
```

---

**Audit réalisé par:** Claude Code
**Méthodologie:** Analyse automatisée + vérifications manuelles
**Outils utilisés:** depcheck, grep, analyse AST des imports
