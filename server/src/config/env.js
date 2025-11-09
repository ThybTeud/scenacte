import dotenv from 'dotenv';

dotenv.config();

// Validation des variables d'environnement critiques
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable d'environnement manquante : ${envVar}`);
  }
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

  // SMTP
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM
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