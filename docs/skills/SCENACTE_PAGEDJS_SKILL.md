# PagedJS Skill pour Scenacte

## Vue d'ensemble

PagedJS est un polyfill JavaScript qui implÃ©mente les spÃ©cifications CSS Paged Media et Generated Content. Il transforme du HTML/CSS en contenu paginÃ© pour l'impression ou l'export PDF.

**NouveautÃ© 2025** : L'Ã©quipe PagedJS modularise la librairie. Le premier module publiÃ© est `<paged-page>`, un web component autonome pour la prÃ©visualisation de pages.

## API principale

### Previewer

```javascript
import { Previewer } from 'pagedjs';

const paged = new Previewer();
const flow = await paged.preview(
  DOMContent,           // Ã‰lÃ©ment DOM ou HTML string
  ["styles.css"],       // Tableau de chemins CSS
  document.body         // Conteneur de rendu
);
console.log(flow.total); // Nombre de pages gÃ©nÃ©rÃ©es
```

### Configuration (mode polyfill)

```javascript
window.PagedConfig = {
  auto: false,  // DÃ©sactiver l'exÃ©cution automatique
  before: async () => { /* prÃ©paration */ },
  after: (flow) => { console.log("Rendu terminÃ©", flow.total) }
};
// Puis appeler manuellement :
window.PagedPolyfill.preview();
```

## Hooks disponibles

Les hooks permettent d'intervenir Ã  diffÃ©rentes Ã©tapes du rendu :

### Cycle de vie Previewer
- `beforePreview(content, renderTo)` â€” Avant tout traitement
- `afterPreview(pages)` â€” AprÃ¨s rendu complet

### Cycle de vie Chunker (fragmentation)
- `beforeParsed(content)` â€” Avant parsing, permet de modifier le DOM
- `filter(content)` â€” Filtrer le contenu
- `afterParsed(parsed)` â€” AprÃ¨s parsing, avant rendu
- `beforePageLayout(page)` â€” Avant mise en page d'une page
- `onPageLayout(pageWrapper, breakToken, layout)` â€” Pendant la mise en page
- `afterPageLayout(pageElement, page, breakToken)` â€” AprÃ¨s mise en page, permet d'ajuster le breakToken
- `finalizePage(pageElement, page, breakToken)` â€” Finalisation d'une page
- `afterRendered(pages)` â€” AprÃ¨s rendu de toutes les pages

### Cycle de vie Polisher (CSS)
- `beforeTreeParse(text, sheet)` â€” Avant parsing CSS
- `beforeTreeWalk(ast)` â€” Avant parcours de l'AST
- `afterTreeWalk(ast, sheet)` â€” AprÃ¨s parcours
- `onUrl(urlNode)` â€” Sur chaque URL
- `onAtPage(atPageNode)` â€” Sur chaque rÃ¨gle @page
- `onRule(ruleNode)` â€” Sur chaque rÃ¨gle CSS
- `onDeclaration(declarationNode, ruleNode)` â€” Sur chaque dÃ©claration
- `onContent(contentNode, declarationNode, ruleNode)` â€” Sur propriÃ©tÃ©s content

### CrÃ©ation d'un Handler personnalisÃ©

```javascript
class MonHandler extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  beforeParsed(content) {
    // Modifier le DOM avant parsing
    const liens = content.querySelectorAll('a[href^="http"]');
    liens.forEach(l => l.classList.add('lien-externe'));
  }

  afterPageLayout(pageElement, page, breakToken) {
    // Ajouter un numÃ©ro de page personnalisÃ©
    const footer = pageElement.querySelector('.pagedjs_margin-bottom-center');
    if (footer) footer.textContent = `â€” ${page.position + 1} â€”`;
    return breakToken; // Peut Ãªtre modifiÃ© pour ajuster les sauts
  }
}

Paged.registerHandlers(MonHandler);
```

## CSS Paged Media

### Structure @page

```css
@page {
  size: 148mm 210mm;  /* A5 */
  margin: 20mm 15mm 25mm 15mm;
  
  /* Margin boxes (16 zones disponibles) */
  @top-center {
    content: string(titre-courant);
  }
  @bottom-center {
    content: counter(page);
  }
}
```

### Les 16 margin boxes

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ @top-left-corner â”‚ @top-left â”‚ @top-center â”‚ @top-right â”‚ @top-right-corner â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ @left-top        â”‚                                       â”‚ @right-top       â”‚
â”‚ @left-middle     â”‚          ZONE DE CONTENU              â”‚ @right-middle    â”‚
â”‚ @left-bottom     â”‚                                       â”‚ @right-bottom    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ @bottom-left-corner â”‚ @bottom-left â”‚ @bottom-center â”‚ @bottom-right â”‚ @bottom-right-corner â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### SÃ©lecteurs de page

```css
@page :first { }      /* PremiÃ¨re page */
@page :left { }       /* Pages de gauche (paires) */
@page :right { }      /* Pages de droite (impaires) */
@page :blank { }      /* Pages vides automatiques */
@page :nth(5) { }     /* Page spÃ©cifique */
```

### Named pages

```css
/* Associer un layout Ã  un type de contenu */
.page-titre {
  page: titre;
}

@page titre {
  margin: 0;
  @bottom-center { content: none; }
}
```

### Running headers (titres courants)

```css
/* 1. Capturer le contenu */
h1 {
  string-set: titre-chapitre content();
}

/* Ou avec un Ã©lÃ©ment dÃ©diÃ© */
.running-title {
  position: running(titre-courant);
}

/* 2. Afficher dans les marges */
@page {
  @top-center {
    content: string(titre-chapitre);
    /* ou */
    content: element(titre-courant);
  }
}
```

### Compteurs

```css
/* Compteur de pages */
@page {
  @bottom-center {
    content: counter(page) " / " counter(pages);
  }
}

/* Compteurs personnalisÃ©s */
body { counter-reset: acte scene; }
.acte { counter-increment: acte; counter-reset: scene; }
.scene { counter-increment: scene; }
.acte::before { content: "Acte " counter(acte, upper-roman); }
.scene::before { content: "ScÃ¨ne " counter(scene); }
```

### ContrÃ´le des sauts de page

```css
/* Forcer un saut */
.acte { page-break-before: always; }

/* Ã‰viter un saut */
.replique { page-break-inside: avoid; }
h2 { page-break-after: avoid; }

/* Orphelines et veuves */
p {
  orphans: 3;  /* Min lignes en bas de page */
  widows: 3;   /* Min lignes en haut de page */
}
```

## Conventions Scenacte (Ã€ COMPLÃ‰TER)

### Structure HTML thÃ©Ã¢trale

```html
<div class="piece">
  <header class="titre-piece">
    <h1>Titre</h1>
    <p class="auteur">Auteur</p>
  </header>
  
  <section class="acte">
    <h2>Acte I</h2>
    <div class="didascalie liminaire">Description du dÃ©cor...</div>
    
    <section class="scene">
      <h3>ScÃ¨ne 1</h3>
      
      <div class="replique">
        <span class="personnage">JEAN</span>
        <span class="didascalie pre-replique">ironiquement</span>
        <p class="texte">Bonjour <span class="didascalie intra-replique">il sourit</span> comment vas-tu ?</p>
      </div>
      
      <div class="didascalie inter-repliques">Il sort.</div>
    </section>
  </section>
</div>
```

### Types de didascalies (4 types positionnels)

| Type | Position | Traitement typographique |
|------|----------|-------------------------|
| `liminaire` | Avant acte/scÃ¨ne | Italique, taille normale, bloc |
| `inter-rÃ©pliques` | Entre deux rÃ©pliques | Italique, centrÃ© ou justifiÃ© |
| `prÃ©-rÃ©plique` | AprÃ¨s nom personnage | Italique, entre parenthÃ¨ses, inline |
| `intra-rÃ©plique` | Dans le texte | Italique, entre parenthÃ¨ses, inline |

### Templates Ã©diteurs (Ã€ documenter)

- Actes Sud-Papiers
- L'Arche
- Ã‰ditions ThÃ©Ã¢trales
- (autres selon analyse des ouvrages)

## IntÃ©gration React

### Pattern recommandÃ©

```javascript
import { Previewer } from 'pagedjs';

const PdfPreview = ({ content, styles }) => {
  const containerRef = useRef(null);
  const previewerRef = useRef(null);

  useEffect(() => {
    const render = async () => {
      // Nettoyer le rendu prÃ©cÃ©dent
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      
      previewerRef.current = new Previewer();
      
      try {
        const flow = await previewerRef.current.preview(
          content,
          [styles],
          containerRef.current
        );
        console.log(`${flow.total} pages gÃ©nÃ©rÃ©es`);
      } catch (error) {
        console.error('Erreur PagedJS:', error);
      }
    };

    render();

    return () => {
      // Cleanup si nÃ©cessaire
    };
  }, [content, styles]);

  return <div ref={containerRef} className="pdf-container" />;
};
```

### Optimisations performance

1. **Debouncer les re-rendus** â€” Ne pas re-gÃ©nÃ©rer Ã  chaque keystroke
2. **MÃ©moiser le contenu** â€” Ã‰viter les re-rendus inutiles
3. **Lazy loading** â€” Charger PagedJS uniquement quand nÃ©cessaire
4. **Web Worker** â€” Envisager le parsing dans un worker pour les longs documents

## Web Component `<paged-page>` (Nouveau 2025)

Module autonome pour prÃ©visualiser une page imprimÃ©e sans charger tout PagedJS.

### Installation

```html
<script type="module" src="https://unpkg.com/@pagedjs/paged-page@0.1.0/dist/PagedPreview.js"></script>
```

### Usage basique

```html
<paged-page width="148mm" height="210mm" margin="20mm 15mm" bleed="3mm" marks="crop cross">
  <h1>Titre de la piÃ¨ce</h1>
  <p>Contenu de la page...</p>
</paged-page>
```

### Attributs disponibles

| Attribut | Description | Exemple |
|----------|-------------|---------|
| `width` | Largeur de la page (hors bleed) | `148mm` |
| `height` | Hauteur de la page (hors bleed) | `210mm` |
| `margin` | Marges (syntaxe CSS) | `20mm 15mm 25mm 15mm` |
| `bleed` | Fond perdu | `3mm` |
| `marks` | Marques de coupe/repÃ©rage | `crop cross` |

### Styliser le contenu (cascade CSS naturelle)

```css
/* Cibler le contenu directement */
#page-12 h2 { color: blue; }

/* Cibler la zone de page via ::part */
#page-12::part(page-area) { background: #f5f5f5; }

/* Cibler les margin boxes */
#page-12::part(bottom-center) { font-size: 0.8em; }
#page-12::part(top-right)::after { content: counter(page); }
```

### Margin boxes avec slots

```html
<paged-page width="148mm" height="210mm">
  <paged-margins slot="page-margins">
    <paged-margin-content slot="top-center">Titre courant</paged-margin-content>
    <paged-margin-content slot="bottom-center">â€” page â€”</paged-margin-content>
    <paged-margin-content slot="bottom-right">Auteur</paged-margin-content>
  </paged-margins>
  
  <div class="contenu">
    <!-- Contenu de la page -->
  </div>
</paged-page>
```

### Avantages pour Scenacte

1. **PrÃ©visualisation lÃ©gÃ¨re** â€” Pas besoin de charger tout PagedJS pour afficher une page
2. **Cascade CSS naturelle** â€” Styliser le contenu via sÃ©lecteurs classiques
3. **Multi-format** â€” Plusieurs `<paged-page>` de tailles diffÃ©rentes = PDF multi-format
4. **Plus de @page nÃ©cessaire** â€” Les attributs HTML remplacent les rÃ¨gles @page

## PiÃ¨ges courants

1. **Running elements en fin de HTML** â€” Les placer en dÃ©but de document
2. **Re-render sans cleanup** â€” Vider le conteneur avant nouveau preview
3. **CSS spÃ©cificitÃ©** â€” Les styles PagedJS peuvent Ãªtre Ã©crasÃ©s
4. **Fonts non chargÃ©es** â€” Attendre le chargement complet avant preview
5. **Images non chargÃ©es** â€” Utiliser `beforeParsed` pour attendre

## Ressources

- [Documentation officielle](https://pagedjs.org/documentation/)
- [GitHub PagedJS](https://github.com/pagedjs/pagedjs)
- [CSS Paged Media Level 3](https://www.w3.org/TR/css-page-3/)
- [CSS Generated Content for Paged Media](https://www.w3.org/TR/css-gcpm-3/)