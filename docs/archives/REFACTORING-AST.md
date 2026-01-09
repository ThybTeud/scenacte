# Refactorisation AST Hiérarchique - playParser.js

## Résumé des modifications

Le parser a été refactorisé pour générer un **AST hiérarchique** au lieu d'un AST plat.

### Avant (AST plat)
```
root
├── acte
├── scene
├── personnage
├── dialogue
├── didascalie
└── ...
```
Tous les nœuds étaient ajoutés comme enfants directs de `root`.

### Après (AST hiérarchique)
```
root
├── acte
│   └── scene
│       └── personnage
│           ├── dialogue
│           └── didascalie
```
Chaque nœud est attaché à son parent logique selon la hiérarchie de la pièce.

## Règles d'imbrication

1. **Actes** → enfants de `root`
2. **Scènes** → enfants de l'acte courant (ou `root` si pas d'acte)
3. **Personnages** → enfants de la scène courante (ou du parent le plus haut disponible)
4. **Dialogues et didascalies** → enfants du personnage courant
5. **Texte orphelin** → ajouté au contexte le plus proche disponible

## Modifications du code

### 1. Méthode `parse()` (lignes 79-163)

**Ajout de pointeurs de contexte:**
```javascript
let currentActe = null;
let currentScene = null;
let currentPersonnage = null;
let currentSpeaker = null;
```

Ces pointeurs sont mis à jour au fil du parsing pour maintenir le contexte hiérarchique.

**Utilisation de `getParentFor()` :**
Chaque nœud est maintenant ajouté au bon parent grâce à la méthode helper `getParentFor()`.

### 2. Nouvelle méthode `getParentFor()` (lignes 165-195)

Détermine le parent approprié pour chaque type de nœud selon les règles d'imbrication.

```javascript
getParentFor(type, currentActe, currentScene, currentPersonnage, root) {
  switch(type) {
    case NodeType.ACTE:
      return root;
    case NodeType.SCENE:
      return currentActe || root;
    case NodeType.PERSONNAGE:
      return currentScene || currentActe || root;
    case NodeType.DIALOGUE:
    case NodeType.DIDASCALIE:
      return currentPersonnage || currentScene || currentActe || root;
    // ...
  }
}
```

### 3. Fonction `astToHTML()` (lignes 285-324)

Rendu **récursif** des enfants pour chaque nœud.

**Modifications principales:**
- Ajout de `childrenHTML` qui rend récursivement tous les enfants
- Ajout de containers `<div>` pour les actes, scènes et personnages
- Permet un styling CSS plus flexible

**Structure HTML générée:**
```html
<div class="play-root">
  <div class="acte-container">
    <h1 class="acte">Acte 1</h1>
    <div class="scene-container">
      <h2 class="scene">Scène 1</h2>
      <div class="personnage-container">
        <h3 class="personnage">BEN</h3>
        <p class="dialogue">Coucou !</p>
        <p class="didascalie"><em>il sourit</em></p>
      </div>
    </div>
  </div>
</div>
```

## Compatibilité

### ✅ Maintenu
- Classe `ASTNode` inchangée
- Enum `NodeType` inchangé
- Méthode `toJSON()` fonctionne récursivement (inchangée)
- Fonction `extractStructure()` fonctionne (traverse récursivement)

### ⚠️ À vérifier
- Les composants qui utilisent `astToHTML()` doivent être testés avec la nouvelle structure HTML
- Le CSS peut nécessiter des ajustements pour les nouveaux containers (`acte-container`, `scene-container`, etc.)

## Tests effectués

### Test 1: Exemple de base
**Input:**
```
#Acte 1
##Scène 1
@BEN
Coucou !
(il sourit)
@PP
Bonjour.
##Scène 2
@BEN
Fin.
```

**Résultat:** ✅ Structure parfaitement hiérarchique
- Acte 1 → 2 scènes
- Scène 1 → 2 personnages (BEN avec 2 enfants, PP avec 1 enfant)
- Scène 2 → 1 personnage (BEN avec 1 enfant)

### Test 2: Cas limites
✅ Scène sans acte → attachée à root
✅ Personnage sans scène → attaché à root
✅ Didascalie orpheline → attachée au contexte le plus proche
✅ Multiples actes et scènes → bien séparés
✅ Dialogue et didascalie mélangés → correctement parsés
✅ Plusieurs personnages dans une scène → tous enfants de la scène

### Test 3: Rendu HTML
✅ Tous les containers présents
✅ Structure HTML hiérarchique correcte
✅ Contenu préservé

## Fichiers de test créés

- `test-hierarchical-ast.js` - Vérifie la structure de l'AST
- `test-html-render.js` - Vérifie le rendu HTML
- `test-html-formatted.js` - Affiche le HTML formaté
- `test-edge-cases.js` - Teste les cas limites

## Prochaines étapes recommandées

1. ✅ Tester l'intégration dans les composants React qui utilisent le parser
2. ✅ Vérifier le CSS pour les nouveaux containers
3. ✅ Tester avec de vraies pièces de théâtre complètes
4. ⚠️ Considérer la mise à jour des statistiques (`playStatistics.js`) si elles dépendent de la structure plate

## Notes techniques

- La méthode `parseLine()` n'a pas été modifiée (lignes 197-277)
- Les expressions régulières `TAG_PATTERNS` sont inchangées
- Le comportement pour les lignes vides est conservé (ligne 96-97)
- Les positions (`position.start`, `position.end`) sont préservées
