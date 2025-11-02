import { PrismaClient } from '@prisma/client';
import app from './app.js';
import { config } from './config/env.js';
import { verifyEmailConnection } from './services/email.service.js';
import { initCleanupJob } from './jobs/cleanup.job.js';

const prisma = new PrismaClient();

/**
 * Démarrage du serveur
 */
async function startServer() {
  try {
    console.log('\n========================================');
    console.log('🎭 Scenacte Backend - Démarrage');
    console.log('========================================\n');

    // 1. Vérification de la connexion à la base de données
    console.log('[DATABASE] Connexion à PostgreSQL...');
    await prisma.$connect();
    console.log('[DATABASE] ✓ Connexion établie avec succès\n');

    // 2. Vérification de la connexion SMTP (non bloquant)
    console.log('[EMAIL] Vérification de la connexion SMTP...');
    const emailOk = await verifyEmailConnection();
    if (emailOk) {
      console.log('[EMAIL] ✓ Connexion SMTP établie avec succès\n');
    } else {
      console.warn('[EMAIL] ⚠ Connexion SMTP échouée (les emails ne seront pas envoyés)\n');
    }

    // 3. Initialisation et démarrage du job de nettoyage
    console.log('[CRON] Initialisation du job de nettoyage...');
    const cleanupJob = initCleanupJob();
    cleanupJob.start();
    console.log('[CRON] ✓ Job de nettoyage démarré (quotidien à 3h du matin)\n');

    // Pour test en développement : décommenter pour exécuter le cleanup immédiatement
    // if (config.server.env === 'development') {
    //   console.log('[CRON] Exécution de test du cleanup...');
    //   await cleanupJob.runNow();
    // }

    // 4. Démarrage du serveur HTTP
    const server = app.listen(config.server.port, () => {
      console.log('========================================');
      console.log(`🚀 Serveur démarré avec succès !`);
      console.log(`📍 Port: ${config.server.port}`);
      console.log(`🌍 Environnement: ${config.server.env}`);
      console.log(`🔗 URL: http://localhost:${config.server.port}`);
      console.log(`💚 Health check: http://localhost:${config.server.port}/api/health`);
      console.log('========================================\n');
    });

    // 5. Gestion du shutdown graceful
    const gracefulShutdown = async (signal) => {
      console.log(`\n[${signal}] Signal reçu, arrêt en cours...`);

      // Arrêter d'accepter de nouvelles connexions
      server.close(async () => {
        console.log('[SERVER] Serveur HTTP fermé');

        // Arrêter le job de nettoyage
        cleanupJob.stop();
        console.log('[CRON] Job de nettoyage arrêté');

        // Fermer la connexion Prisma
        await prisma.$disconnect();
        console.log('[DATABASE] Connexion fermée');

        console.log('✓ Arrêt terminé proprement\n');
        process.exit(0);
      });

      // Forcer l'arrêt après 10 secondes
      setTimeout(() => {
        console.error('⚠ Forçage de l\'arrêt après timeout');
        process.exit(1);
      }, 10000);
    };

    // Écouter les signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('✗ Erreur lors du démarrage du serveur:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});

// Démarrer le serveur
startServer();