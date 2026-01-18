import { Resend } from 'resend';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { queueEmail, setEmailSenders } from './queue.service.js';

/**
 * Configuration du service d'email avec Resend
 * Supporte 2 modes :
 * 1. Développement : emails loggés dans la console
 * 2. Production : Resend API (recommandé)
 */

const isDevelopment = config.server.env === 'development';

// Configuration Resend
const isResendConfigured = !!config.email.resendApiKey;
let resend = null;

if (!isDevelopment && isResendConfigured) {
  resend = new Resend(config.email.resendApiKey);
  logger.info('✓ Resend API configuré');
  logger.info({ from: config.email.from }, '📧 Adresse d\'expédition');
} else if (!isDevelopment && !isResendConfigured) {
  logger.warn('⚠️  Resend API non configuré : les emails ne seront pas envoyés');
  logger.warn('💡 Configurez RESEND_API_KEY dans vos variables d\'environnement');
} else if (isDevelopment) {
  logger.info('✓ Mode développement : les emails seront affichés dans la console uniquement');
}

// Initialiser les fonctions d'envoi dans queue.service pour éviter les dépendances circulaires
setEmailSenders({ sendViaResend });
logger.info('✓ [EMAIL] setEmailSenders appelé avec sendViaResend');

/**
 * Fonction interne pour envoyer via Resend
 * Exportée pour être utilisée par queue.service.js
 */
export async function sendViaResend(mailContent) {
  logger.info({
    to: mailContent.to,
    subject: mailContent.subject,
    isDevelopment,
    isResendConfigured,
    hasResendInstance: !!resend
  }, '📧 [RESEND] Tentative d\'envoi via Resend');

  // En mode développement, afficher l'email dans la console au lieu de l'envoyer
  if (isDevelopment && !resend) {
    logger.info('✓ [RESEND] Mode développement détecté - affichage de l\'email dans la console');

    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL CAPTURÉ PAR LE WORKER (DEV MODE)');
    console.log('='.repeat(80));
    console.log(`De      : ${mailContent.from || config.email.from}`);
    console.log(`À       : ${mailContent.to}`);
    console.log(`Sujet   : ${mailContent.subject}`);
    console.log('-'.repeat(80));
    console.log(mailContent.text || '(pas de contenu texte)');

    // Si c'est un email de réinitialisation, afficher le lien
    if (mailContent.resetUrl) {
      console.log('-'.repeat(80));
      console.log('🔗 LIEN DE RÉINITIALISATION (copier-coller dans le navigateur):');
      console.log(mailContent.resetUrl);
    }

    console.log('='.repeat(80) + '\n');

    logger.info({ to: mailContent.to }, '✅ [RESEND] Email affiché en mode développement');
    return { id: `dev-${Date.now()}`, message: 'Email displayed in development mode' };
  }

  // En production, vérifier que Resend est configuré
  if (!resend) {
    const errorMsg = 'Resend API non configuré - vérifiez RESEND_API_KEY';
    logger.error({
      isDevelopment,
      isResendConfigured,
      resendApiKey: config.email.resendApiKey ? '***défini***' : 'NON DÉFINI',
      env: config.server.env
    }, `❌ [RESEND] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  logger.info('✓ [RESEND] Instance Resend disponible, envoi en cours...');

  try {
    const emailPayload = {
      from: mailContent.from || config.email.from,
      to: mailContent.to,
      subject: mailContent.subject,
      text: mailContent.text,
      html: mailContent.html
    };

    logger.info({ emailPayload }, '📨 [RESEND] Payload de l\'email');

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      logger.error({ error }, '❌ [RESEND] Erreur retournée par l\'API Resend');
      throw new Error(`Erreur Resend: ${error.message || JSON.stringify(error)}`);
    }

    logger.info({ to: mailContent.to, id: data?.id }, '✅ [RESEND] Email envoyé avec succès via Resend');
    return data;
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack,
      to: mailContent.to
    }, '❌ [RESEND] Erreur lors de l\'envoi via Resend');
    throw error;
  }
}

/**
 * Envoie un email de bienvenue après inscription
 * @param {string} email - Email du destinataire
 * @param {string} username - Nom d'utilisateur
 */
export async function sendWelcomeEmail(email, username) {
  const mailContent = {
    from: config.email.from,
    to: email,
    subject: 'Bienvenue sur Scenacte',
    text: `Bonjour ${username},

Bienvenue sur Scenacte !

Votre compte a été créé avec succès. Vous pouvez maintenant commencer à écrire vos pièces de théâtre.

Si vous avez des questions, n'hésitez pas à nous contacter.

L'équipe Scenacte`
  };

  // Ajouter à la queue pour envoi asynchrone avec retry (même en dev)
  try {
    if (isResendConfigured || isDevelopment) {
      await queueEmail({
        ...mailContent,
        service: 'resend'
      });
      logger.info({ email }, 'Email de bienvenue ajouté à la queue (Resend)');
    } else {
      logger.warn({ email }, '⚠️  Resend non configuré : email de bienvenue non envoyé');
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Erreur lors de l\'ajout de l\'email de bienvenue à la queue');
    // Ne pas throw l'erreur pour ne pas bloquer l'inscription
  }
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} email - Email du destinataire
 * @param {string} username - Nom d'utilisateur
 * @param {string} resetToken - Token de réinitialisation
 */
export async function sendPasswordResetEmail(email, username, resetToken) {
  const resetUrl = `${config.client.url}/reset-password?token=${resetToken}`;

  const mailContent = {
    from: config.email.from,
    to: email,
    subject: 'Réinitialisation de votre mot de passe - Scenacte',
    text: `Bonjour ${username},

Vous avez demandé la réinitialisation de votre mot de passe sur Scenacte.

Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :
${resetUrl}

Ce lien est valable pendant 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

L'équipe Scenacte`,
    // Ajouter le resetUrl comme metadata pour le mode développement
    resetUrl
  };

  // Ajouter à la queue pour envoi asynchrone avec retry (même en dev)
  try {
    if (isResendConfigured || isDevelopment) {
      await queueEmail({
        ...mailContent,
        service: 'resend'
      });
      logger.info({ email }, 'Email de réinitialisation ajouté à la queue (Resend)');
    } else {
      throw new Error('Service d\'email non configuré. Contactez l\'administrateur.');
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Erreur lors de l\'ajout de l\'email de réinitialisation à la queue');
    throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
  }
}

/**
 * Vérifie la configuration email au démarrage
 */
export async function verifyEmailConnection() {
  if (isDevelopment) {
    logger.info('✓ Mode développement activé (emails affichés dans la console)');
    return true;
  }

  if (isResendConfigured) {
    logger.info('✓ Resend configuré et prêt à l\'emploi');
    return true;
  }

  logger.warn('⚠️  Resend non configuré : les emails ne seront pas envoyés');
  return false;
}
