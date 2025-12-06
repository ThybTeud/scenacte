import { calculatePlayStatistics } from '../../utils/playStatistics.js';

describe('calculatePlayStatistics', () => {
  describe('Calcul basique', () => {
    it('devrait retourner des stats vides pour un contenu vide', () => {
      const stats = calculatePlayStatistics('');

      expect(stats).toEqual({
        totalActs: 0,
        totalScenes: 0,
        totalCharacters: 0,
        totalLines: 0,
        wordCount: 0,
        estimatedDurationMinutes: 0
      });
    });

    it('devrait retourner des stats vides pour null', () => {
      const stats = calculatePlayStatistics(null);

      expect(stats).toEqual({
        totalActs: 0,
        totalScenes: 0,
        totalCharacters: 0,
        totalLines: 0,
        wordCount: 0,
        estimatedDurationMinutes: 0
      });
    });
  });

  describe('Comptage des actes', () => {
    it('devrait compter un seul acte', () => {
      const content = '#Acte 1';
      const stats = calculatePlayStatistics(content);

      expect(stats.totalActs).toBe(1);
    });

    it('devrait compter plusieurs actes', () => {
      const content = `#Acte 1

#Acte 2

#Acte 3`;
      const stats = calculatePlayStatistics(content);

      expect(stats.totalActs).toBe(3);
    });
  });

  describe('Comptage des scènes', () => {
    it('devrait compter une seule scène', () => {
      const content = '##Scène 1';
      const stats = calculatePlayStatistics(content);

      expect(stats.totalScenes).toBe(1);
    });

    it('devrait compter plusieurs scènes', () => {
      const content = `##Scène 1

##Scène 2

##Scène 3`;
      const stats = calculatePlayStatistics(content);

      expect(stats.totalScenes).toBe(3);
    });
  });

  describe('Comptage des personnages', () => {
    it('devrait compter un seul personnage', () => {
      const content = '@HAMLET\nÊtre ou ne pas être';
      const stats = calculatePlayStatistics(content);

      expect(stats.totalCharacters).toBe(1);
    });

    it('devrait compter plusieurs personnages uniques', () => {
      const content = `@HAMLET
Être ou ne pas être

@HORATIO
Mon prince

@OPHÉLIE
Seigneur`;
      const stats = calculatePlayStatistics(content);

      expect(stats.totalCharacters).toBe(3);
    });

    it('devrait ne compter qu\'une fois un personnage qui apparaît plusieurs fois', () => {
      const content = `@HAMLET
Première réplique

@HORATIO
Réponse

@HAMLET
Deuxième réplique`;
      const stats = calculatePlayStatistics(content);

      expect(stats.totalCharacters).toBe(2);
    });
  });

  describe('Comptage des répliques', () => {
    it('devrait compter une réplique', () => {
      const content = '@HAMLET\nÊtre ou ne pas être';
      const stats = calculatePlayStatistics(content);

      expect(stats.totalLines).toBe(1);
    });

    it('devrait compter plusieurs répliques', () => {
      const content = `@HAMLET
Être ou ne pas être
(il réfléchit)
Telle est la question

@HORATIO
Mon prince`;
      const stats = calculatePlayStatistics(content);

      expect(stats.totalLines).toBe(3); // 2 lignes de Hamlet + 1 ligne de Horatio
    });
  });

  describe('Comptage des mots', () => {
    it('devrait compter les mots dans une réplique simple', () => {
      const content = '@HAMLET\nÊtre ou ne pas être';
      const stats = calculatePlayStatistics(content);

      expect(stats.wordCount).toBe(5);
    });

    it('devrait compter les mots dans plusieurs répliques', () => {
      const content = `@HAMLET
Être ou ne pas être telle est la question

@HORATIO
Mon prince vous semblez troublé`;
      const stats = calculatePlayStatistics(content);

      expect(stats.wordCount).toBe(13);
    });

    it('devrait compter les mots dans les didascalies', () => {
      const content = `@HAMLET
Être ou ne pas être
(il réfléchit longuement)
Telle est la question`;
      const stats = calculatePlayStatistics(content);

      // "Être ou ne pas être" (5) + "il réfléchit longuement" (3) + "Telle est la question" (4) = 12
      expect(stats.wordCount).toBe(12);
    });
  });

  describe('Estimation de la durée', () => {
    it('devrait estimer la durée à 1 minute pour 150 mots', () => {
      // Générer environ 150 mots
      const words = Array(150).fill('mot').join(' ');
      const content = `@HAMLET\n${words}`;
      const stats = calculatePlayStatistics(content);

      expect(stats.estimatedDurationMinutes).toBe(1);
    });

    it('devrait estimer la durée à 2 minutes pour 300 mots', () => {
      const words = Array(300).fill('mot').join(' ');
      const content = `@HAMLET\n${words}`;
      const stats = calculatePlayStatistics(content);

      expect(stats.estimatedDurationMinutes).toBe(2);
    });

    it('devrait arrondir à l\'entier supérieur', () => {
      // 151 mots = ceil(151/150) = 2 minutes
      const words = Array(151).fill('mot').join(' ');
      const content = `@HAMLET\n${words}`;
      const stats = calculatePlayStatistics(content);

      expect(stats.estimatedDurationMinutes).toBe(2);
    });
  });

  describe('Test avec une pièce complète', () => {
    it('devrait calculer correctement toutes les stats pour une pièce réaliste', () => {
      const content = `#Acte 1

##Scène 1

@HAMLET
Être ou ne pas être, telle est la question.
(Il réfléchit)
Qu'il est plus noble à l'âme de souffrir les flèches et les coups de la fortune outrageuse.

@HORATIO
Mon prince, vous semblez troublé.

##Scène 2

@HAMLET
La mort, le sommeil, un sommeil, rien de plus.

#Acte 2

##Scène 1

@OPHÉLIE
Seigneur Hamlet, je vous rends vos présents.
(Elle tend les lettres)

@HAMLET
Je ne vous ai jamais rien donné.`;

      const stats = calculatePlayStatistics(content);

      expect(stats.totalActs).toBe(2);
      expect(stats.totalScenes).toBe(3);
      expect(stats.totalCharacters).toBe(3); // Hamlet, Horatio, Ophélie
      expect(stats.totalLines).toBeGreaterThan(0);
      expect(stats.wordCount).toBeGreaterThan(50);
      expect(stats.estimatedDurationMinutes).toBeGreaterThan(0);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer gracieusement un contenu mal formaté', () => {
      const content = '### Ceci n\'est pas un format valide @#$%';

      // Ne devrait pas lancer d'erreur
      expect(() => calculatePlayStatistics(content)).not.toThrow();

      const stats = calculatePlayStatistics(content);
      expect(stats).toBeDefined();
      expect(typeof stats.wordCount).toBe('number');
    });

    it('devrait gérer les balises incomplètes', () => {
      const content = `#Acte
##
@
Texte normal`;

      expect(() => calculatePlayStatistics(content)).not.toThrow();
    });
  });
});
