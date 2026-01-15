# Scenacte

Éditeur web de pièces de théâtre avec versioning automatique et export PDF.

🔗 **[scenacte.fr](https://scenacte.fr)**

## Syntaxe

Scenacte utilise une syntaxe markup simple :

| Symbole | Usage | Exemple |
|---------|-------|---------|
| `#` | Acte | `# Acte I` |
| `##` | Scène | `## Scène 1` |
| `@` | Personnage | `@JEAN` |
| `()` | Didascalie | `(il sort)` |

## Fonctionnalités

- Éditeur avec preview HTML temps réel
- Versioning automatique (style Google Docs)
- Export PDF avec templates éditeur
- Mode invité (sans compte)
- Statistiques : actes, scènes, personnages, durée estimée

## Stack

**Frontend** : React 19, Vite, TailwindCSS v4
**Backend** : Node.js, Express, PostgreSQL
**PDF** : PagedJS

## Documentation

- [Documentation client](./client/README.md)
- [Documentation serveur](./server/README.md)
- [Déploiement](./DEPLOYMENT.md)

## Licence

MIT — voir [LICENSE](./LICENSE)
