# Audit Codebase - Templates PDF Scenacte

> Audit en lecture seule. Aucun fichier source modifie.
> Date : 2026-02-13

---

## 1. Parser (playParser.js)

**Fichier** : `client/src/utils/playParser.js`

### Types de noeuds AST (`NodeType`)

```js
ROOT: 'root'
ACTE: 'acte'
SCENE: 'scene'
PERSONNAGE: 'personnage'
DIDASCALIE: 'didascalie'
DIALOGUE: 'dialogue'
TEXT: 'text'
LINE_BREAK: 'linebreak'   // declare mais jamais genere par le parser
```

### Classe `ASTNode`

```js
constructor(type, value = null, attributes = {}, children = [])
```

Proprietes :
- `type` (string) — un des `NodeType`
- `value` (string|null) — contenu textuel du noeud
- `attributes` (object) — metadonnees (ex: `{ number }`, `{ name }`, `{ speaker }`)
- `children` (ASTNode[]) — enfants
- `position` ({ start: number, end: number }) — numeros de ligne dans le texte source

Methodes :
- `addChild(node)` → retourne `this`
- `toJSON()` → serialisation recursive

### Classe `PlayParser`

**Methode principale** : `parse(text) → ASTNode` (retourne le noeud ROOT)

**Regex de detection** :
```
acte:        /^#(?!#)\s*(.+?)\s*$/i
scene:       /^##\s*(.+?)\s*$/mi
personnage:  /^@\s*(.+?)\s*$/mi
didascalie:  /^\(\s*(.+?)\s*\)$/i    ← ligne entiere entre parentheses uniquement
```

**Hierarchie des parents** (`getParentFor`) :
| Type noeud | Parent dans cet ordre |
|---|---|
| ACTE | root |
| SCENE | currentActe → root |
| PERSONNAGE | currentScene → currentActe → root |
| DIALOGUE/DIDASCALIE | currentPersonnage → currentScene → currentActe → root |
| TEXT | currentPersonnage → currentScene → currentActe → root |

**Methode `parseLine(line, speaker, lineNumber)`** :
- Extrait les didascalies inline via `/\(([^)]+)\)/g`
- Decoupe la ligne en segments : DIALOGUE (si speaker courant) ou TEXT (sinon), intercales de DIDASCALIE
- **IMPORTANT** : La regex `TAG_PATTERNS.didascalie` (ligne entiere) detecte les didascalies autonomes (`(texte)` comme seul contenu de la ligne) au niveau du `parse()`, mais ce chemin n'est PAS emprunte — la ligne est traitee par `parseLine()` qui extrait les didascalies inline. La regex de ligne complete est testee mais le resultat est ignore dans le flux car le test de personnage le precede.

### Traitement des didascalies — UN SEUL TYPE

Le parser ne distingue PAS les types de didascalies :
- **Pas** de `didascalie.liminaire`, `didascalie.pre-replique`, `didascalie.intra-replique`, `didascalie.inter-repliques`
- Toutes les didascalies sont du type `NodeType.DIDASCALIE` avec `value` = texte sans parentheses
- Les parentheses sont **retirees** par le parser (regex capture group) et **non restituees** dans le HTML

### Traitement des parentheses

- Le parser **retire** les parentheses lors de l'extraction (capture group regex)
- Le HTML genere ne contient PAS les parentheses autour des didascalies
- Les CSS de `pdfExport.js` n'ajoutent pas non plus de parentheses
- **Seul** le fichier `client/dev-tools/pdf-lab/templates/classique.css` prevoit des `::before { content: "(" }` et `::after { content: ")" }` pour certains types de didascalies — mais ces classes n'existent pas dans le HTML genere

### HTML genere par `astToHTML(ast)`

```html
<!-- ROOT -->
<div class="play-root">...</div>

<!-- ACTE -->
<div class="acte-container">
  <h1 class="acte" data-number="Acte I">Acte I</h1>
  ...enfants...
</div>

<!-- SCENE -->
<div class="scene-container">
  <h2 class="scene" data-number="Scene 1">Scene 1</h2>
  ...enfants...
</div>

<!-- PERSONNAGE -->
<div class="personnage-container">
  <h3 class="personnage" data-name="Alice">Alice</h3>
  ...enfants (dialogues, didascalies)...
</div>

<!-- DIDASCALIE -->
<p class="didascalie"><em>texte sans parentheses</em></p>

<!-- DIALOGUE -->
<p class="dialogue" data-speaker="Alice">texte du dialogue</p>

<!-- TEXT -->
<p class="text">texte libre</p>
```

**Note** : `escapeHTML()` utilise `document.createElement('div')` — necessite un DOM (ne fonctionne PAS en SSR/Node sans polyfill).

### Fonctions exportees

| Fonction | Signature | Export |
|---|---|---|
| `PlayParser` (classe) | `new PlayParser()` → instance avec `.parse(text)` | named + default |
| `ASTNode` (classe) | `new ASTNode(type, value, attributes, children)` | named + default |
| `NodeType` (const) | objet enum des types | named + default |
| `astToHTML` | `(ast: ASTNode) → string` | named + default |
| `extractStructure` | `(ast: ASTNode) → { items, orphanScenes, personnages }` | named + default |

---

## 2. Export PDF (pdfExport.js)

**Fichier** : `client/src/utils/pdfExport.js`

### Fonctions exportees

| Fonction | Signature |
|---|---|
| `generatePdfHtml` | `({ htmlContent, playTitle, playSubtitle?, pageFormat?, templateSettings? }) → string` |
| `printPdf` | `(iframeRef: React.RefObject) → void` |
| `getPreviewStyles` | `(templateSettings) → object` (CSS-in-JS) |
| `getPreviewCSS` | `(templateSettings) → string` (CSS texte) |

### `generatePdfHtml` — assemblage du HTML

Retourne un **document HTML complet** (doctype, head, body) sous forme de template string.

**Structure du document** :
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>{playTitle escape}</title>
  <script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
  <link href="https://fonts.googleapis.com/css2?{fontImport}&display=swap" rel="stylesheet">
  <style>
    {pageStyles}    /* @page rules */
    {contentStyles} /* body, .acte, .scene, .personnage, .didascalie, .dialogue */
  </style>
</head>
<body>
  <section class="title-page">
    <h1>{playTitle}</h1>
    <p class="subtitle">{playSubtitle}</p>  <!-- optionnel -->
  </section>
  <section class="play-content">
    {htmlContent}  <!-- HTML brut de astToHTML() -->
  </section>
</body>
</html>
```

**Chargement de PagedJS** : via CDN `https://unpkg.com/pagedjs/dist/paged.polyfill.js` — le polyfill s'auto-execute et emet l'evenement `pagedjs-ready` quand c'est termine.

**CSS @page** :
- `size: {pageFormat}` (A4 ou A5)
- Marges en mm depuis `settings.margins.{top,bottom,left,right}`
- `@bottom-center { content: counter(page) }` — numerotation
- `@page:first` — pas de numero
- `@page title-page` — pas de numero

**Settings par defaut** (si `templateSettings` est null) :
```json
{
  "fontFamily": "Crimson Text",
  "fontSize": 12,
  "lineHeight": 1.6,
  "margins": { "top": 20, "bottom": 25, "left": 15, "right": 15 }
}
```

**Polices supportees** (mapping Google Fonts) :
- `Crimson Text` → fallback `Georgia, serif`
- `Inter` → fallback `system-ui, -apple-system, sans-serif`
- `Space Grotesk` → fallback `system-ui, -apple-system, sans-serif`

**CSS de contenu** — styles inline dans `<style>` :
- `body { visibility: hidden }` — cache jusqu'a PagedJS
- `.pagedjs_pages { visibility: visible }` — revele apres pagination
- `.title-page` — centree, padding-top 30%
- `.play-content .acte` — break-before: page, uppercase, centre
- `.play-content .scene` — uppercase, centre
- `.play-content .personnage` — uppercase, centre
- `.play-content .didascalie` — italic, align right, padding-left 4rem
- `.play-content .dialogue` — justify
- `p { orphans: 3; widows: 3 }`

**`body { visibility: hidden }`** : technique pour eviter le flash de contenu non pagine. Le polyfill PagedJS ajoute `.pagedjs_pages` qui rend visible.

### `printPdf(iframeRef)`

Appelle `iframe.contentWindow.focus()` puis `iframe.contentWindow.print()`. C'est l'impression navigateur native qui genere le PDF.

### `getPreviewCSS(templateSettings)` — preview editeur

Genere du CSS texte pour la preview inline dans l'editeur (PAS l'iframe PDF). Cible le selecteur `.preview-content`. Styles quasi identiques au `contentStyles` de `generatePdfHtml` mais sans les `@page` rules ni `visibility`.

### `getPreviewStyles(templateSettings)` — CSS-in-JS

Retourne un objet `{ fontFamily, fontSize, lineHeight }` pour du style React inline. Pas utilise dans le flux actuel (l'EditorPage utilise `getPreviewCSS` a la place).

### `escapeHtml` (privee)

Remplace `& < > " '` — methode string-based (pas de DOM), contrairement au `escapeHTML` du parser.

---

## 3. Preview (PdfPreview.jsx)

**Fichier** : `client/src/components/pdf/PdfPreview.jsx`

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `htmlContent` | string | requis | HTML genere par `astToHTML()` |
| `playTitle` | string | requis | Titre de la piece |
| `playSubtitle` | string | optionnel | Sous-titre |
| `template` | object | optionnel | Objet template avec `.settings` et `.name` |
| `pageFormat` | string | `'A5'` | Format de page (A4 ou A5) |
| `onPagesRendered` | function | optionnel | Callback recevant le nombre de pages |

**Ref forwarded** : accepte une ref qui pointe sur l'iframe (utilisee par `printPdf`).

### Fonctionnement

1. **Creation du HTML** : appelle `generatePdfHtml()` avec les props, en passant `template?.settings` comme `templateSettings`
2. **Injection dans l'iframe** : `doc.open()` → `doc.write(fullHtml)` → `doc.close()`
3. **Attente de PagedJS** : ecoute l'evenement `pagedjs-ready` sur `contentWindow`
4. **Timeout de securite** : 10 secondes — si PagedJS ne repond pas, `setIsLoading(false)` et `onPagesRendered(0)`
5. **Scale fit-to-width** : `ResizeObserver` sur le conteneur, calcule `scale = min(1, availableWidth / pageWidth)`
6. **Injection du scale** : ajoute/modifie un element `<style id="pdf-preview-scale">` dans l'iframe avec `transform: scale()`

**Constantes de largeur** :
```js
PAGE_WIDTHS = { A4: 794, A5: 559 }  // pixels @ 96 DPI
```

### Cycle de mise a jour

L'`useEffect` principal se re-execute quand changent : `htmlContent`, `playTitle`, `playSubtitle`, `template`, `pageFormat`, `onPagesRendered`, `updateScale`.

Chaque mise a jour **re-ecrit entierement** l'iframe (`doc.open/write/close`), ce qui re-declenche le chargement de PagedJS.

### Composant UI

- Overlay de chargement avec `<Loader />` pendant `isLoading`
- Iframe sans bordure, 100% largeur/hauteur

---

## 4. Modales (ExportModal.jsx + PageSettingsModal.jsx)

### ExportModal.jsx

**Fichier** : `client/src/components/modals/ExportModal.jsx`

**Props** :

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | requis | Modal ouvert/ferme |
| `onOpenChange` | function | requis | Callback toggle |
| `htmlContent` | string | requis | HTML de la piece |
| `playTitle` | string | requis | Titre |
| `playSubtitle` | string | optionnel | Sous-titre |
| `pageFormat` | string | `'A5'` | Format |
| `template` | object | `null` | Template avec name + settings |
| `onOpenLayoutModal` | function | optionnel | Ouvre PageSettingsModal |

**State interne** :
- `format` (string) : `'pdf'` — seul format actif (Word desactive)
- `pageCount` (number) : mis a jour par `onPagesRendered` de PdfPreview
- `iframeRef` (ref) : reference a l'iframe pour `printPdf`

**Flux utilisateur** :
1. Ouverture du modal
2. Sidebar gauche affiche : format papier, template, nombre de pages
3. Bouton "Mise en page" → ferme ExportModal, ouvre PageSettingsModal via `onOpenLayoutModal()`
4. Choix du format d'export (PDF seul actif)
5. "Telecharger" → appelle `printPdf(iframeRef)` → impression navigateur
6. Zone droite : preview PDF en direct via `<PdfPreview>`

**Le modal ne gere PAS** la selection de template. Il recoit `template` en prop depuis EditorPage.

### PageSettingsModal.jsx

**Fichier** : `client/src/components/modals/PageSettingsModal.jsx`

**Props** :

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | boolean | requis | Modal ouvert/ferme |
| `onOpenChange` | function | requis | Callback toggle |
| `playId` | string | requis | ID de la piece |
| `currentPaperSize` | string | `'A5'` | Format actuel |
| `currentTemplateId` | string | `null` | ID du template actuel |
| `currentTemplate` | object | `null` | Objet template actuel |
| `onSettingsChange` | function | requis | Callback avec `{ paperSize, templateId, template }` |

**State interne** :
- `paperSize` (string) : A4 ou A5
- `selectedTemplateId` (string|null) : ID du template selectionne
- `templates` (array) : liste des templates charges depuis l'API
- `isLoadingTemplates` (boolean)
- `isSaving` (boolean)

**Flux utilisateur** :
1. A l'ouverture, charge les templates via `storageService.getPublicTemplates()`
2. Si pas de template selectionne, pre-selectionne le template par defaut (`isDefault: true`)
3. L'utilisateur choisit format papier (A4/A5) et template
4. "Enregistrer" → appelle `onSettingsChange({ paperSize, templateId, template })`
5. Le callback sauvegarde cote serveur via `storageService.updatePlaySettings()`

**Affichage des marges** : si le template selectionne a `settings.margins`, affiche les 4 valeurs en mm.

---

## 5. EditorPage

**Fichier** : `client/src/pages/editor/EditorPage.jsx`

### State lie au PDF/templates

```js
const [paperSize, setPaperSize] = useState("A5");
const [templateId, setTemplateId] = useState(null);
const [template, setTemplate] = useState(null);
```

**Chargement initial** (`fetchPlay`) :
```js
setPaperSize(response.play.paperSize || "A5");
setTemplateId(response.play.templateId || null);
setTemplate(response.play.template || null);
```

L'API `getPlay` retourne l'objet `play` avec `paperSize`, `templateId`, et `template` (objet complet avec settings).

### CSS dynamique pour la preview inline

```js
const previewCSS = useMemo(
  () => getPreviewCSS(template?.settings),
  [template?.settings]
);
```

Injecte dans le DOM via `<style>{previewCSS}</style>` juste avant la `<div class="preview-content">`.

### Preview inline (PAS l'iframe PDF)

```jsx
<style>{previewCSS}</style>
<div
  className="preview-content h-full w-full bg-white overflow-auto p-4"
  dangerouslySetInnerHTML={{ __html: htmlContent }}
/>
```

**IMPORTANT** : Cette preview utilise `dangerouslySetInnerHTML` avec le HTML brut de `astToHTML()`. Elle n'utilise PAS `PdfPreview.jsx` ni PagedJS. C'est une preview simple, stylisee par `getPreviewCSS()`.

### Flux parsing

```
content (state)
  → useDebouncedValue(content, 300ms) → debouncedContent
    → usePlayParsing(debouncedContent, parser) → { structure, statistics, htmlContent }
```

Le `htmlContent` est ensuite passe a :
1. La preview inline (dangerouslySetInnerHTML)
2. `ExportModal` (prop `htmlContent`)
3. `savePlay()` (envoye au serveur)

### Passage des props aux modales

**ExportModal** :
```jsx
<ExportModal
  htmlContent={htmlContent}
  playTitle={play?.title}
  playSubtitle={play?.subtitle}
  pageFormat={paperSize}
  template={template}
  onOpenLayoutModal={handleOpenLayoutModal}
/>
```

**PageSettingsModal** :
```jsx
<PageSettingsModal
  playId={id}
  currentPaperSize={paperSize}
  currentTemplateId={templateId}
  currentTemplate={template}
  onSettingsChange={handleSettingsChange}
/>
```

### `handleSettingsChange`

```js
const handleSettingsChange = async (newSettings) => {
  setPaperSize(newSettings.paperSize);
  setTemplateId(newSettings.templateId);
  setTemplate(newSettings.template);

  await storageService.updatePlaySettings(id, {
    paperSize: newSettings.paperSize,
    templateId: newSettings.templateId,
  });
};
```

Met a jour le state local ET persiste sur le serveur. La mise a jour du state `template` re-declenche le recalcul de `previewCSS` et la re-generation de la preview PDF (via les deps de PdfPreview).

---

## 6. Templates BDD

### Schema de la table `export_templates`

**Fichier** : `server/db/schema.sql` et `server/db/migrations/000_init.sql`

```sql
CREATE TABLE IF NOT EXISTS export_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- NULL = template systeme
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,  -- NULL = template global
  name VARCHAR(100) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  settings JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Index** :
- `idx_export_templates_user_id` sur `user_id`
- `idx_export_templates_play_id` sur `play_id`
- `idx_export_templates_system` : index partiel `WHERE user_id IS NULL`

### Lien avec la table `plays`

```sql
-- Dans plays :
template_id UUID REFERENCES export_templates(id) ON DELETE SET NULL
paper_size VARCHAR(10) DEFAULT 'A5' CHECK (paper_size IN ('A4', 'A5'))
```

`ON DELETE SET NULL` : si un template est supprime, la piece perd la reference mais n'est pas supprimee.

### Templates systeme (seed data)

3 templates inseres dans `000_init.sql` :

**Classique** (defaut) :
```json
{
  "fontFamily": "Crimson Text",
  "fontSize": 12,
  "lineHeight": 1.6,
  "margins": { "top": 20, "bottom": 25, "left": 15, "right": 15 }
}
```

**Moderne** :
```json
{
  "fontFamily": "Inter",
  "fontSize": 11,
  "lineHeight": 1.5,
  "margins": { "top": 15, "bottom": 20, "left": 20, "right": 20 }
}
```

**Minimal** :
```json
{
  "fontFamily": "Space Grotesk",
  "fontSize": 11,
  "lineHeight": 1.4,
  "margins": { "top": 25, "bottom": 25, "left": 25, "right": 25 }
}
```

### Routes API

**Fichier** : `server/src/routes/templates.routes.js`

| Methode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/templates/public` | Non | Templates systeme (user_id IS NULL) |
| GET | `/api/templates` | Oui | Templates user + systeme |
| POST | `/api/templates` | Oui | Creer un template |
| GET | `/api/templates/:id` | Oui | Recuperer un template |
| PUT | `/api/templates/:id` | Oui | Modifier un template |
| DELETE | `/api/templates/:id` | Oui | Supprimer un template |

### Controller

**Fichier** : `server/src/controllers/templates.controller.js`

Fonctions exportees : `listTemplates`, `listPublicTemplates`, `createTemplate`, `getTemplate`, `updateTemplate`, `deleteTemplate`

**Points notables** :
- `listPublicTemplates` : `WHERE user_id IS NULL`, pas d'auth requise
- `listTemplates` : `WHERE (t.user_id = $1 OR t.user_id IS NULL)`, filtre optionnel `playId`
- `createTemplate` : valide le nom et les settings via `validateTemplateSettings()`, gere `isDefault` (retire le defaut des autres)
- `updateTemplate` : interdit la modification des templates systeme (`user_id !== userId`)
- `deleteTemplate` : idem

### Service `pdf.service.js`

**Fichier** : `server/src/services/pdf.service.js`

Contient :
- `generatePDF(htmlContent, templateSettings, title)` : generation PDF cote serveur (MVP — retourne en fait le HTML en Buffer, note comme "simule")
- `generatePDFFilename(title)` : genere un nom de fichier securise
- `validateTemplateSettings(settings)` : valide les settings (marges en regex `cm|mm|in|pt`, fontSize en `pt`, pageSize en `A4|A5|Letter|Legal`)

**ATTENTION** : Le format de validation serveur (`marginTop: "2cm"`, `fontSize: "12pt"`) est **different** du format client (`margins: { top: 20 }`, `fontSize: 12`). Le validateur serveur attend des strings avec unites, le client envoie des nombres. Ce decalage peut poser probleme si la validation est appliquee lors de la creation de templates via l'API.

### Client-side services

**`client/src/services/templates.service.js`** :
- `getPublicTemplates()` : fetch `/templates/public` (sans auth, fetch natif)
- `listTemplates(params)` : `api.get('/templates')` (avec auth)
- `getTemplate(id)`, `createTemplate(data)`, `updateTemplate(id, data)`, `deleteTemplate(id)`

**`client/src/services/plays.service.js`** :
- `renamePlay(id, data)` : `api.patch('/plays/:id', data)` — reutilise pour `updatePlaySettings`

---

## 7. Hook usePlayParsing

**Fichier** : `client/src/hooks/usePlayParsing.js`

### Signature

```js
function usePlayParsing(content: string, parser: PlayParser)
  → { ast: ASTNode|null, structure: object, statistics: object|null, htmlContent: string }
```

### Fonctionnement

Enveloppe dans un `useMemo([content, parser])` :
1. Si `content` est falsy → retourne les valeurs vides
2. `ast = parser.parse(content)` — parse l'AST
3. `structure = extractStructure(ast)` — extrait la structure de navigation
4. `statistics = calculateStatsFromAST(ast)` — calcule les stats
5. `htmlContent = astToHTML(ast)` — genere le HTML

**Import** : `calculateStatsFromAST` depuis `../utils/playStatistics`

### Valeur de retour en cas d'erreur

```js
{ ast: null, structure: { items: [], orphanScenes: [], personnages: [] }, statistics: null, htmlContent: "" }
```

### Utilisation dans EditorPage

```js
const { structure, statistics, htmlContent } = usePlayParsing(debouncedContent, parser);
```

Le `debouncedContent` est le `content` avec un debounce de 300ms via `useDebouncedValue`.

---

## 8. Fichiers CSS lies au PDF

### Fichiers CSS externes

| Fichier | Role | Utilise en prod ? |
|---|---|---|
| `client/src/index.css` | CSS global app (Tailwind, design tokens) — definit `--font-theater`, `--font-ui` | Oui |
| `client/public/pdf-templates/default.css` | Template CSS pour PDF lab — classes `.play`, `.act`, `.scene`, `.character`, `.dialogue`, `.didascalie-liminaire`, `.didascalie-pre-replique` | Non (pas importe dans le flux) |
| `client/dev-tools/pdf-lab/templates/default.css` | Identique a `public/pdf-templates/default.css` | Non (dev-tools) |
| `client/dev-tools/pdf-lab/templates/classique.css` | Template CSS avance — 4 types de didascalies, `@page :left/:right`, headers/footers, `::before`/`::after` pour parentheses | Non (dev-tools) |

### CSS inline dans les fichiers JS/JSX

| Fichier | Mecanisme | Cible |
|---|---|---|
| `pdfExport.js` → `generatePdfHtml()` | Template string dans `<style>` | Iframe PDF (PagedJS) |
| `pdfExport.js` → `getPreviewCSS()` | Retourne string CSS | Preview inline editeur (`.preview-content`) |
| `PdfPreview.jsx` | Injection dynamique `<style>` dans iframe | Scale/shadow des pages dans l'iframe |
| `EditorPage.jsx` | `<style>{previewCSS}</style>` | Preview inline editeur |
| `PlayPreview.jsx` | Inline `<style>` dans le composant | Preview alternative (`.play-root`) |

### Ecarts entre les CSS

**Preview inline (getPreviewCSS)** vs **PDF (generatePdfHtml contentStyles)** :
- Selecteurs differents : `.preview-content .acte` vs `.play-content .acte`
- Styles identiques dans les deux (tailles, poids, alignements)
- La preview n'a pas de `@page`, `visibility: hidden`, ni `break-before`

**`classique.css` (dev-tools)** — prevoit 4 types de didascalies que le parser ne genere pas :
- `.didascalie.liminaire` → `text-align: center`
- `.didascalie.inter-repliques` → `text-align: right; padding-left: 4rem`
- `.didascalie.pre-replique` → `display: inline; font-size: 0.9em` + parentheses via CSS
- `.didascalie.intra-replique` → `display: inline; font-size: 0.9em` + parentheses via CSS

**`PlayPreview.jsx`** — composant autonome avec ses propres styles, pas utilise dans EditorPage actuel (EditorPage utilise `dangerouslySetInnerHTML` + `getPreviewCSS` directement).

---

## 9. Service de stockage

**Fichier** : `client/src/services/storage.service.js`

### Mecanisme de detection

```js
const isGuest = () => !localStorage.getItem('token');
```

Chaque methode verifie `isGuest()` et route vers localStorage ou API.

### Stockage des preferences de mise en page

**Mode connecte** :
- `updatePlaySettings(playId, { paperSize, templateId })` → appelle `playsService.renamePlay(playId, { paperSize, templateId })` (PATCH `/plays/:id`)
- Les settings sont stockes en BDD dans les colonnes `paper_size` et `template_id` de la table `plays`

**Mode invite** :
- `updatePlaySettings` → sauvegarde dans l'objet play du localStorage (`paperSize`, `templateId` dans le play)
- Sauvegarde aussi dans `localStorage['scenacte_page_settings']` comme settings par defaut
- `getGuestPageSettings()` → lit `scenacte_page_settings`

### Template choisi — persistance

- Le `templateId` est persiste dans la table `plays` (colonne `template_id`)
- L'objet `template` complet est retourne par `getPlay()` (JOIN avec `export_templates`)
- En mode invite, le `templateId` est stocke dans l'objet play du localStorage, mais l'objet template complet n'est PAS persiste (il est re-charge depuis l'API `/templates/public` a chaque ouverture de PageSettingsModal)

### Methodes liees aux templates

```js
storageService.getPublicTemplates()  → templatesService.getPublicTemplates()
storageService.updatePlaySettings(playId, { paperSize, templateId })
storageService.getGuestPageSettings()  → lit localStorage
```

---

## 10. Graphe de dependances

```
EditorPage.jsx
  ├── imports → usePlayParsing.js (hook)
  ├── imports → PlayParser (classe) depuis playParser.js
  ├── imports → getPreviewCSS depuis pdfExport.js
  ├── imports → storageService depuis storage.service.js
  ├── imports → ExportModal.jsx
  ├── imports → PageSettingsModal.jsx
  ├── imports → EditorSettingsModal.jsx
  ├── imports → VersionHistoryModal.jsx
  ├── imports → StatsModal.jsx
  ├── imports → CodeMirrorEditor.jsx
  ├── imports → EditorHeader.jsx
  ├── imports → EditorSidebar
  ├── imports → useDebouncedValue.js
  ├── imports → useSyncScroll.js
  ├── imports → useVersioning.js
  └── imports → useAuth.js

usePlayParsing.js
  ├── imports → PlayParser, astToHTML, extractStructure depuis playParser.js
  ├── imports → calculateStatsFromAST depuis playStatistics.js
  ├── exporte vers → EditorPage.jsx
  └── (pas d'autre consommateur)

playParser.js
  ├── pas de dependances internes
  ├── exporte vers → usePlayParsing.js
  ├── exporte vers → EditorPage.jsx (PlayParser classe)
  └── exporte vers → PlayPreview.jsx (PlayParser, astToHTML)

pdfExport.js
  ├── pas de dependances internes
  ├── exporte vers → EditorPage.jsx (getPreviewCSS)
  ├── exporte vers → PdfPreview.jsx (generatePdfHtml)
  └── exporte vers → ExportModal.jsx (printPdf)

PdfPreview.jsx
  ├── imports → generatePdfHtml depuis pdfExport.js
  ├── imports → Loader depuis ui/Loader
  ├── exporte vers → ExportModal.jsx
  └── (pas utilise dans EditorPage — la preview inline est differente)

ExportModal.jsx
  ├── imports → PdfPreview.jsx
  ├── imports → printPdf depuis pdfExport.js
  ├── imports → composants UI (Dialog, Button, RadioGroup, Label)
  └── exporte vers → EditorPage.jsx

PageSettingsModal.jsx
  ├── imports → storageService depuis storage.service.js
  ├── imports → composants UI (Dialog, Button, Label)
  └── exporte vers → EditorPage.jsx

storage.service.js
  ├── imports → playsService depuis plays.service.js
  ├── imports → templatesService depuis templates.service.js
  ├── imports → calculatePlayStatistics depuis playStatistics.js
  ├── exporte vers → EditorPage.jsx
  ├── exporte vers → PageSettingsModal.jsx
  └── exporte vers → (autres pages : library, etc.)

templates.service.js
  ├── imports → api depuis api.js
  └── exporte vers → storage.service.js

plays.service.js
  ├── imports → api depuis api.js
  └── exporte vers → storage.service.js

PlayPreview.jsx (composant alternatif)
  ├── imports → PlayParser, astToHTML depuis playParser.js
  └── (pas utilise dans EditorPage actuel)

--- Serveur ---

templates.routes.js
  ├── imports → templates.controller.js (6 fonctions)
  ├── imports → auth.middleware.js
  └── imports → rateLimiter.middleware.js

templates.controller.js
  ├── imports → database.js (pool)
  ├── imports → validation.js (validateUUID)
  ├── imports → pdf.service.js (validateTemplateSettings)
  └── imports → errorHandler.js (erreurs custom)

pdf.service.js
  ├── imports → pagedjs (Previewer) — non utilise en pratique
  └── exporte vers → templates.controller.js
```

---

## 11. Points de fragilite

### CRITIQUE — Didascalies : decalage parser / CSS dev-tools

Le fichier `client/dev-tools/pdf-lab/templates/classique.css` prevoit **4 types de didascalies** (liminaire, inter-repliques, pre-replique, intra-replique) avec des classes CSS distinctes et des `::before`/`::after` pour les parentheses. **Le parser ne genere qu'un seul type** (`<p class="didascalie">`). Si on refactorise le parser pour distinguer les types, il faut s'assurer que :
- Le HTML genere utilise les bonnes classes
- Les CSS de `pdfExport.js` sont mis a jour
- Les CSS de `getPreviewCSS()` sont mis a jour
- Les parentheses sont gerees soit par le parser soit par le CSS (pas les deux)

### CRITIQUE — Deux escapeHTML differents

- `playParser.js:331` : `escapeHTML()` utilise `document.createElement('div')` — **necessite un DOM**
- `pdfExport.js:202` : `escapeHtml()` utilise des `.replace()` — **fonctionne partout**

Si le parser est appele cote serveur (SSR, tests unitaires), `escapeHTML` plantera car `document` n'existe pas.

### CRITIQUE — Le HTML de astToHTML passe dans dangerouslySetInnerHTML

Le `htmlContent` genere par `astToHTML()` est injecte directement :
1. Dans la preview inline (`dangerouslySetInnerHTML`)
2. Dans l'iframe PDF (via `generatePdfHtml`)
3. Sauvegarde en BDD (envoye au serveur via `savePlay`)

Tout changement dans `astToHTML()` impacte ces 3 consommateurs simultanement. Si le HTML change de structure (classes, balises), les 3 destinations doivent etre mises a jour :
- CSS de `getPreviewCSS()` (selecteurs `.preview-content .xxx`)
- CSS de `generatePdfHtml()` (selecteurs `.play-content .xxx`)
- Styles inline de `PlayPreview.jsx` (selecteurs `.xxx` directement)

### CRITIQUE — Selecteurs CSS differents selon le contexte

| Contexte | Selecteur racine | Exemples |
|---|---|---|
| Preview inline (EditorPage) | `.preview-content .acte` | `getPreviewCSS()` |
| PDF iframe (PdfPreview) | `.play-content .acte` | `generatePdfHtml()` |
| PlayPreview.jsx | `.acte` (direct) | Styles inline du composant |
| dev-tools classique.css | `.play-content .acte` | Fichier CSS separatim |
| default.css (public) | `.act h2` | Classes differentes ! |

Un changement de classe dans le HTML generera un desalignement dans certains contextes mais pas d'autres.

### IMPORTANT — Format de settings inconsistant client/serveur

Le validateur serveur (`validateTemplateSettings`) attend :
```json
{ "marginTop": "2cm", "fontSize": "12pt" }
```

Le client envoie :
```json
{ "margins": { "top": 20 }, "fontSize": 12 }
```

La validation serveur ne rejettera pas les settings client (car les champs `marginTop` etc. ne sont pas presents, et la validation est permissive — elle ne verifie que les champs presents). Mais si on renforce la validation, ca cassera.

### IMPORTANT — updatePlaySettings reutilise renamePlay

```js
// storage.service.js:370
return playsService.renamePlay(playId, {
  paperSize: settings.paperSize,
  templateId: settings.templateId,
});
```

Le endpoint PATCH `/plays/:id` (renamePlay) est reutilise pour passer `paperSize` et `templateId`. Si ce endpoint est modifie (validation stricte du body, par exemple), les settings de mise en page cesseront de fonctionner.

### IMPORTANT — Template complet non persiste en mode invite

En mode invite, seul le `templateId` est sauvegarde dans localStorage. L'objet template complet est re-charge depuis l'API (`getPublicTemplates`) a chaque ouverture de PageSettingsModal. Si l'API est inaccessible, l'utilisateur invite ne verra pas les templates.

### MODERE — PagedJS charge depuis CDN

`https://unpkg.com/pagedjs/dist/paged.polyfill.js` — dependance externe non versionne. Si unpkg tombe ou si PagedJS publie une breaking change, l'export PDF casse.

### MODERE — Timeout de securite de 10s dans PdfPreview

Si PagedJS est lent (contenu volumineux), le timeout de 10s declare 0 pages et cache le loader sans attendre la fin du rendu.

### MODERE — PlayPreview.jsx est un composant orphelin

Il fait son propre parsing (`new PlayParser()`, `astToHTML()`) et ses propres styles. Il n'est pas utilise dans `EditorPage` (qui fait sa propre preview inline). Modification de l'un sans l'autre = divergence de rendu.

### MODERE — La preview inline n'est PAS fidele au PDF

La preview inline dans l'editeur utilise `getPreviewCSS()` avec des styles simplifies (pas de `@page`, pas de `break-before`, pas de `visibility: hidden`). L'utilisateur voit un rendu approximatif — le rendu reel n'est visible que dans ExportModal.

---

## 12. Contrats a preserver

### 1. Signature de `astToHTML(ast) → string`

**Consommateurs** : `usePlayParsing.js`, `PlayPreview.jsx`

Le HTML retourne DOIT :
- Avoir `<div class="play-root">` comme racine
- Utiliser les classes : `acte-container`, `acte`, `scene-container`, `scene`, `personnage-container`, `personnage`, `didascalie`, `dialogue`, `text`
- Utiliser les attributs `data-number`, `data-name`, `data-speaker`
- Utiliser les balises `h1` (acte), `h2` (scene), `h3` (personnage), `p` (didascalie/dialogue/text)

Si ces classes ou balises changent, il faut mettre a jour :
- `getPreviewCSS()` dans `pdfExport.js`
- `contentStyles` dans `generatePdfHtml()` dans `pdfExport.js`
- Les styles inline de `PlayPreview.jsx`
- Les fichiers CSS dans `dev-tools/pdf-lab/templates/`
- Les fichiers CSS dans `public/pdf-templates/`

### 2. Signature de `generatePdfHtml({ htmlContent, playTitle, playSubtitle?, pageFormat?, templateSettings? }) → string`

**Consommateurs** : `PdfPreview.jsx`

Le HTML retourne DOIT :
- Etre un document HTML complet auto-suffisant (doctype, head, body)
- Charger PagedJS polyfill (emet `pagedjs-ready`)
- Charger Google Fonts
- Avoir `<section class="title-page">` et `<section class="play-content">`
- Avoir `body { visibility: hidden }` et `.pagedjs_pages { visibility: visible }`

### 3. Signature de `printPdf(iframeRef)`

**Consommateurs** : `ExportModal.jsx`

Doit appeler `iframe.contentWindow.print()`. Si on change le mecanisme d'export (Blob, fetch serveur), il faut mettre a jour `ExportModal.handleDownload`.

### 4. Signature de `getPreviewCSS(templateSettings) → string`

**Consommateurs** : `EditorPage.jsx` (via `useMemo`)

Les selecteurs DOIVENT cibler `.preview-content .xxx` car le conteneur dans EditorPage a `className="preview-content"`.

### 5. Format de l'objet `template`

L'objet template circule entre :
- BDD → API → `getPlay()` response → `EditorPage` state → props des modales

Structure attendue partout :
```json
{
  "id": "uuid",
  "name": "Classique",
  "isDefault": true,
  "settings": {
    "fontFamily": "Crimson Text",
    "fontSize": 12,
    "lineHeight": 1.6,
    "margins": { "top": 20, "bottom": 25, "left": 15, "right": 15 }
  }
}
```

**`template.settings`** est le contrat le plus fragile : utilise par `generatePdfHtml`, `getPreviewCSS`, `getPreviewStyles`, et affiche dans `PageSettingsModal`. Ajouter/renommer un champ impacte tous ces endroits.

### 6. Format du callback `onSettingsChange`

`PageSettingsModal` appelle :
```js
onSettingsChange({ paperSize, templateId, template })
```

`EditorPage.handleSettingsChange` attend exactement cette forme.

### 7. Retour de `usePlayParsing`

```js
{ ast, structure, statistics, htmlContent }
```

`EditorPage` destructure `{ structure, statistics, htmlContent }`. Si on ajoute/retire des champs, verifier que le destructuring reste compatible.

### 8. Format de `structure` (retour de `extractStructure`)

```js
{
  items: [{ type: 'acte', value, position, scenes: [{ type: 'scene', value, position }] }],
  orphanScenes: [...],
  personnages: string[]
}
```

Utilise dans `EditorPage` pour :
- Navigation sommaire (acte.value, acte.position, scene.value, scene.position)
- Liste des personnages (structure.personnages)
- Calcul de l'acte/scene actifs (position.start)

### 9. Evenement `pagedjs-ready`

`PdfPreview.jsx` ecoute `pagedjs-ready` sur `contentWindow`. Si on change de version de PagedJS ou de methode de chargement, cet evenement doit etre preserve.

### 10. Route API `GET /api/templates/public`

Appelee sans auth par `templatesService.getPublicTemplates()` (fetch natif, pas `api.get`). Retourne `{ templates: [...] }`. Si la structure de la reponse change, `PageSettingsModal.loadTemplates` casse.

### 11. Route API `PATCH /plays/:id`

Reutilisee par `storageService.updatePlaySettings` pour passer `{ paperSize, templateId }`. Ce endpoint doit accepter ces champs dans le body sans les rejeter.

### 12. Colonnes `paper_size` et `template_id` dans `plays`

- `paper_size` : VARCHAR(10), CHECK IN ('A4', 'A5')
- `template_id` : UUID, FK vers `export_templates`, ON DELETE SET NULL

Si on ajoute d'autres formats (Letter, etc.), il faut modifier la contrainte CHECK en BDD.
