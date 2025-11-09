import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

/**
 * Création du transporteur SMTP
 */
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465, // true pour 465, false pour les autres ports
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password
  }
});

/**
 * Envoie un email de bienvenue après inscription
 * @param {string} email - Email du destinataire
 * @param {string} username - Nom d'utilisateur
 */
export async function sendWelcomeEmail(email, username) {
  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Bienvenue sur Scenacte',
      text: `Bonjour ${username},

Bienvenue sur Scenacte !

Votre compte a été créé avec succès. Vous pouvez maintenant commencer à écrire vos pièces de théâtre.

Si vous avez des questions, n'hésitez pas à nous contacter.

L'équipe Scenacte`
    });

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

  try {
    await transporter.sendMail({
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
    });

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
  try {
    await transporter.verify();
    console.log('[EMAIL] Connexion SMTP établie avec succès');
    return true;
  } catch (error) {
    console.error('[EMAIL] Erreur de connexion SMTP:', error);
    return false;
  }
}