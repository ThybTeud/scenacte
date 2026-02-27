import cron from 'node-cron';
import { cleanupOldVersions, getRetentionStats } from '../services/versionCleanup.service.js';

/**
 * Job de nettoyage des anciennes versions
 * Exécuté tous les jours à 3h du matin
 * 
 * Stratégie de rétention :
 * - Versions manuelles : gardées indéfiniment
 * - Auto-saves < 7 jours : toutes gardées
 * - Auto-saves > 7 jours : 1 snapshot par jour (dernière de chaque journée)
 */

// Fonction d'exécution du job
async function runCleanup() {
  console.log('\n========================================');
  console.log('[CLEANUP JOB] Démarrage du nettoyage des versions');
  console.log('[CLEANUP JOB] Date:', new Date().toISOString());
  console.log('========================================\n');

  try {
    // Afficher les stats avant nettoyage
    console.log('[CLEANUP JOB] Statistiques AVANT nettoyage:');
    const statsBefore = await getRetentionStats();
    console.log(JSON.stringify(statsBefore, null, 2));

    // Exécuter le nettoyage
    const result = await cleanupOldVersions();

    if (result.success) {
      console.log('\n[CLEANUP JOB] ✓ Nettoyage terminé avec succès');
      console.log('[CLEANUP JOB] Résumé:');
      console.log(`  - Versions manuelles préservées: ${result.manualPreserved}`);
      console.log(`  - Auto-saves récentes préservées: ${result.recentPreserved}`);
      console.log(`  - Snapshots quotidiens préservés: ${result.dailySnapshotsPreserved}`);
      console.log(`  - Versions supprimées: ${result.versionsDeleted}`);
      console.log(`  - Statistiques orphelines supprimées: ${result.statsDeleted}`);
      console.log(`  - Durée: ${result.duration}ms`);

      // Afficher les stats après nettoyage
      console.log('\n[CLEANUP JOB] Statistiques APRÈS nettoyage:');
      const statsAfter = await getRetentionStats();
      console.log(JSON.stringify(statsAfter, null, 2));
    } else {
      console.error('[CLEANUP JOB] ✗ Échec du nettoyage:', result.error);
    }
  } catch (error) {
    console.error('[CLEANUP JOB] ✗ Erreur critique:', error);
  }

  console.log('\n========================================');
  console.log('[CLEANUP JOB] Fin du job');
  console.log('========================================\n');
}

/**
 * Initialise le job cron
 */
export function initCleanupJob() {
  // Cron expression : '0 3 * * *' = tous les jours à 3h du matin
  // Secondes Minutes Heures Jour Mois JourSemaine
  const cronExpression = '0 3 * * *';

  const job = cron.schedule(cronExpression, runCleanup, {
    scheduled: false, // Ne démarre pas automatiquement
    timezone: 'Europe/Paris' // Fuseau horaire français
  });

  console.log('[CLEANUP JOB] Job de nettoyage configuré (tous les jours à 3h du matin)');

  return {
    start: () => {
      job.start();
      console.log('[CLEANUP JOB] Job de nettoyage démarré');
    },
    stop: () => {
      job.stop();
      console.log('[CLEANUP JOB] Job de nettoyage arrêté');
    },
    runNow: async () => {
      console.log('[CLEANUP JOB] Exécution manuelle déclenchée');
      await runCleanup();
    }
  };
}

/**
 * Exporte également la fonction runCleanup pour tests manuels
 */
export { runCleanup };