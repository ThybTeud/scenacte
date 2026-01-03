# Audit de la codebase client - Scenacte

**Date**: 2 janvier 2026
**Périmètre**: `client/src/` (56 fichiers)
**Contexte**: Pré-production, maintenance solo

---

## Résumé exécutif

### Points forts
- Architecture bien structurée avec séparation claire des responsabilités
- Abstraction propre du mode invité via `storage.service.js`
- Hooks customs bien conçus et réutilisables
- Patterns React 19 modernes (hooks, forwardRef, useImperativeHandle)
- Code UI cohérent avec design system neobrutalist

### Points critiques à corriger AVANT production
1. **Gestion d'erreur inexistante** dans les composants UI
2. **Logique de sauvegarde automatique absente** malgré infrastructure présente
3. **Logique d'authentification redondante** entre PrivateRoute et AuthContext
4. **Parser instancié à chaque render** dans PlayEditor (performance)
5. **Absence totale de tests**

### Dette technique acceptable (post-production)
- Duplication de logique de parsing (stats vs structure)
- Fonctionnalité Undo/Redo non implémentée (boutons désactivés)
- Console.log/error à nettoyer
- Optimisations CodeMirror possibles

---

## 1. Architecture globale

### Constat

```
client/src/
├── components/       # 35 fichiers
│   ├── editors/      # CodeMirror + panels (4)
│   ├── icons/        # SVG inline (2)
│   ├── layout/       # Headers (3)
│   ├── pdf/          # Export PDF (2)
│   ├── plays/        # Versions sidebar (1)
│   ├── routing/      # PrivateRoute (1)
│   └── ui/           # Design system (15)
├── contexts/         # AuthContext (1)
├── hooks/            # 5 hooks customs
├── pages/            # 10 pages (auth, plays, profile, preferences)
├── services/         # 6 services (API, auth, plays, storage, users, versions)
└── utils/            # 4 utilitaires (cn, pdfExport, playParser, playStatistics)
```

**Organisation**: Excellente séparation. Pas de fichiers orphelins détectés.

**Tailles des fichiers critiques**:
- `CodeMirrorEditor.jsx`: 508 lignes ⚠️
- `PlayEditor.jsx`: 448 lignes ⚠️
- `PlaysList.jsx`: 412 lignes ⚠️
- `playParser.js`: 411 lignes ⚠️
- `storage.service.js`: 222 lignes ✅

### Problèmes

1. **CodeMirrorEditor trop monolithique** (508 lignes)
   - Mélange configuration, thème, extensions, et logique métier
   - Fonction `toggleLineFormat` (125 lignes) devrait être externalisée
   - Logique d'autocomplétion inline alors qu'elle pourrait être un module

2. **PlayEditor.jsx avec trop de responsabilités**
   - Gestion d'état (10+ useState)
   - Logique de sauvegarde
   - Logique responsive
   - Menu items construction
   - **Problème de performance**: `parser` instancié via `useMemo(() => new PlayParser(), [])` mais ne bénéficie pas du cache si recréé

3. **Duplication entre playParser et playStatistics**
   - `calculatePlayStatistics` reparse l'AST alors qu'il est déjà calculé dans `usePlayParsing`
   - Double instanciation de `PlayParser`

### Recommandations

| Priorité | Action | Impact |
|----------|--------|--------|
| **HAUTE** | Extraire `toggleLineFormat` de CodeMirrorEditor dans `utils/editorCommands.js` | Maintenabilité |
| **MOYENNE** | Refactorer PlayEditor: séparer la logique de sauvegarde dans un hook `useAutoSave` | Testabilité, réutilisabilité |
| **MOYENNE** | Fusionner la logique de parsing: calculer les stats depuis l'AST existant au lieu de reparser | Performance |
| **BASSE** | Décomposer CodeMirrorEditor en modules (extensions, thème, config) | Lisibilité |

---

## 2. Flux de données

### Constat

**Architecture du flux**:
```
API (fetch)
  ↓
services/*.service.js (abstraction HTTP)
  ↓
storage.service.js (switch localStorage/API selon mode invité)
  ↓
contexts/AuthContext (état global auth)
  ↓
hooks/useAuth (accès simplifié au context)
  ↓
pages/* (orchestration)
  ↓
components/* (présentation)
```

**Points positifs**:
- Abstraction claire localStorage/API via `storage.service.js`
- Pattern service bien implémenté
- Pas de props drilling excessif détecté
- Context utilisé judicieusement (uniquement pour auth)

### Problèmes

1. **Double détection du mode invité** ([api.js:5](client/src/services/api.js#L5) + [storage.service.js:11](client/src/services/storage.service.js#L11))
   - `storage.service.isGuest()` vérifie `!localStorage.getItem('token')`
   - `api.js` vérifie aussi `localStorage.getItem('token')`
   - Potentiel désynchronisation si l'un change sans l'autre

2. **Gestion des erreurs 401 dans api.js incohérente**
   ```javascript
   if (response.status === 401) {
     localStorage.removeItem('token');
     // Ne déclenche PAS de mise à jour du AuthContext
   }
   ```
   - Le token est nettoyé localement mais `AuthContext` garde l'ancien état
   - Nécessite un refresh de page pour synchroniser

3. **Incohérence de structure de réponse** ([PlaysList.jsx:107-117](client/src/pages/plays/PlaysList.jsx#L107-L117))
   ```javascript
   // Mode API: { play: {...} }
   // Mode invité: {...}
   const playId = response.play?.id || response.id;
   ```
   - Nécessite du code défensif partout
   - Source d'erreurs futures

4. **Sauvegarde automatique non implémentée**
   - Infrastructure présente ([PlayEditor.jsx:64](client/src/pages/plays/PlayEditor.jsx#L64): `saveTimeoutRef`)
   - Jamais utilisée (le timeout n'est jamais setté)
   - Comportement attendu : sauvegarder après X secondes d'inactivité

### Recommandations

| Priorité | Action | Impact |
|----------|--------|--------|
| **CRITIQUE** | Normaliser les réponses API dans `storage.service` pour toujours retourner `{ play: {...} }` | Robustesse, évite bugs |
| **CRITIQUE** | Implémenter la sauvegarde auto dans PlayEditor (debounced, après 2s) | UX, perte de données |
| **HAUTE** | Déclencher `logout()` du AuthContext lors d'un 401 au lieu de juste nettoyer le token | Cohérence state |
| **MOYENNE** | Centraliser la détection du mode invité dans AuthContext (source unique de vérité) | Maintenabilité |

---

## 3. Logique métier

### Constat

**Distribution de la logique**:

| Logique | Emplacement | Verdict |
|---------|-------------|---------|
| Parsing théâtre | `utils/playParser.js` | ✅ Bien isolé |
| Statistiques | `utils/playStatistics.js` | ⚠️ Redondant avec parser |
| Export PDF | `utils/pdfExport.js` | ✅ Utilitaire pur |
| Gestion auth | `services/auth.service.js` + `AuthContext.jsx` | ✅ Séparé proprement |
| Gestion storage | `services/storage.service.js` | ✅ Abstraction propre |
| Édition texte | `CodeMirrorEditor.jsx` (fonction `toggleLineFormat`) | ❌ Devrait être dans utils |
| Synchronisation scroll | `useSyncScroll.js` | ✅ Hook bien conçu |
| Debouncing | `useDebouncedValue.js` | ✅ Hook réutilisable |

### Problèmes

1. **Logique de formatage de ligne dans le composant**
   - 125 lignes de switch/case dans CodeMirrorEditor ([lignes 376-500](client/src/components/editors/CodeMirrorEditor.jsx#L376-L500))
   - Non testable unitairement
   - Duplication potentielle si besoin ailleurs

2. **Calcul de statistiques inefficace**
   - [playStatistics.js:22](client/src/utils/playStatistics.js#L22): Reparse tout le document
   - Alors que `usePlayParsing` a déjà l'AST disponible
   - Double travail inutile

3. **Logique de navigation dans RightPanel**
   - [RightPanel.jsx:6-73](client/src/components/editors/RightPanel.jsx#L6-L73): `findActiveSection` (67 lignes)
   - Devrait être dans `utils/playNavigation.js`
   - Actuellement non réutilisable

4. **Parsing appelé deux fois par render dans PlayEditor**
   ```javascript
   const parser = useMemo(() => new PlayParser(), []); // ligne 84
   const { structure, statistics, htmlContent } = usePlayParsing(debouncedContent, parser);
   ```
   - `usePlayParsing` appelle `parser.parse(content)` (ligne 29)
   - `calculatePlayStatistics` recrée un parser et repasse (ligne 21-22 de playStatistics.js)

### Recommandations

| Priorité | Action | Impact |
|----------|--------|--------|
| **HAUTE** | Calculer les statistiques depuis l'AST existant au lieu de reparser | Performance -50% temps parsing |
| **HAUTE** | Extraire `toggleLineFormat` dans `utils/editorCommands.js` | Testabilité |
| **MOYENNE** | Extraire `findActiveSection` dans `utils/playNavigation.js` | Réutilisabilité |
| **BASSE** | Créer un cache de parsing si même contenu parsé plusieurs fois | Performance marginale |

---

## 4. Qualité du code

### 4.1 Patterns React

**Bons patterns détectés**:
- ✅ Hooks customs bien nommés et focalisés (`useAuth`, `usePlayParsing`, `useSyncScroll`, etc.)
- ✅ `useMemo` utilisé pour éviter recalculs (PlayEditor ligne 84, 93)
- ✅ `useCallback` pour stabiliser les refs de fonctions
- ✅ `forwardRef` + `useImperativeHandle` pour exposer API éditor (CodeMirrorEditor)
- ✅ Composants fonctionnels purs (UI components)
- ✅ Props destructuring cohérent

**Problèmes détectés**:

1. **useEffect sans cleanup dans LeftPanel**
   - [LeftPanel.jsx:71-72](client/src/components/editors/LeftPanel.jsx#L71-L72): Props `canUndo`/`canRedo` jamais utilisées (commentées)
   - Boutons Undo/Redo toujours actifs alors qu'ils ne font rien

2. **Logique conditionnelle redondante dans PrivateRoute**
   ```javascript
   // Ligne 13-14
   if (!isAuthenticated && !allowGuest) return <Navigate to="/login" />;

   // Ligne 18-19
   if (!isAuthenticated && allowGuest && isGuest) return children;

   // Ligne 23-24
   if (isAuthenticated) return children;
   ```
   - Le dernier `if` est inutile : si on arrive là, c'est qu'on est authentifié
   - Peut être simplifié en 2 branches au lieu de 4

3. **État local dupliqué pour le parsing**
   - PlayEditor stocke `content` (ligne 58)
   - PlayEditor crée `debouncedContent` (ligne 87)
   - `usePlayParsing` ne retourne pas `isParsing`, dérivé manuellement (ligne 90)

4. **Menu items recalculés à chaque render dans PlaysList**
   - [PlaysList.jsx:39-66](client/src/pages/plays/PlaysList.jsx#L39-L66): Pas dans `useMemo`, recréé à chaque render
   - Même problème dans PlayEditor ([ligne 30-55](client/src/pages/plays/PlayEditor.jsx#L30-L55))

5. **Refs de scroll exposées mais mal typées**
   - `editorScrollRef.current.scrollToLine` appelé sans vérifier si la méthode existe
   - Devrait utiliser TypeScript ou au moins PropTypes

### 4.2 Gestion des erreurs

**État actuel**: ⚠️ **Très faible**

**Bonnes pratiques**:
- ✅ Try/catch dans `usePlayParsing` (ligne 27-50)
- ✅ Try/catch dans tous les appels API (pages)
- ✅ Messages d'erreur utilisateur via `toast.error()`

**Problèmes critiques**:

1. **Pas d'Error Boundary**
   - Si un composant crash, toute l'app plante
   - Critique pour CodeMirrorEditor (complexe, intègre lib externe)

2. **Erreurs silencieuses dans CodeMirrorEditor**
   ```javascript
   // Ligne 273
   } catch (error) {
     console.error('Error scrolling to line:', error);
   }
   ```
   - L'utilisateur ne voit rien si scroll échoue
   - Pas de fallback

3. **401 géré localement sans notification**
   - [api.js:20-25](client/src/services/api.js#L20-L25): Token expiré nettoyé en silence
   - L'utilisateur n'est pas averti qu'il a été déconnecté

4. **Pas de gestion d'erreur réseau/offline**
   - Si `fetch` échoue (réseau coupé), erreur générique
   - Mode invité devrait continuer à fonctionner

### 4.3 Nommage et lisibilité

**Bon**:
- Variables explicites (`currentLine`, `showPreview`, `isLoading`)
- Fonctions verbes (`handleContentChange`, `fetchPlays`, `toggleFormat`)
- Composants en PascalCase, fichiers matchent

**Améliorable**:
- `cn.js`: nom cryptique pour une fonction de merge de classes (devrait être `classNames` ou `mergeClasses`)
- `playParser.js`: classe `ASTNode` trop générique (devrait être `PlayASTNode`)
- Variables abrégées dans boucles (`a`, `s` dans RightPanel ligne 18-40)

### 4.4 Complexité

**Fichiers avec complexité élevée**:

| Fichier | Lignes | Complexité | Raison |
|---------|--------|------------|--------|
| `CodeMirrorEditor.jsx` | 508 | Élevée | Switch/case 125 lignes, configuration inline |
| `PlayEditor.jsx` | 448 | Moyenne | Beaucoup d'état local, mais bien organisé |
| `playParser.js` | 411 | Moyenne | Algorithme de parsing, normal pour un parser |
| `PlaysList.jsx` | 412 | Faible | Beaucoup de markup, logique simple |
| `storage.service.js` | 222 | Faible | Switch simple localStorage/API |

**Fonctions trop longues**:
- `CodeMirrorEditor.toggleLineFormat`: 125 lignes → devrait être 5 fonctions
- `RightPanel.findActiveSection`: 67 lignes → extraire en utilitaire

### Recommandations

| Priorité | Action | Impact |
|----------|--------|--------|
| **CRITIQUE** | Ajouter ErrorBoundary autour de PlayEditor et CodeMirrorEditor | Robustesse production |
| **CRITIQUE** | Notifier l'utilisateur lors d'une déconnexion 401 | UX |
| **HAUTE** | Simplifier PrivateRoute (2 branches au lieu de 4) | Lisibilité |
| **HAUTE** | Mémoriser `menuItems` avec useMemo dans PlaysList et PlayEditor | Performance |
| **MOYENNE** | Renommer `cn.js` en `classNames.js` | Clarté |
| **BASSE** | Ajouter PropTypes ou migrer vers TypeScript | Safety |

---

## 5. Fichiers critiques - Analyse détaillée

### 5.1 CodeMirrorEditor.jsx (508 lignes)

**Points forts**:
- ✅ API propre exposée via `useImperativeHandle`
- ✅ Intégration CodeMirror bien maîtrisée
- ✅ Autocomplétion personnalisée fonctionnelle
- ✅ Thème inline bien organisé

**Points faibles**:
- ❌ **Fonction `toggleLineFormat` monolithique** (125 lignes)
  - 4 switch cases identiques
  - Logique de nettoyage dupliquée 4 fois
  - Devrait être décomposée en :
    ```javascript
    utils/editorCommands.js:
      - cleanLineMarkup(text)
      - applyActeFormat(text)
      - applyPersonnageFormat(text)
      - applyDidascalieFormat(text)
      - toggleLineFormat(text, formatType)
    ```
- ❌ **Thème CSS défini inline** (lignes 62-141)
  - 80 lignes de config CSS dans le composant
  - Devrait être dans un fichier séparé `themes/codemirror-play.js`
- ❌ **Extension de parsing recréée à chaque mount**
  - `createPlayExtension` appelé dans useEffect (ligne 187)
  - Devrait être constant ou en variable de module
- ⚠️ **Regex didascalies fragile**
  - Ligne 53: `/^\([^\)]*\)\s*$/` ne gère pas les parenthèses imbriquées
  - Edge case: `(il dit (à voix basse))` ne sera pas détecté

**Recommandations AVANT production**:
1. Extraire `toggleLineFormat` dans utils
2. Créer ErrorBoundary autour de ce composant
3. Tester edge cases regex (parenthèses imbriquées)

### 5.2 PlayEditor.jsx (448 lignes)

**Points forts**:
- ✅ Architecture claire avec hooks bien séparés
- ✅ Gestion responsive propre (mobile/desktop)
- ✅ Utilisation de debouncing pour optimiser parsing

**Points faibles**:
- ❌ **Sauvegarde automatique absente**
  - Ligne 64: `saveTimeoutRef` créé mais jamais utilisé
  - Devrait implémenter :
    ```javascript
    useEffect(() => {
      if (!hasUnsavedChanges) return;
      const timeout = setTimeout(() => savePlay(), 2000);
      return () => clearTimeout(timeout);
    }, [content, hasUnsavedChanges, savePlay]);
    ```
- ❌ **Parser instancié inutilement**
  - Ligne 84: `const parser = useMemo(() => new PlayParser(), [])`
  - Passé à `usePlayParsing` qui ne le stocke pas
  - Devrait être dans `usePlayParsing` directement
- ⚠️ **10 useState locaux**
  - Pourrait bénéficier d'un `useReducer` pour simplifier
  - Pas critique mais moins lisible
- ⚠️ **menuItems recalculé à chaque render**
  - Devrait être mémorisé avec `useMemo([navigate, logout, isGuest])`

**Recommandations AVANT production**:
1. Implémenter sauvegarde automatique
2. Mémoriser `menuItems`
3. Tester comportement si API échoue pendant édition

### 5.3 PlaysList.jsx (412 lignes)

**Points forts**:
- ✅ Logique de pagination propre
- ✅ Filtres bien implémentés
- ✅ Menu contextuel bien géré (click outside)

**Points faibles**:
- ⚠️ **TODO non implémenté**
  - Ligne 146: `// TODO: Navigate to versions page or open versions modal`
  - Fonctionnalité "Versions" affiche juste un toast informatif
  - Devrait soit être implémentée soit le bouton retiré
- ❌ **menuItems non mémorisé** (même problème que PlayEditor)
- ⚠️ **useEffect avec dépendance `filters`**
  - Ligne 70: `useEffect(() => { fetchPlays() }, [pagination.page, filters])`
  - `filters` est un objet, recréé à chaque render → boucle infinie potentielle
  - Devrait dépendre de `filters.status`, `filters.sortBy`, `filters.sortOrder`

**Recommandations**:
1. Implémenter fonctionnalité Versions OU retirer le bouton
2. Fixer la dépendance `useEffect` pour éviter refetch inutiles
3. Mémoriser `menuItems`

### 5.4 storage.service.js (222 lignes)

**Points forts**:
- ✅ **Abstraction propre** localStorage/API
- ✅ Migration des données invité bien pensée
- ✅ API cohérente avec `playsService`

**Points faibles**:
- ⚠️ **Incohérence de format de réponse**
  - `getPlay()` retourne l'objet play directement en mode invité
  - Mais `{ play: {...} }` en mode API
  - Force du code défensif partout : `response.play?.id || response.id`
- ⚠️ **Pas de validation des données localStorage**
  - Si `localStorage` corrompu, crash
  - Devrait avoir try/catch autour de `JSON.parse`
- ❌ **Migration synchrone avec Promise.allSettled**
  - Ligne 197-207: Migration de 100+ pièces pourrait timeout
  - Devrait être par batch ou avec indication de progression

**Recommandations AVANT production**:
1. Normaliser TOUTES les réponses pour retourner `{ play: {...}, pagination?: {...} }`
2. Ajouter validation/sanitization des données localStorage
3. Tester migration avec 50+ pièces

### 5.5 AuthContext.jsx (67 lignes)

**Points forts**:
- ✅ Simple et efficace
- ✅ Mémoïsation correcte de la valeur du context
- ✅ Gestion du loading state

**Points faibles**:
- ⚠️ **Pas de refresh token**
  - Token expiré = déconnexion brutale
  - Devrait vérifier l'expiration et rafraîchir si possible
- ⚠️ **isGuest calculé localement**
  - Dupliqué dans `storage.service.isGuest()`
  - Devrait être la source unique de vérité
- ❌ **Erreur de chargement utilisateur = logout silencieux**
  - Ligne 18-22: Si `getCurrentUser()` échoue, logout sans notification
  - L'utilisateur ne comprend pas pourquoi il est déconnecté

**Recommandations**:
1. Notifier l'utilisateur si échec de chargement du profil
2. Centraliser la logique `isGuest` ici (supprimer de storage.service)
3. (Post-prod) Implémenter refresh token

---

## 6. Incohérences et code mort

### 6.1 Code mort

**Imports non utilisés**: ✅ Aucun détecté

**Props non utilisées**:
- [LeftPanel.jsx:14-15](client/src/components/editors/LeftPanel.jsx#L14-L15): `canUndo`, `canRedo` passées mais commentées ligne 71-72
- [LeftPanel.jsx:12](client/src/components/editors/LeftPanel.jsx#L12): `onDownload` passé mais jamais appelé (export PDF utilisé à la place)

**Composants orphelins**: ✅ Aucun (tous importés quelque part)

**Fonctions inutilisées**:
- [LeftPanel.jsx:66-110](client/src/components/editors/LeftPanel.jsx#L66-L110): Boutons Undo/Redo affichés mais non fonctionnels
- [playParser.js:54](client/src/utils/playParser.js#L54): Méthode `toJSON()` de ASTNode jamais appelée

**Variables inutilisées**:
- [PlayEditor.jsx:64](client/src/pages/plays/PlayEditor.jsx#L64): `saveTimeoutRef` créé mais jamais utilisé

### 6.2 Incohérences

1. **Format de réponse API vs localStorage** (déjà mentionné)
   - API: `{ play: {...} }`
   - Local: `{...}` directement

2. **Nommage des événements**
   - Parfois `onXxx` (onClick, onChange)
   - Parfois `handleXxx` (handleContentChange)
   - Devrait être cohérent : composants exposent `onXxx`, implémentations internes `handleXxx`

3. **Import de toast**
   - Parfois `import toast from 'react-hot-toast'`
   - Parfois destructuré `import { toast } from 'react-hot-toast'`
   - Le package exporte par défaut, devrait être cohérent

4. **Classes CSS**
   - Mélange de `className="..."` inline et variables
   - Parfois string template, parfois concaténation
   - Devrait toujours utiliser `cn()` de utils

5. **Console.log laissés**
   - 10 fichiers avec console.error/log/warn
   - À nettoyer en production (ou environner avec `if (import.meta.env.DEV)`)

### Recommandations

| Priorité | Action | Impact |
|----------|--------|--------|
| **HAUTE** | Retirer les boutons Undo/Redo OU implémenter la fonctionnalité | UX (évite confusion) |
| **HAUTE** | Retirer `onDownload` de LeftPanel si inutilisé | Nettoyage API |
| **MOYENNE** | Normaliser imports toast | Cohérence |
| **MOYENNE** | Nettoyer console.log ou environner avec DEV check | Production |
| **BASSE** | Standardiser usage de `cn()` partout | Cohérence |

---

## 7. Dette technique

### 7.1 Dette technique critique (AVANT production)

| Problème | Fichier | Impact | Effort |
|----------|---------|--------|--------|
| Pas d'ErrorBoundary | App.jsx | 🔴 Crash total si erreur dans un composant | 2h |
| Sauvegarde auto absente | PlayEditor.jsx | 🔴 Perte de données utilisateur | 3h |
| Normalisation réponses API | storage.service.js | 🔴 Bugs potentiels | 2h |
| Notification 401 | api.js | 🟠 UX déconnexion brutale | 1h |
| Double parsing AST | playStatistics.js | 🟠 Performance -50% | 2h |

**Total effort avant production**: ~10h

### 7.2 Dette acceptable (post-production)

| Problème | Fichier | Impact | Effort |
|----------|---------|--------|--------|
| Fonction toggleLineFormat trop longue | CodeMirrorEditor.jsx | 🟢 Maintenabilité | 3h |
| Undo/Redo non implémenté | LeftPanel.jsx | 🟢 Feature manquante | 8h |
| Pas de tests | Toute la codebase | 🟠 Régression | 40h |
| TypeScript manquant | Toute la codebase | 🟢 Safety | 80h |
| Refresh token absent | AuthContext.jsx | 🟢 UX déconnexion | 5h |

**Total effort post-production**: ~136h

### 7.3 Hacks et TODOs

**TODOs trouvés**:
- [PlaysList.jsx:146](client/src/pages/plays/PlaysList.jsx#L146): `// TODO: Navigate to versions page or open versions modal`

**Commentaires désactivés**:
- [LeftPanel.jsx:71-72](client/src/components/editors/LeftPanel.jsx#L71-L72): `// disabled={!canUndo}` et `// disabled={!canRedo}`

**Code commenté**: ✅ Aucun bloc de code commenté détecté

**Hacks détectés**: ✅ Aucun

### 7.4 Dépendances et compatibilité React 19

**Patterns obsolètes**: ✅ Aucun
- Pas de `componentDidMount`, `componentWillUnmount` (hooks utilisés)
- Pas de `defaultProps` (valeurs par défaut dans destructuring)
- Pas de `PropTypes` (acceptable sans TypeScript)

**Patterns React 19 bien utilisés**:
- ✅ `use()` non nécessaire (pas de Suspense/Streaming)
- ✅ `forwardRef` + `useImperativeHandle` (CodeMirrorEditor)
- ✅ Server Components non applicables (CSR)

**Dépendances à surveiller**:
- CodeMirror 6 : bien intégré, pas de warning
- react-hot-toast : bien utilisé
- react-router-dom : patterns modernes (hooks)

---

## 8. Sécurité

### Constat

**Bonnes pratiques**:
- ✅ Pas de `dangerouslySetInnerHTML` sans sanitization
- ✅ `escapeHTML()` utilisé dans playParser pour échapper contenu utilisateur
- ✅ Token stocké dans localStorage (acceptable pour une PWA)
- ✅ Pas de `eval()` ou `Function()` constructor

**Problèmes**:

1. **XSS potentiel dans PdfPreview**
   - Si `htmlContent` contient du script, il sera exécuté dans l'iframe
   - Devrait utiliser CSP ou sanitizer

2. **Pas de CSRF token**
   - Acceptable si API utilise Bearer token uniquement
   - À vérifier côté serveur

3. **localStorage accessible en JS**
   - Token volable via XSS
   - Alternative : httpOnly cookies (nécessite changement backend)

### Recommandations

| Priorité | Action |
|----------|--------|
| **MOYENNE** | Sanitizer `htmlContent` avant injection dans iframe PDF |
| **BASSE** | (Long terme) Migrer vers httpOnly cookies pour le token |

---

## 9. Performance

### Constat

**Points positifs**:
- ✅ Debouncing du parsing (300ms)
- ✅ `useMemo` pour éviter recalculs (parser, structure)
- ✅ Viewport-based rendering dans CodeMirror (lignes 42-57)

**Problèmes**:

1. **Double parsing** (déjà mentionné)
   - Parser appelé 2 fois : structure + statistiques
   - Impact : ~50-100ms pour une pièce de 1000 lignes

2. **menuItems recalculé à chaque render**
   - PlaysList + PlayEditor
   - Impact mineur mais inutile

3. **Pas de lazy loading des pages**
   - Toutes les pages importées au chargement initial
   - Bundle size plus gros

4. **Pas de virtualisation pour grandes listes**
   - PlaysList affiche toutes les pièces (max 20 via pagination)
   - Acceptable, pas critique

### Recommandations

| Priorité | Action | Gain |
|----------|--------|------|
| **HAUTE** | Fusionner parsing structure + stats | -50% temps parsing |
| **MOYENNE** | Lazy load des routes React | -30% bundle initial |
| **BASSE** | Mémoriser menuItems | Négligeable |

---

## 10. Testabilité

### Constat

**État actuel**:
- ❌ **0 tests** (vérifié via grep)
- ❌ Pas de configuration Jest/Vitest
- ❌ Pas de @testing-library

**Code testable**:
- ✅ Services purs (api.js, playParser.js)
- ✅ Hooks customs isolés (usePlayParsing, useDebouncedValue)
- ✅ Utilitaires purs (cn, playStatistics)

**Code difficile à tester**:
- ❌ CodeMirrorEditor (trop de logique inline, dépendance externe)
- ❌ PlayEditor (10 useState, dépendances multiples)
- ⚠️ Components avec localStorage direct

### Recommandations

**Phase 1 (Post-production, 8h)**:
1. Tester les utilitaires purs : playParser, playStatistics, cn
2. Tester les hooks : usePlayParsing, useDebouncedValue, useSyncScroll
3. Tester les services : storage.service, auth.service

**Phase 2 (Long terme, 20h)**:
4. Tester les composants UI simples (Button, Input, Card)
5. Tester les pages avec MSW pour mocker API

**Phase 3 (Long terme, 12h)**:
6. E2E tests critiques (connexion, création pièce, édition)

---

## Synthèse : Plan d'action

### 🔴 BLOQUANT PRODUCTION (10h total)

| Tâche | Fichier | Temps | Raison |
|-------|---------|-------|--------|
| Ajouter ErrorBoundary global | App.jsx | 2h | Éviter crash total |
| Implémenter sauvegarde auto | PlayEditor.jsx | 3h | Perte de données |
| Normaliser réponses storage | storage.service.js | 2h | Bugs potentiels |
| Notifier déconnexion 401 | api.js | 1h | UX |
| Fusionner parsing stats | playStatistics.js | 2h | Performance |

### 🟠 HAUTE PRIORITÉ (8h total)

| Tâche | Fichier | Temps |
|-------|---------|-------|
| Retirer boutons Undo/Redo | LeftPanel.jsx | 1h |
| Mémoriser menuItems | PlayEditor + PlaysList | 1h |
| Valider localStorage data | storage.service.js | 2h |
| Simplifier PrivateRoute | PrivateRoute.jsx | 1h |
| Extraire toggleLineFormat | CodeMirrorEditor → utils | 3h |

### 🟢 POST-PRODUCTION (136h total)

- Tests unitaires (40h)
- Undo/Redo (8h)
- TypeScript migration (80h)
- Refresh token (5h)
- Lazy loading routes (3h)

---

## Conclusion

### Ce qui est bien
La codebase est **globalement saine** et prête pour une mise en production après correction des points critiques. L'architecture est claire, les patterns React modernes sont bien appliqués, et le design system est cohérent.

### Ce qui doit être corrigé AVANT production
1. **ErrorBoundary** : indispensable pour éviter crash total
2. **Sauvegarde automatique** : infrastructure présente mais non utilisée
3. **Normalisation API** : source de bugs futurs
4. **Performance parsing** : double parsing inutile

### Recommandations pour la maintenance solo
1. Prioriser la **testabilité** : commencer par tester utils et hooks
2. **Documenter** les décisions d'architecture (pourquoi pas TypeScript, etc.)
3. **Monitorer** les erreurs en production (Sentry ou équivalent)
4. **Itérer** sur la dette technique post-prod par sprints de 8h

### Note finale
**7/10** - Bon niveau pour un projet solo, quelques ajustements critiques nécessaires avant production.

---

**Fin du rapport**
