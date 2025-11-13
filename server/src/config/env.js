import dotenv from 'dotenv';

dotenv.config();

// Validation des variables d'environnement critiques
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'
];

// Variables d'email optionnelles (le serveur peut démarrer sans elles)
const optionalEmailVars = [
  'SENDGRID_API_KEY',   // Prioritaire : API SendGrid (recommandé pour Render.com)
  'EMAIL_FROM',         // Adresse email d'expédition
  'SMTP_HOST',          // Fallback : serveur SMTP
  'SMTP_PORT',          // Port SMTP (2525 recommandé sur Render.com free tier)
  'SMTP_USER',
  'SMTP_PASSWORD'
];

// Vérifier les variables obligatoires
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable d'environnement manquante : ${envVar}`);
  }
}

// Vérifier la configuration email (non-bloquant)
const hasSendGrid = !!process.env.SENDGRID_API_KEY;
const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD;

if (!hasSendGrid && !hasSmtp) {
  console.warn('⚠️  Aucun service d\'email configuré');
  console.warn('⚠️  Configurez SENDGRID_API_KEY (recommandé) ou SMTP_HOST/SMTP_USER/SMTP_PASSWORD');
  console.warn('⚠️  Les fonctionnalités d\'email seront désactivées');
} else if (hasSendGrid) {
  console.log('✓ Service d\'email : SendGrid (API HTTP)');
} else if (hasSmtp) {
  console.log(`✓ Service d\'email : SMTP (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || '2525'})`);
}

export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Email (SendGrid ou SMTP)
  email: {
    // SendGrid (prioritaire)
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    // Adresse d'expédition
    from: process.env.EMAIL_FROM || process.env.SMTP_FROM || 'noreply@scenacte.com'
  },

  // SMTP (fallback si SendGrid n'est pas configuré)
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 2525, // 2525 par défaut (compatible Render free tier)
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || ''
  },

  // Server
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // Client
  client: {
    // Normaliser l'URL en retirant le trailing slash pour éviter les problèmes CORS
    url: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
  },

  // Limits
  limits: {
    maxContentSizeMB: parseInt(process.env.MAX_CONTENT_SIZE_MB, 10) || 10,
    maxContentSizeBytes: (parseInt(process.env.MAX_CONTENT_SIZE_MB, 10) || 10) * 1024 * 1024
  }
};