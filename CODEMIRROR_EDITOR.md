# Éditeur CodeMirror avec Preview Synchronisé

## Vue d'ensemble

L'éditeur de pièces de théâtre utilise CodeMirror 6 avec un système de preview HTML en temps réel et un scrolling synchronisé entre les deux panneaux.

## Architecture

### Composants

1. **CodeMirrorEditor** (`/client/src/components/editors/CodeMirrorEditor.jsx`)
   - Éditeur de texte basé sur CodeMirror 6
   - Support du retour à la ligne automatique
   - Numérotation des lignes
   - Coloration syntaxique de base
   - Gestion du scroll synchronisé

2. **PlayPreview** (`/client/src/components/editors/PlayPreview.jsx`)
   - Affiche le rendu HTML en temps réel
   - Parse le contenu avec le parser de balises personnalisées
   - Supporte le scroll synchronisé
   - Styles CSS personnalisés pour le rendu théâtral

3. **PlayParser** (`/client/src/utils/playParser.js`)
   - Parse le texte brut en AST (Abstract Syntax Tree)
   - Convertit l'AST en HTML
   - Extrait la structure (actes, scènes, personnages)

4. **useSyncScroll** (`/client/src/hooks/useSyncScroll.js`)
   - Hook personnalisé pour synchroniser le scroll
   - Évite les boucles infinies
   - Utilise un système de debounce

### Intégration

Le tout est intégré dans **PlayEditor** (`/client/src/pages/plays/PlayEditor.jsx`) avec :
- Sauvegarde automatique (debounce 2s)
- Sauvegarde manuelle via bouton
- Indicateur d'état (sauvegardé / non sauvegardé / en cours)
- Support des versions (restore)

## Balises personnalisées

### Syntaxe

#### 1. Acte
```
[acte:1]
```
Marque le début d'un acte. Le numéro est obligatoire.

**Rendu HTML :**
```html
<h1 class="acte" data-number="1">ACTE 1</h1>
```

#### 2. Scène
```
[scene:1]
```
Marque le début d'une scène. Le numéro est obligatoire.

**Rendu HTML :**
```html
<h2 class="scene" data-number="1">Scène 1</h2>
```

#### 3. Personnage
```
[personnage:HAMLET]
```
Introduit un personnage. Le nom est obligatoire.

**Rendu HTML :**
```html
<h3 class="personnage" data-name="HAMLET">HAMLET</h3>
```

#### 4. Didascalie
```
[didascalie]Le rideau se lève sur une scène vide[/didascalie]
```
Indications scéniques en italique sur fond gris.

**Rendu HTML :**
```html
<p class="didascalie"><em>Le rideau se lève sur une scène vide</em></p>
```

#### 5. Dialogue
```
[dialogue:HAMLET]Être ou ne pas être, telle est la question.[/dialogue]
```
Dialogue d'un personnage avec son nom en gras.

**Rendu HTML :**
```html
<div class="dialogue" data-speaker="HAMLET">
  <strong class="speaker">HAMLET</strong>
  <p class="dialogue-text">Être ou ne pas être, telle est la question.</p>
</div>
```

#### 6. Tirade
```
[tirade:HAMLET]
Être ou ne pas être, telle est la question.
Qu'est-il plus noble pour l'âme...
[/tirade]
```
Tirade (long monologue) avec fond coloré.

**Rendu HTML :**
```html
<div class="tirade" data-speaker="HAMLET">
  <strong class="speaker">HAMLET</strong>
  <div class="tirade-text">Être ou ne pas être...</div>
</div>
```

#### 7. Aparté
```
[aparté:HAMLET]Quelle canaille je fais![/aparté]
```
Aparté (texte dit à part) en italique sur fond gris.

**Rendu HTML :**
```html
<div class="aparte" data-speaker="HAMLET">
  <strong class="speaker">HAMLET</strong>
  <p class="aparte-text">Quelle canaille je fais!</p>
</div>
```

### Exemple complet

```
[acte:1]

[scene:1]

[didascalie]Une terrasse devant le château. Il fait nuit.[/didascalie]

[personnage:BERNARDO]
[dialogue:BERNARDO]Qui va là ?[/dialogue]

[personnage:FRANCISCO]
[dialogue:FRANCISCO]Non, répondez-moi : halte, et déclinez votre nom.[/dialogue]

[dialogue:BERNARDO]Vive le roi ![/dialogue]

[dialogue:FRANCISCO]Bernardo ?[/dialogue]

[dialogue:BERNARDO]Lui-même.[/dialogue]

[tirade:HAMLET]
Être ou ne pas être, telle est la question.
Qu'est-il plus noble pour l'âme de supporter
Les coups et les revers d'une injurieuse fortune,
Ou de s'armer contre une mer de douleurs
Et de l'arrêter en s'y opposant ?
[/tirade]

[aparté:HAMLET]Quelle canaille je fais![/aparté]
```

## Structure de l'AST

L'AST généré par le parser a la structure suivante :

```javascript
{
  type: 'root',
  value: null,
  attributes: {},
  children: [
    {
      type: 'acte',
      value: null,
      attributes: { number: 1 },
      children: [],
      position: { start: 0, end: 8 }
    },
    {
      type: 'dialogue',
      value: 'Être ou ne pas être',
      attributes: { speaker: 'HAMLET' },
      children: [],
      position: { start: 10, end: 65 }
    }
    // ...
  ]
}
```

### Types de nœuds

- `root` - Nœud racine
- `acte` - Acte (attributes: { number })
- `scene` - Scène (attributes: { number })
- `personnage` - Personnage (attributes: { name })
- `didascalie` - Didascalie (value: texte)
- `dialogue` - Dialogue (value: texte, attributes: { speaker })
- `tirade` - Tirade (value: texte, attributes: { speaker })
- `aparte` - Aparté (value: texte, attributes: { speaker })
- `text` - Texte brut (value: texte)

## API

### PlayParser

```javascript
import { PlayParser, astToHTML, extractStructure } from './utils/playParser';

const parser = new PlayParser();

// Parser le texte
const ast = parser.parse(text);

// Convertir en HTML
const html = astToHTML(ast);

// Extraire la structure
const structure = extractStructure(ast);
// Retourne: { actes: [], scenes: [], personnages: [] }
```

### CodeMirrorEditor

```jsx
<CodeMirrorEditor
  value={content}
  onChange={(newContent) => setContent(newContent)}
  onScroll={(scrollInfo) => handleScroll(scrollInfo)}
  scrollSync={scrollRef}
/>
```

**Props :**
- `value` - Contenu initial
- `onChange` - Callback appelé lors des changements
- `onScroll` - Callback appelé lors du scroll
- `scrollSync` - Ref pour le contrôle externe du scroll

### PlayPreview

```jsx
<PlayPreview
  content={content}
  onScroll={(scrollInfo) => handleScroll(scrollInfo)}
  scrollSync={scrollRef}
/>
```

**Props :**
- `content` - Contenu brut à parser et afficher
- `onScroll` - Callback appelé lors du scroll
- `scrollSync` - Ref pour le contrôle externe du scroll

### useSyncScroll

```javascript
const {
  editorScrollRef,
  previewScrollRef,
  handleEditorScroll,
  handlePreviewScroll
} = useSyncScroll();
```

**Retourne :**
- `editorScrollRef` - Ref à passer à l'éditeur
- `previewScrollRef` - Ref à passer au preview
- `handleEditorScroll` - Handler pour le scroll de l'éditeur
- `handlePreviewScroll` - Handler pour le scroll du preview

## Fonctionnalités

### Scrolling synchronisé

Les deux panneaux (éditeur et preview) scrollent ensemble automatiquement. La synchronisation est basée sur le pourcentage de scroll et utilise un système de debounce pour éviter les boucles infinies.

### Sauvegarde automatique

Le contenu est sauvegardé automatiquement 2 secondes après chaque modification. Un indicateur visuel montre l'état :
- "Sauvegarde en cours..." (orange)
- "Modifications non sauvegardées" (gris)
- "Sauvegardé" (vert)

### Sauvegarde manuelle

Le bouton "Sauvegarder" permet de forcer la sauvegarde immédiate. Il est désactivé quand il n'y a pas de modifications ou pendant la sauvegarde.

## Styles

Les styles du preview sont définis inline dans le composant `PlayPreview.jsx` et utilisent :
- La couleur primaire `#FF6B35` (orange) du thème
- Police serif Georgia pour le rendu théâtral
- Bordures et backgrounds pour distinguer les différents éléments

### Classes CSS principales

- `.acte` - Titre d'acte en majuscules avec bordures
- `.scene` - Titre de scène avec bordure inférieure
- `.personnage` - Nom de personnage en majuscules orange
- `.didascalie` - Italique sur fond gris clair
- `.dialogue` - Dialogue avec bordure gauche orange
- `.tirade` - Monologue avec fond coloré
- `.aparte` - Aparté en italique sur fond gris

## Dépendances

### Packages npm

```json
{
  "codemirror": "^6.0.0",
  "@codemirror/state": "^6.0.0",
  "@codemirror/view": "^6.0.0",
  "@codemirror/commands": "^6.0.0",
  "@codemirror/language": "^6.0.0",
  "@lezer/common": "^1.0.0",
  "@lezer/highlight": "^1.0.0",
  "@codemirror/lang-markdown": "^6.0.0"
}
```

## Améliorations futures possibles

1. **Coloration syntaxique personnalisée**
   - Créer un mode de langage CodeMirror spécifique pour les balises théâtrales
   - Colorer différemment chaque type de balise

2. **Autocomplétion**
   - Suggestions automatiques des balises disponibles
   - Autocomplétion des noms de personnages

3. **Navigation**
   - Afficher la structure (actes/scènes) dans la sidebar gauche
   - Cliquer pour naviguer vers une section

4. **Export PDF**
   - Activer le bouton "Exporter PDF"
   - Générer un PDF mis en forme à partir du HTML

5. **Validation**
   - Vérifier la syntaxe des balises
   - Afficher les erreurs de parsing

6. **Raccourcis clavier**
   - Insérer rapidement des balises courantes
   - Navigation rapide entre sections

7. **Undo/Redo**
   - Activer les boutons Annuler/Rétablir
   - Intégrer l'historique de CodeMirror avec l'UI
