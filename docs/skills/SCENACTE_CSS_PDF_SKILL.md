# Skill — Scenacte CSS Templates & PDF

> Référence complète du système de templates PDF, conventions typographiques et intégration PagedJS

---

## Presets disponibles

| ID | Nom | Layout | Format | Police | Marges T/B/I/O (mm) |
|----|-----|--------|--------|--------|----------------------|
| `classique` | Classique | `centered` | A5 148×210mm | EB Garamond, Garamond, serif | 15/20/15/15 |
| `moderne` | Moderne | `inline` | A5 148×210mm | Crimson Text, Georgia, serif | 18/20/15/15 |

Default : `classique`. `getPreset(id)` avec fallback. `generatePresetCSS(preset)` génère les variables `:root` + `@page`.

---

## Variables CSS de base (`scenacte-template.css`)

```css
:root {
  --page-width: 148mm;       --page-height: 210mm;
  --margin-top: 20mm;        --margin-bottom: 25mm;
  --margin-inside: 20mm;     --margin-outside: 15mm;
  --font-body: 'Crimson Text', Georgia, serif;
  --font-size-body: 11pt;    --font-size-personnage: 11.5pt;
  --font-size-acte: 18pt;    --font-size-scene: 14pt;
  --line-height: 1.45;
  --space-replique: 0.8em;   --space-acte: 2em;  --space-scene: 1.5em;
  --color-text: #1a1a1a;     --color-subtitle: #555;
}
```

---

## Conventions typographiques

| Élément | Taille | Poids | Casse | Alignement |
|---------|--------|-------|-------|------------|
| Acte | 16-18pt | 900 | UPPERCASE | centré |
| Scène | 13-14pt | 700 | UPPERCASE | centré |
| Personnage | 11-11.5pt | 600 | UPPERCASE | centré ou inline |
| Dialogue | 11pt | 400 | normal | justifié |
| Didascalie | 11pt | 400 italic | variable | selon type |
| Numéro de page | 10pt | 400 | — | centré bas |
| Running header | 9pt | 400 italic | UPPERCASE | centré haut |

**Polices Google Fonts** : EB Garamond, Crimson Text (avec fallbacks serif).

---

## Layouts (`data-layout`)

### `centered` — Personnage centré, dialogue en dessous

```css
.play-root[data-layout="centered"] h3.personnage { display: block; text-align: center; }
/* Sans pré-réplique : JEAN (seul, centré) */
/* Avec pré-réplique : JEAN, hésitant. (inline + virgule via ::after) */
```

### `inline` — Personnage en ligne avec tiret cadratin

```css
.play-root[data-layout="inline"] h3.personnage { display: inline; }
/* Sans pré-réplique : JEAN. — Bonjour (::after { content: '. \2014\a0 ' }) */
/* Avec pré-réplique : JEAN, hésitant. — Bonjour */
```

Les règles utilisent `:has(> .didascalie[data-type="pre"])` pour adapter la ponctuation.

---

## Pipeline PDF complet

```
1. usePlayParsing()              →  htmlContent (HTML sémantique)
2. generatePdfHtml({             →  HTML complet standalone
     htmlContent,
     playTitle, playSubtitle,
     presetId                       → baseCSS + presetCSS + Google Fonts + PagedJS CDN
   })
3. PdfPreview.jsx                →  Blob URL → <iframe src={blobUrl}>
4. PagedJS (dans l'iframe)       →  Pagination, headers courantes, page breaks
5. Event 'pagedjs-ready'         →  Affichage responsive (scale = min(1, width/pageWidth))
6. printPdf(iframeRef)           →  iframe.contentWindow.print() → dialogue impression
```

---

## Règles @page

```css
@page {
  size: var(--page-width) var(--page-height);
  margin: var(--margin-top) var(--margin-outside) var(--margin-bottom) var(--margin-inside);
  @bottom-center { content: counter(page); }
}
@page :left  { @top-center { content: string(play-title); } }
@page :right { @top-center { content: string(current-acte); }
               @top-right  { content: string(current-scene); } }
@page :first { @bottom-center, @top-center { content: none; } }
```

---

## Scoping preview

`buildPreviewCSS()` réécrit `body {}` → `.preview-content {}` et supprime `visibility: hidden` pour permettre l'affichage dans le panneau preview sans PagedJS.

---

## Pages de développement

Les pages de test des templates (`/dev`, `/lab`) sont intégrées à l'app principale (accessibles uniquement en mode DEV) pour tester dans le même environnement que la production.

---

## Roadmap templates

Templates inspirés d'éditeurs français à développer :
- Actes Sud-Papiers
- L'Arche
- Éditions Théâtrales
- (autres selon analyse physique des ouvrages)

Formulaires de mesures détaillés créés pour analyser les livres physiques et créer des templates numériques fidèles.
