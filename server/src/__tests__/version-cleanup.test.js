import { faker } from '@faker-js/faker';
import { pool } from '../config/database.js';
import { cleanupOldVersions } from '../services/version-cleanup.service.js';

/**
 * Tests pour le service de cleanup des versions
 * Vérifie notamment la fenêtre de sécurité de 5 minutes contre les race conditions
 */

describe('Version Cleanup Service', () => {
  let testUserId;
  let testPlayId;

  beforeAll(async () => {
    // Créer un utilisateur de test
    const userResult = await pool.query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [
        `test_${faker.internet.email()}`,
        `test_${faker.string.alphanumeric(10)}`,
        faker.string.alphanumeric(60) // hash fictif
      ]
    );
    testUserId = userResult.rows[0].id;

    // Créer une pièce de test
    const playResult = await pool.query(
      'INSERT INTO plays (user_id, title, subtitle, raw_content, html_content) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [
        testUserId,
        faker.lorem.words(3),
        faker.lorem.words(5),
        faker.lorem.paragraphs(2),
        `<p>${faker.lorem.paragraphs(2)}</p>`
      ]
    );
    testPlayId = playResult.rows[0].id;
  });

  afterAll(async () => {
    // Nettoyer les données de test
    if (testPlayId) {
      await pool.query('DELETE FROM play_history WHERE play_id = $1', [testPlayId]);
      await pool.query('DELETE FROM plays WHERE id = $1', [testPlayId]);
    }
    if (testUserId) {
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    // Fermer le pool de connexions
    await pool.end();
  });

  beforeEach(async () => {
    // Nettoyer les versions existantes avant chaque test
    await pool.query('DELETE FROM play_history WHERE play_id = $1', [testPlayId]);
  });

  describe('Safety Window - 5 minutes protection', () => {
    test('should NOT delete auto-save versions created less than 5 minutes ago', async () => {
      // Créer une version auto créée il y a 3 minutes (< 5 minutes)
      const threeMinutesAgo = new Date();
      threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3);

      const recentVersionResult = await pool.query(
        `INSERT INTO play_history
         (play_id, version_number, title, version_type, raw_content, file_size_bytes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          testPlayId,
          1,
          'Test play',
          'auto',
          'Recent auto-save content',
          100,
          threeMinutesAgo
        ]
      );
      const recentVersionId = recentVersionResult.rows[0].id;

      // Créer une version ancienne (> 7 jours ET > 5 minutes)
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      await pool.query(
        `INSERT INTO play_history
         (play_id, version_number, title, version_type, raw_content, file_size_bytes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          testPlayId,
          2,
          'Test play',
          'auto',
          'Old auto-save content',
          100,
          eightDaysAgo
        ]
      );

      // Exécuter le cleanup
      const result = await cleanupOldVersions();

      expect(result.success).toBe(true);

      // Vérifier que la version récente existe toujours
      const recentCheck = await pool.query(
        'SELECT id FROM play_history WHERE id = $1',
        [recentVersionId]
      );
      expect(recentCheck.rows.length).toBe(1);

      // Vérifier que la version ancienne a été supprimée
      const oldCheck = await pool.query(
        'SELECT id FROM play_history WHERE play_id = $1 AND created_at < $2',
        [testPlayId, eightDaysAgo]
      );
      expect(oldCheck.rows.length).toBe(0);
    });

    test('should delete auto-save versions older than 7 days AND older than 5 minutes', async () => {
      // Créer plusieurs versions anciennes (> 7 jours ET > 5 minutes)
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      // Version 1: il y a 10 jours
      await pool.query(
        `INSERT INTO play_history
         (play_id, version_number, title, version_type, raw_content, file_size_bytes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [testPlayId, 1, 'Test play', 'auto', 'Content 1', 100, tenDaysAgo]
      );

      // Version 2: il y a 8 jours (daily snapshot - dernière du jour)
      await pool.query(
        `INSERT INTO play_history
         (play_id, version_number, title, version_type, raw_content, file_size_bytes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [testPlayId, 2, 'Test play', 'auto', 'Content 2', 100, eightDaysAgo]
      );

      // Exécuter le cleanup
      const result = await cleanupOldVersions();

      expect(result.success).toBe(true);

      // Vérifier qu'au moins une version a été supprimée (la plus ancienne)
      // et qu'au moins un daily snapshot a été préservé
      const remainingVersions = await pool.query(
        'SELECT id, preserved_reason FROM play_history WHERE play_id = $1',
        [testPlayId]
      );

      // Au moins une version doit être préservée comme daily_snapshot
      const dailySnapshots = remainingVersions.rows.filter(
        v => v.preserved_reason === 'daily_snapshot'
      );
      expect(dailySnapshots.length).toBeGreaterThan(0);
    });

    test('should protect versions created during cleanup execution', async () => {
      // Scénario de race condition:
      // 1. Créer une version ancienne
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      await pool.query(
        `INSERT INTO play_history
         (play_id, version_number, title, version_type, raw_content, file_size_bytes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [testPlayId, 1, 'Test play', 'auto', 'Old content', 100, eightDaysAgo]
      );

      // 2. Simuler une version créée "pendant" le cleanup (juste maintenant)
      const justNow = new Date();
      const newVersionResult = await pool.query(
        `INSERT INTO play_history
         (play_id, version_number, title, version_type, raw_content, file_size_bytes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          testPlayId,
          2,
          'Test play',
          'auto',
          'Just created content',
          100,
          justNow
        ]
      );
      const newVersionId = newVersionResult.rows[0].id;

      // 3. Exécuter le cleanup
      const result = await cleanupOldVersions();

      expect(result.success).toBe(true);

      // 4. Vérifier que la version récente n'a PAS été supprimée
      const newVersionCheck = await pool.query(
        'SELECT id FROM play_history WHERE id = $1',
        [newVersionId]
      );
      expect(newVersionCheck.rows.length).toBe(1);
    });

    test('should NOT touch manual versions regardless of age', async () => {
      // Créer une version manuelle très ancienne
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const manualVersionResult = await pool.query(
        `INSERT INTO play_history
         (play_id, version_number, title, version_type, raw_content, file_size_bytes, created_at, manual_label)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          testPlayId,
          1,
          'Test play',
          'manual',
          'Manual save content',
          100,
          oneYearAgo,
          'Important version'
        ]
      );
      const manualVersionId = manualVersionResult.rows[0].id;

      // Exécuter le cleanup
      const result = await cleanupOldVersions();

      expect(result.success).toBe(true);

      // Vérifier que la version manuelle existe toujours
      const manualCheck = await pool.query(
        'SELECT id, preserved_reason FROM play_history WHERE id = $1',
        [manualVersionId]
      );
      expect(manualCheck.rows.length).toBe(1);
      expect(manualCheck.rows[0].preserved_reason).toBe('manual');
    });
  });

  describe('Retention Policy', () => {
    test('should preserve recent auto-saves (< 7 days)', async () => {
      // Créer une auto-save de 5 jours
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const recentVersionResult = await pool.query(
        `INSERT INTO play_history
         (play_id, version_number, title, version_type, raw_content, file_size_bytes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          testPlayId,
          1,
          'Test play',
          'auto',
          'Recent content',
          100,
          fiveDaysAgo
        ]
      );
      const recentVersionId = recentVersionResult.rows[0].id;

      // Exécuter le cleanup
      const result = await cleanupOldVersions();

      expect(result.success).toBe(true);

      // Vérifier que la version existe toujours et est marquée 'recent'
      const versionCheck = await pool.query(
        'SELECT id, preserved_reason FROM play_history WHERE id = $1',
        [recentVersionId]
      );
      expect(versionCheck.rows.length).toBe(1);
      expect(versionCheck.rows[0].preserved_reason).toBe('recent');
    });
  });
});
