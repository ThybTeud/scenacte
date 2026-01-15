import { describe, it, expect } from 'vitest';
import { calculateStatsFromAST, calculatePlayStatistics } from './playStatistics';
import { PlayParser, NodeType } from './playParser';

describe('playStatistics', () => {
  describe('calculateStatsFromAST', () => {
    it('should return zero stats for null AST', () => {
      const stats = calculateStatsFromAST(null);

      expect(stats).toEqual({
        totalActs: 0,
        totalScenes: 0,
        totalCharacters: 0,
        totalRepliques: 0,
        wordCount: 0,
        estimatedDurationMinutes: 0
      });
    });

    it('should return zero stats for empty AST', () => {
      const parser = new PlayParser();
      const ast = parser.parse('');
      const stats = calculateStatsFromAST(ast);

      expect(stats).toEqual({
        totalActs: 0,
        totalScenes: 0,
        totalCharacters: 0,
        totalRepliques: 0,
        wordCount: 0,
        estimatedDurationMinutes: 0
      });
    });

    it('should count acts correctly', () => {
      const parser = new PlayParser();
      const text = `#Acte I
#Acte II
#Acte III`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.totalActs).toBe(3);
      expect(stats.totalScenes).toBe(0);
    });

    it('should count scenes correctly', () => {
      const parser = new PlayParser();
      const text = `##Scène 1
##Scène 2
##Scène 3`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.totalScenes).toBe(3);
      expect(stats.totalActs).toBe(0);
    });

    it('should count acts and scenes together', () => {
      const parser = new PlayParser();
      const text = `#Acte I
##Scène 1
##Scène 2
#Acte II
##Scène 1`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.totalActs).toBe(2);
      expect(stats.totalScenes).toBe(3);
    });

    it('should count unique characters', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
Bonjour
@OPHÉLIE
Bonjour
@HAMLET
Au revoir`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.totalCharacters).toBe(2);
    });

    it('should count characters from dialogue attributes', () => {
      const parser = new PlayParser();
      const text = `@LE ROI
Bonjour`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.totalCharacters).toBe(1);
    });

    it('should count repliques correctly', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
Première ligne
Deuxième ligne
@OPHÉLIE
Une ligne
@HAMLET
Retour de Hamlet`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.totalRepliques).toBe(3);
    });

    it('should reset speaker on scene change', () => {
      const parser = new PlayParser();
      const text = `##Scène 1
@HAMLET
Bonjour
##Scène 2
@HAMLET
Au revoir`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.totalRepliques).toBe(2);
    });

    it('should count words in dialogue', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
Être ou ne pas être`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.wordCount).toBe(5);
    });

    it('should count words in didascalies', () => {
      const parser = new PlayParser();
      const text = `(Il entre dans la pièce)`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.wordCount).toBe(5);
    });

    it('should count words in text nodes', () => {
      const parser = new PlayParser();
      const text = `Ceci est du texte narratif`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.wordCount).toBe(5);
    });

    it('should count total words across all node types', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
Être ou ne pas être
(il réfléchit longuement)
Telle est la question`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      // "Être ou ne pas être" (5) + "il réfléchit longuement" (3) + "Telle est la question" (4) = 12
      expect(stats.wordCount).toBe(12);
    });

    it('should calculate estimated duration correctly', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
${'mot '.repeat(300)}`; // 300 mots
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.wordCount).toBe(300);
      expect(stats.estimatedDurationMinutes).toBe(2); // Math.ceil(300/150)
    });

    it('should round up duration to next minute', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
${'mot '.repeat(151)}`; // 151 mots
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.estimatedDurationMinutes).toBe(2); // Math.ceil(151/150)
    });

    it('should handle complex play structure', () => {
      const parser = new PlayParser();
      const text = `#Acte I
##Scène 1
@HAMLET
(Il entre) Être ou ne pas être
Telle est la question
@OPHÉLIE
Mon prince
##Scène 2
@LE ROI
Que se passe-t-il ?
#Acte II
##Scène 1
@HAMLET
Je suis de retour`;

      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.totalActs).toBe(2);
      expect(stats.totalScenes).toBe(3);
      expect(stats.totalCharacters).toBe(3);
      expect(stats.wordCount).toBeGreaterThan(0);
      expect(stats.estimatedDurationMinutes).toBeGreaterThan(0);
    });
  });

  describe('calculatePlayStatistics', () => {
    it('should return zero stats for null content', () => {
      const stats = calculatePlayStatistics(null);

      expect(stats).toEqual({
        totalActs: 0,
        totalScenes: 0,
        totalCharacters: 0,
        totalRepliques: 0,
        wordCount: 0,
        estimatedDurationMinutes: 0
      });
    });

    it('should return zero stats for undefined content', () => {
      const stats = calculatePlayStatistics(undefined);

      expect(stats).toEqual({
        totalActs: 0,
        totalScenes: 0,
        totalCharacters: 0,
        totalRepliques: 0,
        wordCount: 0,
        estimatedDurationMinutes: 0
      });
    });

    it('should return zero stats for empty string', () => {
      const stats = calculatePlayStatistics('');

      expect(stats).toEqual({
        totalActs: 0,
        totalScenes: 0,
        totalCharacters: 0,
        totalRepliques: 0,
        wordCount: 0,
        estimatedDurationMinutes: 0
      });
    });

    it('should return zero stats for non-string input', () => {
      const stats = calculatePlayStatistics(123);

      expect(stats).toEqual({
        totalActs: 0,
        totalScenes: 0,
        totalCharacters: 0,
        totalRepliques: 0,
        wordCount: 0,
        estimatedDurationMinutes: 0
      });
    });

    it('should calculate stats from raw content', () => {
      const text = `#Acte I
##Scène 1
@HAMLET
Être ou ne pas être`;

      const stats = calculatePlayStatistics(text);

      expect(stats.totalActs).toBe(1);
      expect(stats.totalScenes).toBe(1);
      expect(stats.totalCharacters).toBe(1);
      expect(stats.wordCount).toBe(5);
    });

    it('should handle plain text when parsing fails', () => {
      const text = 'Just some random text with words';
      const stats = calculatePlayStatistics(text);

      expect(stats.wordCount).toBe(6);
      expect(stats.estimatedDurationMinutes).toBe(1);
    });
  });

  describe('word counting edge cases', () => {
    it('should handle multiple spaces between words', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
mot1    mot2     mot3`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.wordCount).toBe(3);
    });

    it('should handle leading and trailing whitespace', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
   mot1 mot2 mot3   `;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.wordCount).toBe(3);
    });

    it('should handle special characters in words', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
C'est l'heure de s'en aller`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      // Word split considers apostrophes as part of words: "C'est l'heure de s'en aller" = 5 words
      expect(stats.wordCount).toBe(5);
    });

    it('should handle newlines and tabs', () => {
      const parser = new PlayParser();
      const text = `@HAMLET
mot1\tmot2\nmot3`;
      const ast = parser.parse(text);
      const stats = calculateStatsFromAST(ast);

      expect(stats.wordCount).toBeGreaterThan(0);
    });
  });
});
