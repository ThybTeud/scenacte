import app from './app.js';
import { config } from './config/env.js';
import { testConnection, closePool } from './config/database.js';
import { verifyEmailConnection } from './services/email.service.js';
import { initCleanupJob } from './jobs/cleanup.job.js';
import { logger } from './utils/logger.js';

/**
 * Démarrage du serveur
 */
async function startServer() {
  try {
    logger.info('\n========================================');
    logger.info('🎭 Scenacte Backend - Démarrage');
    logger.info('========================================\n');

    // 1. Vérification de la connexion à la base de données
    logger.info('Connexion à PostgreSQL...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Impossible de se connecter à la base de données');
    }
    logger.info('✓ Connexion établie avec succès\n');

    // 2. Vérification de la connexion SMTP (non bloquant - en arrière-plan)
    logger.info('Vérification de la connexion email en arrière-plan...');
    // Ne pas attendre la vérification SMTP pour ne pas retarder le démarrage
    verifyEmailConnection().then(emailOk => {
      if (emailOk) {
        logger.info('✓ Connexion email établie avec succès');
      } else {
        logger.warn('⚠ Connexion email échouée (les emails ne seront pas envoyés)');
      }
    }).catch(error => {
      logger.error({ error: error.message }, '⚠ Erreur lors de la vérification email');
    });

    // 3. Initialisation et démarrage du job de nettoyage
    logger.info('Initialisation du job de nettoyage...');
    const cleanupJob = initCleanupJob();
    cleanupJob.start();
    logger.info('✓ Job de nettoyage démarré (quotidien à 3h du matin)\n');

    // Pour test en développement : décommenter pour exécuter le cleanup immédiatement
    // if (config.server.env === 'development') {
    //   console.log('[CRON] Exécution de test du cleanup...');
    //   await cleanupJob.runNow();
    // }

    // 4. Démarrage du serveur HTTP
    // Écouter sur 0.0.0.0 pour permettre les connexions externes (nécessaire pour Render, Docker, etc.)
    const host = config.server.env === 'production' ? '0.0.0.0' : 'localhost';
    const server = app.listen(config.server.port, host, () => {
      logger.info('========================================');
      logger.info('🚀 Serveur démarré avec succès !');
      logger.info({ host, port: config.server.port }, '📍 Configuration serveur');
      logger.info({ env: config.server.env }, '🌍 Environnement');
      logger.info(`🔗 URL: http://localhost:${config.server.port}`);
      logger.info(`💚 Health check: http://localhost:${config.server.port}/api/health`);
      logger.info('========================================\n');
    });

    // 5. Gestion du shutdown graceful
    const gracefulShutdown = async (signal) => {
      logger.info({ signal }, 'Signal reçu, arrêt en cours...');

      // Arrêter d'accepter de nouvelles connexions
      server.close(async () => {
        logger.info('Serveur HTTP fermé');

        // Arrêter le job de nettoyage
        cleanupJob.stop();
        logger.info('Job de nettoyage arrêté');

        // Fermer le pool de connexions PostgreSQL
        await closePool();
        logger.info('Pool de connexions fermé');

        logger.info('✓ Arrêt terminé proprement\n');
        process.exit(0);
      });

      // Forcer l'arrêt après 10 secondes
      setTimeout(() => {
        logger.error('⚠ Forçage de l\'arrêt après timeout');
        process.exit(1);
      }, 10000);
    };

    // Écouter les signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error({ error }, '✗ Erreur lors du démarrage du serveur');
    await closePool();
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason }, 'UNHANDLED REJECTION');
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'UNCAUGHT EXCEPTION');
  process.exit(1);
});

// Démarrer le serveur
startServer();