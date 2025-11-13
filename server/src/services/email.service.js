import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

/**
 * Mode développement : pas de SMTP du tout
 * Les emails sont simplement loggés dans la console
 */
const isDevelopment = config.server.env === 'development';

// Vérifier si les variables SMTP sont configurées
const isSmtpConfigured = config.smtp.host && config.smtp.user && config.smtp.password;

let transporter = null;

if (!isDevelopment && isSmtpConfigured) {
  // Mode production avec SMTP configuré : créer le transporteur SMTP
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password
    }
  });
  console.log('[EMAIL] Transporteur SMTP configuré pour la production');
} else if (!isDevelopment && !isSmtpConfigured) {
  console.warn('[EMAIL] ⚠️  Variables SMTP non configurées : les emails ne seront pas envoyés');
} else {
  console.log('[EMAIL] Mode développement : les emails seront affichés dans la console uniquement');
}

/**
 * Envoie un email de bienvenue après inscription
 * @param {string} email - Email du destinataire
 * @param {string} username - Nom d'utilisateur
 */
export async function sendWelcomeEmail(email, username) {
  const mailContent = {
    from: config.smtp.from || 'noreply@scenacte.com',
    to: email,
    subject: 'Bienvenue sur Scenacte',
    text: `Bonjour ${username},

Bienvenue sur Scenacte !

Votre compte a été créé avec succès. Vous pouvez maintenant commencer à écrire vos pièces de théâtre.

Si vous avez des questions, n'hésitez pas à nous contacter.

L'équipe Scenacte`
  };

  if (isDevelopment) {
    // Mode développement : juste logger
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL DE BIENVENUE (DEV MODE)');
    console.log('='.repeat(60));
    console.log(`À: ${email}`);
    console.log(`Sujet: ${mailContent.subject}`);
    console.log('-'.repeat(60));
    console.log(mailContent.text);
    console.log('='.repeat(60) + '\n');
    return;
  }

  // Mode production : envoyer réellement
  if (!transporter) {
    console.warn('[EMAIL] ⚠️  SMTP non configuré : email de bienvenue non envoyé à', email);
    return;
  }

  try {
    await transporter.sendMail(mailContent);
    console.log('[EMAIL] Email de bienvenue envoyé à', email);
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de bienvenue:', error);
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
    from: config.smtp.from || 'noreply@scenacte.com',
    to: email,
    subject: 'Réinitialisation de votre mot de passe - Scenacte',
    text: `Bonjour ${username},

Vous avez demandé la réinitialisation de votre mot de passe sur Scenacte.

Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :
${resetUrl}

Ce lien est valable pendant 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

L'équipe Scenacte`
  };

  if (isDevelopment) {
    // Mode développement : juste logger
    console.log('\n' + '='.repeat(60));
    console.log('🔑 EMAIL DE RÉINITIALISATION (DEV MODE)');
    console.log('='.repeat(60));
    console.log(`À: ${email}`);
    console.log(`Sujet: ${mailContent.subject}`);
    console.log('-'.repeat(60));
    console.log(mailContent.text);
    console.log('-'.repeat(60));
    console.log('🔗 LIEN DE RÉINITIALISATION (copier-coller dans le navigateur):');
    console.log(resetUrl);
    console.log('='.repeat(60) + '\n');
    return;
  }

  // Mode production : envoyer réellement
  if (!transporter) {
    console.warn('[EMAIL] ⚠️  SMTP non configuré : email de réinitialisation non envoyé');
    throw new Error('Service d\'email non configuré. Contactez l\'administrateur.');
  }

  try {
    await transporter.sendMail(mailContent);
    console.log('[EMAIL] Email de réinitialisation envoyé à', email);
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
  }
}

/**
 * Vérifie la connexion SMTP au démarrage
 */
export async function verifyEmailConnection() {
  if (isDevelopment) {
    console.log('[EMAIL] ✓ Mode développement activé (emails affichés dans la console)');
    return true;
  }

  if (!transporter) {
    console.warn('[EMAIL] ⚠️  SMTP non configuré : les emails ne seront pas envoyés');
    return false;
  }

  try {
    await transporter.verify();
    console.log('[EMAIL] ✓ Connexion SMTP établie avec succès');
    return true;
  } catch (error) {
    console.error('[EMAIL] Erreur de connexion SMTP:', error);
    console.log('[EMAIL] ⚠ Les emails ne seront pas envoyés');
    return false;
  }
}