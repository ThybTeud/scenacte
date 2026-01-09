# Recommandations CSS pour l'AST hiérarchique

## Nouveaux containers HTML

La fonction `astToHTML()` génère maintenant des containers supplémentaires :
- `.acte-container` - Englobe l'acte et ses scènes
- `.scene-container` - Englobe la scène et ses personnages
- `.personnage-container` - Englobe le personnage et ses dialogues/didascalies

## Styles CSS recommandés

### Option 1: Pas de styles supplémentaires (recommandé)
Les containers peuvent rester sans styles spécifiques, permettant une flexibilité CSS maximale.

```css
/* Aucun style requis - les containers servent uniquement à la structure */
```

### Option 2: Ajouter de l'espacement structurel
Si vous souhaitez un espacement visuel entre les sections :

```css
.acte-container {
  margin-bottom: 3rem;
}

.scene-container {
  margin-bottom: 2rem;
}

.personnage-container {
  margin-bottom: 1.5rem;
}
```

### Option 3: Debugging et développement
Pour visualiser la hiérarchie pendant le développement :

```css
/* Uniquement pour le développement - à retirer en production */
.acte-container {
  border: 2px solid blue;
  padding: 1rem;
  margin: 0.5rem;
}

.scene-container {
  border: 2px solid green;
  padding: 1rem;
  margin: 0.5rem;
}

.personnage-container {
  border: 2px solid orange;
  padding: 1rem;
  margin: 0.5rem;
}
```

## Styles existants dans PlayPreview.jsx

Les styles actuels (lignes 87-145) restent compatibles :
- `.play-root` ✓
- `.acte` ✓
- `.scene` ✓
- `.personnage` ✓
- `.didascalie` ✓
- `.dialogue` ✓
- `.text` ✓

Aucune modification requise pour les styles existants.

## Recommandation finale

**Commencer sans styles supplémentaires** pour les containers. Les styles existants suffisent pour un rendu correct. Les containers servent principalement à :

1. Permettre un styling CSS plus flexible à l'avenir
2. Faciliter la manipulation DOM si nécessaire
3. Améliorer la structure sémantique du HTML

Ajoutez des styles uniquement si vous constatez un besoin spécifique (espacement, bordures, backgrounds, etc.).
