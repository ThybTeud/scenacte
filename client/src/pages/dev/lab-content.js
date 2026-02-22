/**
 * Contenu de test pour le Template Lab
 * Couvre les 4 types de didascalies, répliques courtes/longues,
 * actes, scènes, layouts centered/inline
 */

export const LAB_CONTENT = `
<div class="acte-container">
  <h1 class="acte">Acte I</h1>

  <div class="scene-container">
    <h2 class="scene">Scène 1</h2>

    <p class="didascalie" data-type="opening">Une place publique à Paris. Le matin. On entend au loin le bruit de la foule qui s'agite. Des marchands installent leurs étals, des enfants courent entre les passants.</p>

    <div class="personnage-container">
      <h3 class="personnage" data-name="ARMANDE">ARMANDE</h3>
      <p class="didascalie" data-type="pre">seule, regardant au loin</p>
      <p class="dialogue" data-speaker="ARMANDE">Enfin seule ! Depuis des mois je guettais ce moment, cette heure précise où le destin nous offrirait une chance de nous retrouver, loin des regards indiscrets et des oreilles qui traînent. Mais voilà que le temps s'écoule et que personne ne vient.</p>
    </div>

    <div class="personnage-container">
      <h3 class="personnage" data-name="BAPTISTE">BAPTISTE</h3>
      <p class="didascalie" data-type="pre">surgissant</p>
      <p class="dialogue" data-speaker="BAPTISTE">Me voici.</p>
    </div>

    <div class="personnage-container">
      <h3 class="personnage" data-name="ARMANDE">ARMANDE</h3>
      <p class="dialogue" data-speaker="ARMANDE">Toi ? <span class="didascalie" data-type="intra">elle recule d'un pas</span> Déjà ?</p>
    </div>

    <div class="personnage-container">
      <h3 class="personnage" data-name="BAPTISTE">BAPTISTE</h3>
      <p class="dialogue" data-speaker="BAPTISTE">Tu m'attendais, non ?</p>
    </div>

    <p class="didascalie" data-type="between">Elle hésite, puis se détourne.</p>

    <div class="personnage-container">
      <h3 class="personnage" data-name="ARMANDE">ARMANDE</h3>
      <p class="dialogue" data-speaker="ARMANDE">Oui, bien sûr. Mais pas si tôt. <span class="didascalie" data-type="intra">un temps</span> J'avais besoin de rassembler mes pensées, de préparer mes mots. Tu sais combien il m'est difficile de parler de ce qui me tient à cœur.</p>
    </div>

    <div class="personnage-container">
      <h3 class="personnage" data-name="BAPTISTE">BAPTISTE</h3>
      <p class="dialogue" data-speaker="BAPTISTE">Alors parlons de choses simples. Le temps, par exemple. Il fait beau aujourd'hui.</p>
    </div>

    <div class="personnage-container">
      <h3 class="personnage" data-name="ARMANDE">ARMANDE</h3>
      <p class="didascalie" data-type="pre">avec véhémence</p>
      <p class="dialogue" data-speaker="ARMANDE">Le temps ? Baptiste, nous n'avons pas le luxe de parler du temps qu'il fait quand le temps qui nous reste s'amenuise à chaque seconde ! Tu ne comprends donc pas ? Tout ce que nous avons vécu, tout ce que nous aurions pu vivre encore, tout cela disparaîtra si nous ne prenons pas la décision maintenant, ici, dans cette place où personne ne nous connaît.</p>
    </div>
  </div>

  <div class="scene-container">
    <h2 class="scene">Scène 2</h2>

    <p class="didascalie" data-type="opening">Entre Céleste, hors d'haleine.</p>

    <div class="personnage-container">
      <h3 class="personnage" data-name="CÉLESTE">CÉLESTE</h3>
      <p class="dialogue" data-speaker="CÉLESTE">Ils arrivent ! Les gardes sont à deux rues d'ici !</p>
    </div>

    <div class="personnage-container">
      <h3 class="personnage" data-name="BAPTISTE">BAPTISTE</h3>
      <p class="dialogue" data-speaker="BAPTISTE">Déjà ?</p>
    </div>

    <div class="personnage-container">
      <h3 class="personnage" data-name="CÉLESTE">CÉLESTE</h3>
      <p class="dialogue" data-speaker="CÉLESTE">Oui, déjà !</p>
    </div>

    <p class="didascalie" data-type="between">Un silence pesant.</p>

    <div class="personnage-container">
      <h3 class="personnage" data-name="ARMANDE">ARMANDE</h3>
      <p class="didascalie" data-type="pre">dans un souffle</p>
      <p class="dialogue" data-speaker="ARMANDE">Il faut fuir.</p>
    </div>

    <div class="personnage-container">
      <h3 class="personnage" data-name="BAPTISTE">BAPTISTE</h3>
      <p class="dialogue" data-speaker="BAPTISTE">Non. <span class="didascalie" data-type="intra">il se lève lentement</span> Il est trop tard pour fuir. Nous devons affronter ce qui vient.</p>
    </div>
  </div>
</div>

<div class="acte-container">
  <h1 class="acte">Acte II</h1>

  <div class="scene-container">
    <h2 class="scene">Scène 1</h2>

    <p class="didascalie" data-type="opening">Une prison. Le soir. Baptiste est seul dans sa cellule, assis sur un banc de pierre. La lumière décline lentement à travers l'étroite fenêtre.</p>

    <div class="personnage-container">
      <h3 class="personnage" data-name="BAPTISTE">BAPTISTE</h3>
      <p class="didascalie" data-type="pre">seul</p>
      <p class="dialogue" data-speaker="BAPTISTE">Ainsi donc, c'est ici que tout se termine. Entre quatre murs de pierre froide, sans un rayon de soleil pour me réchauffer le cœur. <span class="didascalie" data-type="intra">il se lève et arpente la cellule</span> J'ai passé ma vie à chercher la liberté, à fuir les contraintes, à refuser toute forme d'emprisonnement — qu'il soit physique ou moral. Et voilà où mes choix m'ont mené : dans la plus littérale des prisons.</p>
      <p class="dialogue" data-speaker="BAPTISTE">L'ironie du sort est parfois d'une cruauté consommée. Mais au fond, n'étais-je pas déjà prisonnier bien avant qu'ils ne m'enferment ici ? <span class="didascalie" data-type="intra">un temps</span> Prisonnier de mes peurs, de mes doutes, de cette incapacité chronique à dire ce que je ressentais vraiment ? Armande avait raison. Elle a toujours raison. Et maintenant il est trop tard.</p>
    </div>

    <p class="didascalie" data-type="between">On entend des pas dans le couloir. Une clé tourne dans la serrure.</p>

    <div class="personnage-container">
      <h3 class="personnage" data-name="LE GEÔLIER">LE GEÔLIER</h3>
      <p class="dialogue" data-speaker="LE GEÔLIER">Debout. Tu as de la visite.</p>
    </div>

    <p class="didascalie" data-type="between">Entre Armande. Le geôlier sort et referme la porte.</p>

    <div class="personnage-container">
      <h3 class="personnage" data-name="BAPTISTE">BAPTISTE</h3>
      <p class="dialogue" data-speaker="BAPTISTE">Toi ?</p>
    </div>

    <div class="personnage-container">
      <h3 class="personnage" data-name="ARMANDE">ARMANDE</h3>
      <p class="dialogue" data-speaker="ARMANDE">Moi.</p>
    </div>

    <p class="didascalie" data-type="between">Un long silence.</p>

    <div class="personnage-container">
      <h3 class="personnage" data-name="BAPTISTE">BAPTISTE</h3>
      <p class="dialogue" data-speaker="BAPTISTE">Je ne pensais pas que tu viendrais.</p>
    </div>

    <div class="personnage-container">
      <h3 class="personnage" data-name="ARMANDE">ARMANDE</h3>
      <p class="dialogue" data-speaker="ARMANDE">Moi non plus. <span class="didascalie" data-type="intra">elle s'approche</span> Mais me voilà.</p>
    </div>
  </div>

  <div class="scene-container">
    <h2 class="scene">Scène 2</h2>

    <p class="didascalie" data-type="opening">Le lendemain. Aube. La cellule est baignée d'une lumière douce.</p>

    <div class="personnage-container">
      <h3 class="personnage" data-name="BAPTISTE">BAPTISTE</h3>
      <p class="didascalie" data-type="pre">souriant pour la première fois</p>
      <p class="dialogue" data-speaker="BAPTISTE">C'est étrange. Pour la première fois de ma vie, je me sens libre.</p>
    </div>
  </div>
</div>
`;