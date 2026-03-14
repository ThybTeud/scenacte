# Audit Design System — Scenacte

> Audit read-only. Aucune modification de fichier. Le document sert de base de travail pour les chantiers d'harmonisation.

---

## Phase 1 — Inventaire factuel

### 1.1 Tokens couleurs

#### Couleurs centralisees (`index.css` @theme, lignes 7-14)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-cream` | `#f8f5f2` | Fond global (body) |
| `--color-blue` | `oklch(54.6% 0.245 262.881)` | Syntaxe `@personnage` (CodeMirror) |
| `--color-black` | `#0f172a` | Texte principal, bordures |
| `--color-white` | `#ffffff` | Fonds blancs |
| `--color-white-smoke` | `#fffffe` | Variante off-white (inutilisee ?) |
| `--color-gray` | `oklch(44.6% 0.03 256.802)` | Didascalies (CodeMirror) |

#### Couleurs shadcn/ui (`:root`, lignes 250-283)

| Token | Valeur | Note |
|-------|--------|------|
| `--primary` | `oklch(71.2% 0.194 13.428)` | Rose — couleur interactive principale |
| `--border` | `oklch(21% 0.034 264.665)` | Bordures sombres (quasi-noir) |
| `--input` | `oklch(21% 0.034 264.665)` | Identique a `--border` |
| `--background` | `oklch(1 0 0)` | Blanc pur |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Rouge danger |
| `--secondary` | `oklch(0.97 0 0)` | Gris tres clair |
| `--muted-foreground` | `oklch(0.556 0 0)` | Gris moyen texte |

#### Couleurs hardcodees dans les composants (hors tokens)

| Couleur | Fichier(s) | Usage |
|---------|------------|-------|
| `bg-rose-400` | `EditorStructurePanel.jsx` | Section active sommaire |
| `bg-rose-200` | `EditorStructurePanel.jsx` | Acte actif (scene selectionnee) |
| `bg-rose-600` | `EditorHeader.jsx` | Point indicateur "non sauvegarde" |
| `text-rose-600` | `PlayCard.jsx` | Compteur scenes |
| `text-blue-600` | `EditorStructurePanel.jsx`, `PlayCard.jsx` | Personnages |
| `hover:bg-pink-100` | `EditorStructurePanel.jsx` | Hover sommaire |
| `hover:bg-blue-50` | `EditorStructurePanel.jsx` | Hover personnages |
| `text-gray-600` | `PlayCard.jsx` | Compteur repliques |
| `bg-gray-200` | `EditorWorkspace.jsx`, `EditorStructurePanel.jsx`, `EditorPreviewPanel.jsx` | Headers panneaux editeur |
| `bg-gray-300` | `AuthPage.jsx`, `EditorWorkspace.jsx` (hover) | Fond page auth |
| `bg-gray-400` | `EditorPage.jsx`, `EditorWorkspace.jsx` | Fond workspace editeur |
| `border-gray-900` | Multiples (editeur, library, auth, dialog) | Bordure noire neo-brutaliste |
| `border-gray-300` | `EditorPreviewPanel.jsx` | Bordures pointillees apercu |
| `#374151` | `index.css` (legal blockquote) | Gris hardcode |
| `#9ca3af`, `#e5e5e5`, `#fafafa`, `#d4d4d4` | `CodeMirrorEditor.jsx` | Couleurs editeur CodeMirror |

#### CodeMirror — couleurs syntaxiques (CodeMirrorEditor.jsx, lignes 79-162)

| Element | Valeur | Note |
|---------|--------|------|
| Actes/Scenes (`#`/`##`) | `oklch(58.6% 0.253 17.585)` | Rose fonce — proche de `--primary` mais pas identique |
| Personnages (`@`) | `oklch(54.6% 0.245 262.881)` | = `--color-blue` du theme |
| Didascalies | `oklch(44.6% 0.03 256.802)` | = `--color-gray` du theme |
| Ligne active | `oklch(97% 0.014 254.604)` | Bleu tres pale |
| Autocomplete shadow | `0 2px 8px rgba(0,0,0,0.1)` | Ombre douce, pas neo-brutaliste |

---

### 1.2 Typographie

#### Font stacks declares (index.css @theme, lignes 17-19)

| Token | Valeur | Usage prevu |
|-------|--------|-------------|
| `--font-ui` | `"Inter", "Space Grotesk", system-ui, sans-serif` | Interface generale |
| `--font-theater` | `"Crimson Text", Georgia, serif` | Contenu theatral (apercu/PDF) |
| `--font-editor` | `ui-monospace, "Source Code Pro", "Fira Code", monospace` | Editeur CodeMirror |

#### Usage effectif des polices

- **`font-ui`** (Inter/Space Grotesk) : utilise par defaut via `body { font-family: var(--font-ui) }`. Tous les composants UI en heritent.
- **`font-editor`** : utilise explicitement dans `EditorStructurePanel.jsx` ligne 83 (`font-editor font-semibold`) pour les noms de personnages. CodeMirror utilise sa propre config.
- **`font-theater`** (Crimson Text) : utilise uniquement dans les presets PDF et le ShadowPreview. Absent de l'interface UI directe.

#### Tailles de texte utilisees

| Classe | Equivalent | Ou |
|--------|-----------|-----|
| `text-xs` | 12px | Dates PlayCard, labels, liens legaux, boutons secondaires |
| `text-sm` | 14px | Descriptions, erreurs, boutons, menus deroulants, labels |
| `text-base` | 16px | Input (mobile), texte courant |
| `text-lg` | 18px | Titres Card, titre "Bibliotheque", SheetTitle |
| `text-xl` | 20px | Stats PlayCard (chiffres) |
| `text-2xl` | 24px | Titre "Bibliotheque" (masque `hidden`) |
| `text-3xl` | 30px | Sous-titre 404 |
| `text-6xl` | 60px | "404" sur page NotFound |

#### Poids utilises

| Poids | Ou |
|-------|-----|
| `font-medium` | Boutons (tous), liens legaux, TabsTrigger |
| `font-semibold` | Titres Card, headers editeur, sections sommaire, stats PlayCard, SheetTitle |
| `font-bold` | Headers panneaux editeur (STRUCTURE, EDITEUR, APERCU) — en uppercase |

#### Observations

- **Pas de `font-light` ni `font-normal` explicite** — le poids par defaut (400) est implicite.
- **Space Grotesk jamais isole** : il est fallback dans `--font-ui` mais jamais cible specifiquement (pas de `font-heading` ou equivalent).
- **Pas de `text-4xl` ni `text-5xl`** dans l'app — gap entre `text-3xl` (30px) et `text-6xl` (60px).

---

### 1.3 Bordures & ombres

#### Bordures — epaisseurs

| Classe | Ou | Note |
|--------|-----|------|
| `border-2` | Button (base), Card, Dialog, panneaux editeur, header library/editor, Input dans EditorHeader | **Standard neo-brutaliste** |
| `border` (1px) | Input (composant UI base), Select, Badge, Sheet, DropdownMenu, legal tables | **Standard shadcn par defaut** |
| `border-b-2` | Headers (library, editeur) | Separateur horizontal epais |
| `border-dashed` + `border-2` | Grille d'apercu (`EditorPreviewPanel`), `CreatePlayCard` | Decoratif |

#### Bordures — couleurs

| Couleur | Ou |
|---------|-----|
| `border-gray-900` | Panneaux editeur, dialog, auth card, library header, editor header, input titre | Couleur neo-brutaliste explicite |
| `border-input` (= `--border` = `oklch(21% 0.034 264.665)`) | Input, Select (composants shadcn) | Token CSS variable — visuellement tres proche de gray-900 |
| `border-yellow-500`, `border-green-500` | Alert (variantes warning/success) | Couleurs semantiques |
| `border-transparent` | TabsTrigger, Switch, ghost buttons | Pas de bordure visible |
| `border-gray-300` | Grille apercu (pointilles) | Gris clair decoratif |

#### Border radius

| Valeur | Classe(s) | Ou |
|--------|----------|-----|
| 4px | `rounded-sm` | **Button (base)**, PlayCard, Input EditorHeader, boutons PlayCard |
| ~8px | `rounded-md` | Button (sm/lg), Input, Select, Dropdown, TabsTrigger, toggle buttons |
| ~10px | `rounded-lg` | Panneaux editeur, Dialog, Skeleton, TabsList |
| ~16px | `rounded-xl` | **Card (base)** |
| full | `rounded-full` | Badge, Radio, Switch, CreatePlayCard bouton "+" |

**Token declare mais sous-utilise** : `--radius-brutal: 4px` est defini dans le theme mais jamais reference directement via `rounded-brutal` — les composants utilisent `rounded-sm` a la place.

#### Ombres

| Token/Classe | Valeur | Ou |
|-------------|--------|-----|
| `shadow-brutal` | `4px 4px 0 oklch(21% 0.034 264.665)` | Panneaux editeur (3), Dialog, Auth card | **Neo-brutaliste standard** |
| `shadow-brutal-sm` | `2px 2px 0 #0f172a` | Boutons toggle editeur (structure/preview) |
| `shadow-brutal-lg` | `6px 6px 0 #0f172a` | **Non utilise** dans le code |
| `shadow-brutal-hover` | `6px 6px 0 #0f172a` | **Non utilise** dans le code |
| `shadow-brutal-active` | `2px 2px 0 #0f172a` | **Non utilise** dans le code |
| `shadow-xs` | Tailwind natif | Button outline, Input, Radio, Switch |
| `shadow-md` | Tailwind natif | DropdownMenu |
| `shadow-lg` | Tailwind natif | Sheet, AlertDialog |
| `shadow-xl` | Tailwind natif | SidePanel |
| Hardcode `0 2px 8px rgba(0,0,0,0.1)` | CodeMirrorEditor | Autocomplete dropdown |
| Hardcode `0 1px 3px rgba(0,0,0,0.12)` | PdfPreview | Pages PDF |

---

### 1.4 Espacements

#### Patterns recurrents

| Pattern | Valeur | Ou |
|---------|--------|-----|
| Header height | `h-20` (80px) | Library header, Editor header |
| Header height | `h-16` (64px) | Panneaux editeur (Structure, Editeur, Apercu), AppLayout mobile |
| Main padding | `p-6` (24px) | Library main, AppLayout main, Card header/content/footer |
| Workspace padding | `p-4` (16px) | Editor workspace, Dialog, structure panel content |
| Inter-panel gap | `gap-4` (16px) | Workspace panels, grid PlayCards |
| Formulaire | `space-y-4` | Auth forms, Profile forms |
| Labels | `space-y-2` | Input + label groupes |

#### Inconsistences notables

- **PlayCard** : `p-2 gap-0` (8px, tres dense) vs Card base qui definit `py-6 gap-6` (24px) — ecart majeur
- **AppLayout header** : `h-16` vs Library/Editor headers `h-20` — 4px de difference

---

### 1.5 Composants shadcn/ui utilises

| Composant | Neo-brutalise ? | Notes |
|-----------|:-:|-------|
| Button | Oui | `border-2`, `rounded-sm` — adapte |
| Card | Partiellement | `border-2`, `rounded-xl` (trop arrondi pour neo-brut) |
| Dialog | Oui | `border-2 border-gray-900 shadow-brutal` — adapte |
| Input | Non | `border` (1px), `rounded-md`, `shadow-xs` — style shadcn par defaut |
| Select | Non | `border` (1px), `rounded-md`, `shadow-xs` — style shadcn par defaut |
| Tabs | Non | Pas de bordure epaisse, `rounded-lg` |
| Sheet | Non | `shadow-lg`, `border` (1px) — style shadcn standard |
| Badge | Non | `rounded-full`, `border` (1px) — style shadcn standard |
| DropdownMenu | Non | `border` (1px), `rounded-md`, `shadow-md` |
| Alert | Non | `border` (1px), `rounded-lg` — variants custom |
| Switch | Non | Standard shadcn |
| RadioGroup | Non | Standard shadcn |
| Separator | Non | Standard shadcn (pas besoin de brutalisme) |
| Skeleton | Non | Standard shadcn |
| Tooltip | Non | Standard shadcn |

---

## Phase 2 — Diagnostic

### 2.1 Neo-brutalisme : application incoherente

**Constat principal : le neo-brutalisme s'arrete aux "gros" composants structurels et ne descend pas aux composants atomiques.**

| Composant | Bordure | Ombre | Radius | Verdict |
|-----------|---------|-------|--------|---------|
| Panneaux editeur | `border-2 border-gray-900` | `shadow-brutal` | `rounded-lg` | Neo-brut |
| Dialog | `border-2 border-gray-900` | `shadow-brutal` | `rounded-lg` | Neo-brut |
| Auth card | `border-gray-900` | `shadow-brutal` | `rounded-xl` (Card) | Neo-brut |
| Button | `border-2` | aucune | `rounded-sm` | Semi-brut |
| Input | `border` (1px) | `shadow-xs` | `rounded-md` | **Standard** |
| Select | `border` (1px) | `shadow-xs` | `rounded-md` | **Standard** |
| Tabs | aucune epaisseur | aucune | `rounded-lg` | **Standard** |
| Sheet | `border` (1px) | `shadow-lg` | aucun | **Standard** |
| DropdownMenu | `border` (1px) | `shadow-md` | `rounded-md` | **Standard** |

**Resultat** : L'utilisateur voit des panneaux neo-brutalistes contenant des inputs et selects "lisses". Le contraste stylistique cree une rupture visuelle interne aux pages.

### 2.2 Radius anarchique

Le `--radius-brutal: 4px` est defini mais jamais exploite comme source de verite. Les radius s'etalent de 0 a `rounded-full` :

- **Card** : `rounded-xl` (~16px) — trop arrondi pour du neo-brutalisme
- **Button** : `rounded-sm` (~4px) — coherent avec le design intent
- **Input/Select** : `rounded-md` (~8px) — compromis ambigu
- **Dialog/Panneaux** : `rounded-lg` (~10px) — plus arrondi que les boutons
- **Badge/Switch** : `rounded-full` — parfois justifie (badges), parfois non

Il n'y a pas de logique de hierarchie. Normalement : composants conteneurs > composants internes, ou alors uniformite.

### 2.3 Ruptures de style entre pages

| Page | Fond | Bordures | Ombres | Feeling |
|------|------|----------|--------|---------|
| **Editeur** | `bg-gray-400` | `border-2 border-gray-900` partout | `shadow-brutal` | **Tres brutaliste** |
| **Auth** | `bg-gray-300` | Card `border-gray-900 shadow-brutal` | Brutal sur la card | **Brutaliste** (card isolee) |
| **Bibliotheque** | `bg-gray-200` | Header `border-b-2 border-gray-900` | Aucune ombre brutale | **Semi-brutaliste** |
| **Profil** | `bg-background` (defaut) | Card avec `border-2` (inherit) | Pas de `shadow-brutal` | **Standard shadcn** |
| **404** | `bg-background` | Aucune | Aucune | **Totalement standard** |

**Verdict** : L'editeur est le seul endroit ou le neo-brutalisme est pleinement applique. Le profil et la 404 sont generiques. La bibliotheque est un entre-deux.

### 2.4 Couleurs non centralisees

Les valeurs `gray-200`, `gray-300`, `gray-400`, `gray-900` viennent de la palette Tailwind par defaut et ne sont **pas** dans le theme custom. Problemes :

1. **`border-gray-900`** est utilise comme "noir brutaliste" partout, mais le theme definit `--color-black: #0f172a` et `--border: oklch(21% 0.034 264.665)`. Ce sont des valeurs proches mais pas identiques — `gray-900` = `#111827`, `--color-black` = `#0f172a`.
2. **`bg-gray-200/300/400`** : trois fonds differents sans token semantique. Pourquoi le workspace est-il plus fonce que la bibliotheque ?
3. **`rose-400`, `rose-200`, `rose-600`** dans le structure panel et PlayCard ne sont pas lies au token `--primary` (`oklch(71.2% 0.194 13.428)` ≈ `rose-600` mais pas exactement).
4. **CodeMirror** utilise `oklch(58.6% 0.253 17.585)` pour les actes/scenes — c'est un rose plus sature que `--primary`, sans raison evidente.

### 2.5 Hierarchie typographique

| Niveau | Taille | Poids | Usage | Probleme |
|--------|--------|-------|-------|----------|
| "Titre page" | `text-lg` (18px) | `font-semibold` | "Bibliotheque" dans le header | Petit pour un titre de page |
| Titre card | `text-lg` (18px) | `font-semibold` | PlayCard titres | Meme taille que le titre page |
| Header panneau | herite (~16px) | `font-bold uppercase` | STRUCTURE, EDITEUR, APERCU | Pas de taille explicite |
| Dialog title | `text-lg` (18px) | `font-semibold` | Modals | Encore `text-lg` |

**Les titres de page, titres de card et titres de dialog ont tous la meme taille** (`text-lg`). Cela aplatit la hierarchie — rien ne se demarque.

**Space Grotesk** est declare mais jamais utilise seul. Il est en fallback apres Inter. Si c'est un choix delibere pour les titres, il faudrait un token `--font-heading` et l'appliquer explicitement.

### 2.6 Tokens declares mais inutilises

| Token | Defini dans | Utilise ? |
|-------|-------------|-----------|
| `--shadow-brutal-lg` | `index.css:24` | Non |
| `--shadow-brutal-hover` | `index.css:25` | Non |
| `--shadow-brutal-active` | `index.css:26` | Non |
| `--radius-brutal` | `index.css:29` | Non (mais `rounded-sm` = 4px en pratique) |
| `--spacing-brutal-offset` | `index.css:32` | Non |
| `--color-white-smoke` | `index.css:13` | Non |
| Couleurs `.dark` | `index.css:285-317` | Non (pas de dark mode actif) |

### 2.7 Le composant Input : le maillon faible

L'Input shadcn est le composant le plus "non-brutaliste" de l'app :
- `border` (1px) au lieu de `border-2`
- `rounded-md` au lieu de `rounded-sm`
- `shadow-xs` (ombre douce) au lieu de `shadow-brutal-sm` ou aucune

Mais dans `EditorHeader.jsx`, l'Input du titre est **override manuellement** avec `border-2 border-gray-900 rounded-sm` — prouvant que le dev sait qu'il faut l'adapter, mais ne l'a fait qu'en un seul endroit. Le Select dans la bibliotheque reste non-adapte.

---

## Phase 3 — Recommandations

### Critique

#### R1. Harmoniser Input et Select pour le neo-brutalisme
**Quoi** : Modifier les composants `input.jsx` et `select.jsx` (SelectTrigger) pour utiliser `border-2`, `rounded-sm`, retirer `shadow-xs`.
**Pourquoi** : Ce sont les composants les plus utilises et les plus visibles. Leur style "lisse" casse le neo-brutalisme partout ou ils apparaissent.
**Impact** : Global — chaque page en beneficie.
**Effort** : Quick fix (2 lignes par composant).
**Fichiers** : `components/ui/input.jsx`, `components/ui/select.jsx`

#### R2. Unifier les couleurs de bordure
**Quoi** : Remplacer toutes les occurrences de `border-gray-900` par `border-border` (qui reference `--border`), ou bien ajouter un token `--color-brutal-border` dans le theme et l'utiliser partout.
**Pourquoi** : `gray-900` (#111827) et `--border` (oklch ~#0f172a) sont proches mais pas identiques. Un token unique evite la derive.
**Impact** : Coherence inter-pages.
**Effort** : Quick fix (rechercher-remplacer).
**Fichiers** : `EditorWorkspace.jsx`, `EditorStructurePanel.jsx`, `EditorPreviewPanel.jsx`, `EditorHeader.jsx`, `AuthPage.jsx`, `LibraryPage.jsx`, `dialog.jsx`

#### R3. Definir des tokens de fond semantiques
**Quoi** : Creer des tokens dans `@theme` pour les 3 niveaux de fond gris : `--color-surface-muted` (gris clair, library), `--color-surface-base` (gris moyen, auth), `--color-surface-strong` (gris fonce, editeur). Les utiliser a la place de `bg-gray-200/300/400`.
**Pourquoi** : Les valeurs Tailwind par defaut ne sont pas dans le theme custom, ce qui rend le systeme fragile et non-documentable.
**Effort** : Quick fix (6 occurrences a modifier + 3 tokens a ajouter).
**Fichiers** : `index.css`, `EditorPage.jsx`, `EditorWorkspace.jsx`, `LibraryPage.jsx`, `AuthPage.jsx`

### Important

#### R4. Uniformiser le border-radius
**Quoi** : Choisir **un** radius standard pour le design system : `rounded-sm` (4px = `--radius-brutal`). L'appliquer a Card, Input, Select, Dialog, panneaux editeur. Garder `rounded-full` uniquement pour Badge et Switch (formes pilule). Supprimer les usages de `rounded-md`, `rounded-lg`, `rounded-xl` sauf justification.
**Pourquoi** : Le radius anarchique (4px a 16px) dilue l'identite neo-brutaliste. Un radius constant de 4px renforce la coherence.
**Effort** : Chantier moyen — touche Card, Dialog, TabsList, Input, Select, DropdownMenu.
**Fichiers** : `card.jsx`, `dialog.jsx`, `input.jsx`, `select.jsx`, `dropdown-menu.jsx`, `tabs.jsx`

#### R5. Etendre le neo-brutalisme a la Bibliotheque et au Profil
**Quoi** :
- Bibliotheque : ajouter `shadow-brutal` sur les PlayCards, utiliser `border-gray-900` (ou le nouveau token) sur les cards.
- Profil : ajouter `shadow-brutal` sur les cards, passer le fond a `--color-surface-muted`.
- 404 : ajouter un style plus affirme (grande typo Space Grotesk, bordure).
**Pourquoi** : Actuellement, seul l'editeur "sent" le neo-brutalisme. Les autres pages semblent etre un autre produit.
**Effort** : Chantier moyen — principalement ajouter des classes sur les conteneurs existants.
**Fichiers** : `PlayCard.jsx`, `CreatePlayCard.jsx`, `ProfilePage.jsx`, `NotFound.jsx`, `LibraryPage.jsx`

#### R6. Remplacer les couleurs rose/bleu hardcodees par des tokens
**Quoi** : Creer des tokens pour les couleurs semantiques de l'editeur :
- `--color-act`: rose pour les actes/scenes (utiliser `--primary`)
- `--color-character`: bleu pour les personnages (= `--color-blue` existant)
- `--color-stage-direction`: gris pour les didascalies (= `--color-gray` existant)
Remplacer `rose-400`, `bg-rose-200`, `text-rose-600`, `text-blue-600` par ces tokens.
**Pourquoi** : Les couleurs hardcodees Tailwind deriven du primary sans y etre liees. Si le primary change, le sommaire et les PlayCards ne suivront pas.
**Effort** : Chantier moyen.
**Fichiers** : `index.css`, `EditorStructurePanel.jsx`, `PlayCard.jsx`, `EditorHeader.jsx`, `CodeMirrorEditor.jsx`

#### R7. Creer une hierarchie typographique explicite
**Quoi** :
- Titres de page (h1) : `text-xl font-bold` (ou `text-2xl` pour la landing)
- Titres de section (h2) : `text-lg font-semibold`
- Titres de card : `text-base font-semibold`
- Titres de dialog : `text-lg font-semibold` (OK tel quel)
**Pourquoi** : Tout est en `text-lg font-semibold` actuellement — pas de distinction visuelle entre niveaux de hierarchie.
**Effort** : Quick fix — ajuster quelques classes.
**Fichiers** : `LibraryPage.jsx`, `PlayCard.jsx` (CardTitle override), `EditorHeader.jsx`

### Nice-to-have

#### R8. Nettoyer les tokens inutilises
**Quoi** : Supprimer `--shadow-brutal-lg`, `--shadow-brutal-hover`, `--shadow-brutal-active`, `--spacing-brutal-offset`, `--color-white-smoke` du theme, ou les exploiter reellement (hover/active states sur les boutons).
**Pourquoi** : Code mort qui prete a confusion.
**Effort** : Quick fix.
**Fichier** : `index.css`

#### R9. Brutaliser le DropdownMenu et le Sheet
**Quoi** : Adapter DropdownMenuContent (`border-2`, `rounded-sm`, `shadow-brutal-sm`) et SheetContent (`border-2`, `shadow-brutal`).
**Pourquoi** : Coherence complete du systeme de composants.
**Effort** : Quick fix par composant.
**Fichiers** : `dropdown-menu.jsx`, `sheet.jsx`

#### R10. Exploiter Space Grotesk pour les titres
**Quoi** : Creer un token `--font-heading: "Space Grotesk", system-ui, sans-serif` et l'appliquer aux titres de page et headers de panneau editeur (STRUCTURE, EDITEUR, APERCU). Garder Inter pour le texte courant.
**Pourquoi** : Space Grotesk est declare mais invisible — il est en fallback derriere Inter, donc jamais rendu. L'utiliser sur les titres renforcerait l'identite visuelle.
**Effort** : Quick fix.
**Fichiers** : `index.css`, headers de panneaux, titres de pages

#### R11. Ajouter des transitions hover/active brutalistes sur les boutons
**Quoi** : Exploiter `shadow-brutal-hover` et `shadow-brutal-active` sur les boutons : hover = ombre qui grandit (6px), active = ombre qui retrecit (2px) + `translate` pour effet "presse".
**Pourquoi** : C'est un pattern neo-brutaliste classique qui rend l'interface plus interactive et coherente.
**Effort** : Quick fix — ajouter des classes `hover:shadow-brutal-hover hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-brutal-active active:translate-x-[2px] active:translate-y-[2px]` dans le Button base.
**Fichier** : `button.jsx`

---

## Resume des priorites

| # | Recommandation | Priorite | Effort |
|---|---------------|----------|--------|
| R1 | Harmoniser Input/Select | Critique | Quick fix |
| R2 | Unifier couleur bordure | Critique | Quick fix |
| R3 | Tokens de fond semantiques | Critique | Quick fix |
| R4 | Uniformiser border-radius | Important | Moyen |
| R5 | Neo-brutalisme Library/Profil/404 | Important | Moyen |
| R6 | Tokens couleurs editeur | Important | Moyen |
| R7 | Hierarchie typographique | Important | Quick fix |
| R8 | Nettoyer tokens inutilises | Nice-to-have | Quick fix |
| R9 | Brutaliser Dropdown/Sheet | Nice-to-have | Quick fix |
| R10 | Exploiter Space Grotesk | Nice-to-have | Quick fix |
| R11 | Transitions hover/active | Nice-to-have | Quick fix |

---

## Verification

Cet audit est read-only. Pour verifier les recommandations une fois implementees :
1. Ouvrir chaque page (auth, library, editor, profil, 404) et verifier visuellement la coherence des bordures, ombres, et radius
2. Inspecter les composants Input/Select dans le navigateur pour confirmer `border-2` et `rounded-sm`
3. Verifier que les tokens CSS sont bien references (pas de hardcoded gray-900)
4. Lancer `npx tailwindcss --content "src/**/*.jsx" | grep "gray-900"` pour trouver les usages restants apres migration
5. Tester le responsive sur mobile (les panneaux editeur sont `hidden md:flex`)
