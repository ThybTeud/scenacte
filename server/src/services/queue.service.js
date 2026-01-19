import { PgBoss } from 'pg-boss';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Instance de PgBoss pour la gestion de la queue d'emails
 */
let boss = null;

/**
 * Référence vers les fonctions d'envoi d'email
 * Définie lors du démarrage de la queue pour éviter les dépendances circulaires
 */
let emailSenders = null;

/**
 * Définit les fonctions d'envoi d'email
 * Appelé par email.service.js après l'initialisation de la queue
 */
export function setEmailSenders(senders) {
  emailSenders = senders;
}

/**
 * Démarre la queue d'emails avec PgBoss
 * Crée automatiquement les tables nécessaires dans PostgreSQL
 */
export async function startQueue() {
  try {
    // Initialiser PgBoss avec la même connexion PostgreSQL
    boss = new PgBoss({
      connectionString: config.database.url,
      // Options de configuration
      retryLimit: 3, // Nombre de tentatives par défaut
      retryDelay: 60, // Délai entre les tentatives (secondes)
      expireInHours: 24, // Les jobs expirent après 24h
      archiveCompletedAfterSeconds: 86400, // Archive les jobs terminés après 24h
      // Options de polling - forcer le polling actif
      newJobCheckInterval: 2000, // Vérifier les nouveaux jobs toutes les 2 secondes
      newJobCheckIntervalSeconds: 2, // Équivalent en secondes
    });

    // Démarrer PgBoss
    await boss.start();
    logger.info('✓ [QUEUE] PgBoss démarré');

    // Créer la queue explicitement avant d'enregistrer le worker
    await boss.createQueue('send-email');

    // Événement de monitoring pour les erreurs
    boss.on('error', error => {
      logger.error({ error: error.message, stack: error.stack }, '❌ [QUEUE] Erreur PgBoss');
    });

    // Enregistrer le worker pour traiter les emails
    const workerId = await boss.work('send-email', { teamSize: 5, teamConcurrency: 1 }, async (job) => {
      // IMPORTANT : pg-boss v12+ passe un tableau de jobs au lieu d'un seul job
      const actualJob = Array.isArray(job) ? job[0] : job;

      if (!actualJob) {
        logger.error('❌ [WORKER] Aucun job reçu (tableau vide ou job null)');
        throw new Error('Aucun job à traiter');
      }

      // Les données sont dans actualJob.data
      const { to, from, subject, text, html, service, resetUrl } = actualJob.data;

      try {
        // Vérifier que les fonctions d'envoi sont définies
        if (!emailSenders || !emailSenders.sendViaResend) {
          logger.error('❌ [WORKER] Fonctions d\'envoi d\'email non initialisées');
          throw new Error('Fonctions d\'envoi d\'email non initialisées');
        }

        logger.info('✓ [WORKER] emailSenders est bien défini');

        // Vérifier que sendViaResend existe
        if (!emailSenders.sendViaResend) {
          logger.error('❌ [WORKER] emailSenders.sendViaResend est undefined');
          throw new Error('Fonction sendViaResend non disponible');
        }

        logger.info('✓ [WORKER] sendViaResend est disponible');

        // Envoyer l'email via le service approprié
        if (service === 'resend') {
          await emailSenders.sendViaResend({ to, from, subject, text, html, resetUrl });
          logger.info({ to, jobId: actualJob.id }, '✅ Email envoyé avec succès depuis la queue');
        } else if (service === 'sendgrid' || service === 'smtp') {
          // Services obsolètes - migration vers Resend
          logger.error({ service }, '❌ [WORKER] Service obsolète détecté');
          throw new Error(`Service d'email obsolète: ${service}. Utilisez 'resend' à la place.`);
        } else {
          logger.error({ service }, '❌ [WORKER] Service inconnu');
          throw new Error(`Service d'email inconnu: ${service}`);
        }
      } catch (error) {
        logger.error({
          to,
          jobId: actualJob.id,
          error: error.message,
          stack: error.stack
        }, '❌ [WORKER] Erreur lors de l\'envoi d\'email depuis la queue');
        throw error; // Relancer l'erreur pour que PgBoss puisse gérer le retry
      }
    });

    logger.info({ workerId }, '✓ [QUEUE] Worker enregistré pour "send-email"');
    logger.info('✓ [QUEUE] PgBoss initialisé et worker configuré - prêt à traiter les jobs');
  } catch (error) {
    logger.error({ error: error.message }, 'Erreur lors du démarrage de la queue');
    throw error;
  }
}

/**
 * Ajoute un email à la queue pour envoi asynchrone
 * @param {Object} emailData - Données de l'email
 * @param {string} emailData.to - Destinataire
 * @param {string} emailData.from - Expéditeur
 * @param {string} emailData.subject - Sujet
 * @param {string} emailData.text - Contenu texte
 * @param {string} emailData.html - Contenu HTML
 * @param {string} emailData.service - Service à utiliser ('sendgrid' ou 'smtp')
 */
export async function queueEmail(emailData) {
  try {
    if (!boss) {
      throw new Error('Queue non initialisée. Appelez startQueue() d\'abord.');
    }

    const jobId = await boss.send('send-email', emailData, {
      retryLimit: 3, // 3 tentatives
      retryDelay: 60, // 60 secondes entre chaque tentative
      expireInHours: 24 // Expire après 24h
    });

    logger.info({ to: emailData.to, jobId }, 'Email ajouté à la queue');
    return jobId;
  } catch (error) {
    logger.error({ to: emailData.to, error: error.message }, 'Erreur lors de l\'ajout de l\'email à la queue');
    throw error;
  }
}

/**
 * Arrête la queue proprement (shutdown graceful)
 */
export async function stopQueue() {
  try {
    if (boss) {
      await boss.stop({ timeout: 10000 }); // Attendre max 10 secondes
      logger.info('✓ Queue d\'emails arrêtée proprement');
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Erreur lors de l\'arrêt de la queue');
    throw error;
  }
}
