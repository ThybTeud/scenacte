import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { config } from '../config/env.js';

/**
 * Configuration du service d'email
 * Supporte 3 modes :
 * 1. Développement : emails loggés dans la console
 * 2. SendGrid : API HTTP (recommandé pour Render.com - pas de problème de port)
 * 3. SMTP : serveur SMTP classique (port 2525 recommandé sur Render.com free tier)
 */

const isDevelopment = config.server.env === 'development';

// Configuration SendGrid (prioritaire)
const isSendGridConfigured = !!config.email.sendgridApiKey;
if (!isDevelopment && isSendGridConfigured) {
  sgMail.setApiKey(config.email.sendgridApiKey);
  console.log('[EMAIL] ✓ SendGrid API configuré (mode HTTP)');
  console.log(`[EMAIL] 📧 Adresse d'expédition : ${config.email.from}`);
  console.log('[EMAIL] ⚠️  Cette adresse doit être vérifiée sur SendGrid (Settings → Sender Authentication)');
}

// Configuration SMTP (fallback)
const isSmtpConfigured = config.smtp.host && config.smtp.user && config.smtp.password;
let transporter = null;

if (!isDevelopment && !isSendGridConfigured && isSmtpConfigured) {
  // Mode production avec SMTP configuré : créer le transporteur SMTP
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password
    },
    // Timeouts courts pour ne pas bloquer le démarrage
    connectionTimeout: 10000,  // 10 secondes max pour la connexion
    greetingTimeout: 10000,    // 10 secondes max pour le greeting
    socketTimeout: 10000       // 10 secondes max pour les opérations socket
  });
  console.log(`[EMAIL] ✓ Transporteur SMTP configuré (${config.smtp.host}:${config.smtp.port})`);
  console.log(`[EMAIL] 📧 Adresse d'expédition : ${config.email.from}`);
} else if (!isDevelopment && !isSendGridConfigured && !isSmtpConfigured) {
  console.warn('[EMAIL] ⚠️  Aucun service d\'email configuré : les emails ne seront pas envoyés');
  console.warn('[EMAIL] 💡 Configurez SENDGRID_API_KEY ou SMTP_HOST/SMTP_USER/SMTP_PASSWORD');
} else if (isDevelopment) {
  console.log('[EMAIL] ✓ Mode développement : les emails seront affichés dans la console uniquement');
}

// Fonction interne pour envoyer via SendGrid
async function sendViaSendGrid(mailContent) {
  const msg = {
    to: mailContent.to,
    from: mailContent.from || config.email.from,
    subject: mailContent.subject,
    text: mailContent.text,
    html: mailContent.html
  };

  try {
    await sgMail.send(msg);
    console.log('[EMAIL] ✓ Email envoyé via SendGrid à', mailContent.to);
  } catch (error) {
    // Erreurs SendGrid détaillées
    if (error.response) {
      const { statusCode, body } = error.response;
      console.error('[EMAIL] ✗ Erreur SendGrid:', statusCode, body);

      if (statusCode === 403) {
        throw new Error(`Erreur SendGrid (403 Forbidden): L'adresse email "${msg.from}" n'est pas vérifiée sur SendGrid. Allez dans Settings → Sender Authentication pour la vérifier.`);
      } else if (statusCode === 401) {
        throw new Error('Erreur SendGrid (401 Unauthorized): API Key invalide ou sans permissions.');
      } else {
        throw new Error(`Erreur SendGrid (${statusCode}): ${JSON.stringify(body)}`);
      }
    }
    throw error;
  }
}

// Fonction interne pour envoyer via SMTP
async function sendViaSmtp(mailContent) {
  if (!transporter) {
    throw new Error('Transporteur SMTP non configuré');
  }

  await transporter.sendMail({
    ...mailContent,
    from: mailContent.from || config.email.from
  });
  console.log('[EMAIL] Email envoyé via SMTP à', mailContent.to);
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

L'équipe Scenacte`,
    html: `
      <h2>Bonjour ${username},</h2>
      <p>Bienvenue sur <strong>Scenacte</strong> !</p>
      <p>Votre compte a été créé avec succès. Vous pouvez maintenant commencer à écrire vos pièces de théâtre.</p>
      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
      <p>L'équipe Scenacte</p>
    `
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
  try {
    if (isSendGridConfigured) {
      await sendViaSendGrid(mailContent);
    } else if (isSmtpConfigured) {
      await sendViaSmtp(mailContent);
    } else {
      console.warn('[EMAIL] ⚠️  Aucun service d\'email configuré : email de bienvenue non envoyé à', email);
    }
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de bienvenue:', error.message);
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
    html: `
      <h2>Bonjour ${username},</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Scenacte</strong>.</p>
      <p>Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p>Ou copiez ce lien dans votre navigateur :</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p><strong>Ce lien est valable pendant 1 heure.</strong></p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      <p>L'équipe Scenacte</p>
    `
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
  try {
    if (isSendGridConfigured) {
      await sendViaSendGrid(mailContent);
    } else if (isSmtpConfigured) {
      await sendViaSmtp(mailContent);
    } else {
      throw new Error('Service d\'email non configuré. Contactez l\'administrateur.');
    }
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi de l\'email de réinitialisation:', error.message);
    throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
  }
}

/**
 * Vérifie la connexion email au démarrage
 */
export async function verifyEmailConnection() {
  if (isDevelopment) {
    console.log('[EMAIL] ✓ Mode développement activé (emails affichés dans la console)');
    return true;
  }

  // SendGrid : pas de vérification nécessaire (API key validée lors de l'envoi)
  if (isSendGridConfigured) {
    console.log('[EMAIL] ✓ SendGrid configuré (vérification lors de l\'envoi)');
    return true;
  }

  // SMTP : vérifier la connexion
  if (!transporter) {
    console.warn('[EMAIL] ⚠️  Aucun service d\'email configuré : les emails ne seront pas envoyés');
    return false;
  }

  try {
    await transporter.verify();
    console.log('[EMAIL] ✓ Connexion SMTP établie avec succès');
    return true;
  } catch (error) {
    console.error('[EMAIL] ✗ Erreur de connexion SMTP:', error.message);
    console.warn('[EMAIL] ⚠️  Les emails ne seront pas envoyés');
    console.warn('[EMAIL] 💡 Conseil : Sur Render.com (plan gratuit), utilisez SendGrid ou le port 2525');
    return false;
  }
}