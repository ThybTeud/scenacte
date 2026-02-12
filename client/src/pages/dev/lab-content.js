/**
 * Contenu HTML de test pour le Template Lab
 * Couvre TOUS les cas typographiques pour valider les templates PDF
 */

export const LAB_HTML_CONTENT = `
<div class="piece" data-layout="centered">
  <!-- PAGE DE TITRE -->
  <header class="titre-piece">
    <h1>Le Misanthrope numérique</h1>
    <p class="auteur">Jean-Claude Test</p>
  </header>

  <!-- ACTE I — Teste : saut de page, didascalie liminaire longue -->
  <section class="acte">
    <h2>Acte I</h2>

    <div class="didascalie" data-type="liminaire">
      Un bureau moderne encombré d'écrans. Lumière bleutée. Au fond, une baie vitrée
      donne sur une ville la nuit. Des câbles serpentent au sol. Une chaise de bureau
      ergonomique trône au centre, vide. On entend le bourdonnement sourd de ventilateurs
      de serveurs. Sur le mur de gauche, un tableau blanc couvert de post-its colorés.
      L'atmosphère est celle d'une startup en fin de sprint, entre euphorie et épuisement.
    </div>

    <!-- SCÈNE 1 — Teste : répliques courtes, pré-réplique, intra-réplique -->
    <section class="scene">
      <h3>Scène 1</h3>

      <div class="replique">
        <span class="personnage">Alceste</span>
        <p class="texte">Non, je ne peux plus supporter cette comédie.</p>
      </div>

      <div class="replique">
        <span class="personnage">Philinte</span>
        <span class="didascalie" data-type="pre-replique">souriant</span>
        <p class="texte">Encore tes principes ?</p>
      </div>

      <div class="replique">
        <span class="personnage">Alceste</span>
        <p class="texte">
          Mes principes ! Tu appelles ça des principes ?
          <span class="didascalie" data-type="intra-replique">il se lève brusquement</span>
          Regarde autour de toi. Tout le monde ment. Tout le monde sourit.
          Tout le monde like. Personne ne pense.
        </p>
      </div>

      <!-- Didascalie inter-répliques -->
      <div class="didascalie" data-type="inter-repliques">
        Un silence. Philinte consulte son téléphone.
      </div>

      <div class="replique">
        <span class="personnage">Philinte</span>
        <span class="didascalie" data-type="pre-replique">sans lever les yeux</span>
        <p class="texte">Tu exagères, comme toujours.</p>
      </div>

      <!-- Réplique longue — Teste : orphans/widows, saut de page potentiel -->
      <div class="replique">
        <span class="personnage">Alceste</span>
        <p class="texte">
          J'exagère ? Hier, Oronte m'a montré son application. Une application
          pour noter les gens. Tu comprends ? Noter les gens comme on note un
          restaurant. Et tout le monde trouvait ça formidable. Formidable ! Ils
          applaudissaient, ils levaient le pouce, ils partageaient le lien. Et moi,
          qu'est-ce que j'ai fait ? J'ai dit la vérité. J'ai dit que c'était médiocre,
          que le design était laid, que l'idée était dangereuse. Et maintenant, tout
          le monde me regarde comme si j'avais commis un crime. Voilà ce que c'est,
          la sincérité, dans ce monde-là.
          <span class="didascalie" data-type="intra-replique">un temps</span>
          On ne veut plus de la vérité. On veut du confort.
        </p>
      </div>

    </section>

    <!-- SCÈNE 2 — Teste : enchaînement rapide, stichomythie -->
    <section class="scene">
      <h3>Scène 2</h3>

      <div class="didascalie" data-type="liminaire">
        Célimène entre, téléphone à la main, radieuse.
      </div>

      <div class="replique">
        <span class="personnage">Célimène</span>
        <p class="texte">Me voilà !</p>
      </div>

      <div class="replique">
        <span class="personnage">Alceste</span>
        <p class="texte">Enfin.</p>
      </div>

      <div class="replique">
        <span class="personnage">Célimène</span>
        <p class="texte">Tu fais la tête ?</p>
      </div>

      <div class="replique">
        <span class="personnage">Alceste</span>
        <p class="texte">Non.</p>
      </div>

      <div class="replique">
        <span class="personnage">Célimène</span>
        <span class="didascalie" data-type="pre-replique">riant</span>
        <p class="texte">Si, tu fais la tête.</p>
      </div>

      <div class="didascalie" data-type="inter-repliques">
        Elle s'assied sur le bureau, jambes croisées, désinvolte.
      </div>

      <div class="replique">
        <span class="personnage">Célimène</span>
        <p class="texte">
          Figure-toi que j'ai eu trois mille vues sur ma story. Trois mille !
          <span class="didascalie" data-type="intra-replique">elle montre l'écran</span>
          Et Arsinoé qui n'en a eu que deux cents. Deux cents ! La pauvre.
        </p>
      </div>

      <div class="replique">
        <span class="personnage">Alceste</span>
        <p class="texte">Et c'est ça qui te rend heureuse ?</p>
      </div>

      <div class="replique">
        <span class="personnage">Célimène</span>
        <p class="texte">Ça ne devrait pas ?</p>
      </div>

    </section>
  </section>

  <!-- ACTE II — Teste : saut de page d'acte, nouveau running header -->
  <section class="acte">
    <h2>Acte II</h2>

    <div class="didascalie" data-type="liminaire">
      Le même bureau, le lendemain. La lumière est crue, matinale.
      Les post-its ont été réorganisés. Un nouveau tableau blanc affiche
      les mots "PIVOT STRATÉGIQUE" en lettres capitales rouges.
    </div>

    <section class="scene">
      <h3>Scène 1</h3>

      <div class="replique">
        <span class="personnage">Philinte</span>
        <p class="texte">Tu as vu le message d'Oronte ?</p>
      </div>

      <div class="replique">
        <span class="personnage">Alceste</span>
        <p class="texte">Lequel ? Il en envoie quinze par heure.</p>
      </div>

      <div class="replique">
        <span class="personnage">Philinte</span>
        <span class="didascalie" data-type="pre-replique">lisant son téléphone</span>
        <p class="texte">
          Celui où il dit qu'il veut te voir. Pour discuter.
          <span class="didascalie" data-type="intra-replique">levant les yeux</span>
          Je crois qu'il ne t'en veut pas tant que ça.
        </p>
      </div>

      <div class="didascalie" data-type="inter-repliques">
        Alceste fait les cent pas. On entend une notification au loin.
        Puis une autre. Puis une rafale de notifications.
      </div>

      <div class="replique">
        <span class="personnage">Alceste</span>
        <p class="texte">
          Discuter. Tout le monde veut discuter. Personne ne veut écouter.
          Ce n'est pas la même chose, Philinte. Discuter, c'est l'illusion
          du dialogue. Écouter, c'est accepter d'avoir tort. Et ça, personne
          ne le supporte.
        </p>
      </div>

    </section>
  </section>

</div>
`;
