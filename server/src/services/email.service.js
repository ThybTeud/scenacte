import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

/**
 * Création du transporteur SMTP
 * En développement avec SMTP local qui ne fonctionne pas, utilise un transporteur de test
 */
let transporter;
const isDevelopment = config.server.env === 'development';
const isLocalSMTP = config.smtp.host === 'localhost' || config.smtp.host === '127.0.0.1';

if (isDevelopment && isLocalSMTP) {
  // Mode développement : logger les emails au lieu de les envoyer
  console.log('[EMAIL] Mode développement : les emails seront affichés dans la console');
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });
} else {
  // Mode production ou SMTP externe configuré
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password
    }
  });
}

/**
 * Envoie un email de bienvenue après inscription
 * @param {string} email - Email du destinataire
 * @param {string} username - Nom d'utilisateur
 */
export async function sendWelcomeEmail(email, username) {
  try {
    const mailContent = {
      from: config.smtp.from,
      to: email,
      subject: 'Bienvenue sur Scenacte',
      text: `Bonjour ${username},

Bienvenue sur Scenacte !

Votre compte a été créé avec succès. Vous pouvez maintenant commencer à écrire vos pièces de théâtre.

Si vous avez des questions, n'hésitez pas à nous contacter.

L'équipe Scenacte`
    };

    const info = await transporter.sendMail(mailContent);

    if (isDevelopment && isLocalSMTP) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 EMAIL DE BIENVENUE');
      console.log('='.repeat(60));
      console.log(`À: ${email}`);
      console.log(`Sujet: ${mailContent.subject}`);
      console.log('-'.repeat(60));
      console.log(mailContent.text);
      console.log('='.repeat(60) + '\n');
    } else {
      console.log('[EMAIL] Email de bienvenue envoyé à', email);
    }
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

  try {
    const mailContent = {
      from: config.smtp.from,
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

    const info = await transporter.sendMail(mailContent);

    if (isDevelopment && isLocalSMTP) {
      console.log('\n' + '='.repeat(60));
      console.log('🔑 EMAIL DE RÉINITIALISATION DE MOT DE PASSE');
      console.log('='.repeat(60));
      console.log(`À: ${email}`);
      console.log(`Sujet: ${mailContent.subject}`);
      console.log('-'.repeat(60));
      console.log(mailContent.text);
      console.log('-'.repeat(60));
      console.log('🔗 LIEN DE RÉINITIALISATION (copier-coller dans le navigateur):');
      console.log(resetUrl);
      console.log('='.repeat(60) + '\n');
    } else {
      console.log('[EMAIL] Email de réinitialisation envoyé à', email);
    }
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    if (isDevelopment && isLocalSMTP) {
      // En mode développement, ne pas bloquer même si l'envoi échoue
      console.log('[EMAIL] Mode développement : erreur ignorée, le lien devrait être affiché ci-dessus');
    } else {
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  }
}

/**
 * Vérifie la connexion SMTP au démarrage
 */
export async function verifyEmailConnection() {
  // En mode développement avec SMTP local, pas besoin de vérifier
  if (isDevelopment && isLocalSMTP) {
    console.log('[EMAIL] ✓ Mode développement activé (emails affichés dans la console)');
    return true;
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