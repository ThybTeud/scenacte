# Skill — Scenacte Parser

> Référence complète du pipeline de parsing : syntaxe markup → AST → HTML/structure/stats

---

## Syntaxe markup

| Balise | Regex | Usage | Exemple |
|--------|-------|-------|---------|
| `#` | `^#(?!#)\s*(.+?)\s*$` | Acte / Section | `#Acte I` |
| `##` | `^##\s*(.+?)\s*$` | Scène / Sous-section | `##Scène 1` |
| `@` | `^@\s*(.+?)\s*$` | Personnage | `@HAMLET` |
| `(…)` ligne entière | `^\(\s*([^)]+)\s*\)$` | Didascalie bloc → opening, between ou pre selon contexte | `(Il entre)` |
| `(…)` inline | `\(([^)]+)\)` | Didascalie dans dialogue → toujours intra | `Bonjour (il sourit)` |
| `(…) texte` | `^\(([^)]+)\)\s*(.+)$` | Pré-réplique + dialogue → pre | `(hésitant) Bonjour` |

3 patterns syntaxiques → 4 types sémantiques. C'est l'algorithme de classification (voir ci-dessous) qui résout le type final.

---

## Les 4 types de didascalies

| Type | Nom | Condition | HTML | CSS |
|------|-----|-----------|------|-----|
| `opening` | Liminaire | `(texte)` bloc avant tout `@` dans le conteneur | `<p class="didascalie" data-type="opening">` | italic, justify, margin 0.8em |
| `between` | Inter-réplique | `(texte)` bloc après au moins un SPEECH | `<p class="didascalie" data-type="between">` | italic, right-aligned, fit-content |
| `pre` | Pré-réplique | `(texte)` bloc en première ligne après `@`, ou `(texte) dialogue` | `<p class="didascalie" data-type="pre">` | inline, lowercase |
| `intra` | Intra-réplique | `(texte)` inline dans une ligne de dialogue | `<span class="didascalie" data-type="intra">` | inline italic, parenthèses via `::before`/`::after` |

**Algorithme de classification** :
```
Pattern (…) ligne entière :
  if isFirstLineInSpeech        → 'pre'
  else if !hasSpeechInContainer  → 'opening'
  else                           → 'between'

Pattern (…) texte :             → 'pre' (toujours)

Pattern (…) inline :            → 'intra' (toujours)
```

**Règle fondamentale** : les parenthèses sont rendues en CSS (`::before`/`::after`), jamais stockées dans le contenu.

---

## AST — Structure

```js
const NodeType = {
  ROOT: 'root',
  SECTION: 'section',           // # Acte
  SUBSECTION: 'subsection',     // ## Scène
  SPEECH: 'speech',             // @ Personnage
  STAGE_DIRECTION: 'stage_direction',
  LINE: 'line',                 // Ligne de dialogue
  TEXT_RUN: 'text_run',         // Fragment de texte
  LINE_BREAK: 'line_break'
};

class ASTNode {
  type        // NodeType
  value       // string|null
  attributes  // { speaker?, title?, directionType? }
  children    // ASTNode[]
  position    // { start: number, end: number } (lignes, base 0)
}
```

---

## Pipeline de transformation

```
Texte brut (markup Scenacte)
       │
  PlayParser.parse()              → AST (arbre ASTNode)    [O(n) lignes]
       │
       ├── astToHTML()            → HTML sémantique (classes CSS théâtrales)
       ├── extractStructure()     → { items[], orphanScenes[], personnages[] }
       └── calculateStatsFromAST()→ { totalActs, totalScenes, totalCharacters,
                                       totalRepliques, wordCount, estimatedDurationMinutes }
```

Orchestré par `usePlayParsing(content, parser)` avec `useMemo` — parse une seule fois, dérive tout.

---

## Exemple complet

### Input
```
#Acte I
##Scène 1
(Un jardin)
@JEAN
(hésitant) Bonjour (il tousse) comment vas-tu ?
(Un temps)
@MARIE
Bien merci
```

### AST
```
ROOT
└── SECTION { title: "Acte I" }
    └── SUBSECTION { title: "Scène 1" }
        ├── STAGE_DIRECTION [opening] "Un jardin"
        ├── SPEECH { speaker: "JEAN" }
        │   ├── STAGE_DIRECTION [pre] "hésitant"
        │   └── LINE { speaker: "JEAN" }
        │       ├── TEXT_RUN "Bonjour"
        │       ├── STAGE_DIRECTION [intra] "il tousse"
        │       └── TEXT_RUN "comment vas-tu ?"
        ├── STAGE_DIRECTION [between] "Un temps"
        └── SPEECH { speaker: "MARIE" }
            └── LINE → TEXT_RUN "Bien merci"
```

### HTML
```html
<div class="play-root">
  <div class="acte-container">
    <h1 class="acte">Acte I</h1>
    <div class="scene-container">
      <h2 class="scene">Scène 1</h2>
      <p class="didascalie" data-type="opening">Un jardin</p>
      <div class="personnage-container">
        <h3 class="personnage" data-name="JEAN">JEAN</h3>
        <p class="didascalie" data-type="pre">hésitant</p>
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

### Structure extraite
```js
{ items: [{ type: 'acte', value: 'Acte I', scenes: [{ type: 'scene', value: 'Scène 1' }] }],
  orphanScenes: [],
  personnages: ['JEAN', 'MARIE'] }
```

### Statistiques
```js
{ totalActs: 1, totalScenes: 1, totalCharacters: 2, totalRepliques: 2,
  wordCount: 12, estimatedDurationMinutes: 1 /* ceil(wordCount/150) */ }
```

---

## Performance

- **Debounce** : 300ms via `useDebouncedValue`
- **Memoization** : `useMemo` dans `usePlayParsing` — un seul parse, toutes les dérivations
- **Complexité** : O(n) lignes
- **Benchmark** : corpus ~500 lignes, 1000 itérations + 10 warmup, mesure moyenne + P95

---

> ⚠️ **Note** : une refonte du parser est en cours. Ce document sera mis à jour une fois la nouvelle version pushée.
