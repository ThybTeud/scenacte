import { cleanEnv, str, port, url, email } from 'envalid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Obtenir le répertoire racine du serveur (server/)
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverRoot = join(__dirname, '..', '..');

/**
 * Charger le bon fichier .env selon l'environnement
 */
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = join(serverRoot, envFile);
const result = dotenv.config({ path: envPath });

// En mode développement, afficher le chemin chargé pour debug
if (process.env.NODE_ENV === 'development') {
  console.log('[ENV] Loaded environment from:', envPath);
}

if (result.error) {
  // En production (Render), le fichier .env n'existe pas car les variables
  // sont configurées via l'interface web - c'est normal, on continue
  if (result.error.code === 'ENOENT') {
    console.log('[INFO] No .env file found, using system environment variables');
  } else {
    // Autres erreurs (permissions, etc.) sont des vrais problèmes
    console.error('[ERROR] Failed to load .env file from:', envPath);
    console.error('[ERROR]', result.error);
    throw result.error;
  }
}

/**
 * Validation stricte des variables d'environnement avec envalid
 * Le serveur crash immédiatement si une variable est invalide ou manquante
 */
const env = cleanEnv(process.env, {
  // Database
  DATABASE_URL: url({
    desc: 'PostgreSQL connection string',
    example: 'postgresql://user:password@localhost:5432/scenacte'
  }),

  // JWT
  JWT_SECRET: str({
    desc: 'Secret key for JWT signing (min 32 characters)',
    minLength: 32
  }),
  JWT_EXPIRES_IN: str({
    desc: 'JWT expiration duration',
    default: '7d'
  }),
  RESET_TOKEN_SECRET: str({
    desc: 'Secret key for password reset tokens (optional, defaults to JWT_SECRET)',
    default: ''
  }),

  // Email configuration
  RESEND_API_KEY: str({
    desc: 'Resend API key (optional)',
    default: ''
  }),
  EMAIL_FROM: str({
    desc: 'Sender email address (supports RFC 5322 format with display name)',
    default: 'noreply@scenacte.fr',
    // Accepte soit "email@domain.com" soit "Display Name <email@domain.com>"
    example: 'Scenacte <noreply@scenacte.fr>',
    validator: (value) => {
      // Format simple : email@domain.com
      const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Format RFC 5322 : Display Name <email@domain.com>
      const rfc5322Regex = /^.+\s+<[^\s@]+@[^\s@]+\.[^\s@]+>$/;

      if (simpleEmailRegex.test(value) || rfc5322Regex.test(value)) {
        return value;
      }
      throw new Error('EMAIL_FROM must be a valid email address or RFC 5322 format (e.g., "Name <email@domain.com>")');
    }
  }),

  // Server
  NODE_ENV: str({
    desc: 'Node environment',
    choices: ['development', 'production', 'test', 'staging'],
    default: 'development'
  }),
  PORT: port({
    desc: 'Server port',
    default: 3000
  }),

  // Client
  CLIENT_URL: url({
    desc: 'Frontend URL for CORS',
    example: 'http://localhost:5173'
  }),

  // Limits
  MAX_CONTENT_SIZE_MB: str({
    desc: 'Maximum content size in MB',
    default: '10'
  })
});

/**
 * Configuration exportée avec la même structure que l'ancienne version
 * Pour maintenir la compatibilité avec le code existant
 */
export const config = {
  database: {
    url: env.DATABASE_URL
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    resetSecret: env.RESET_TOKEN_SECRET || env.JWT_SECRET
  },

  email: {
    resendApiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM
  },

  server: {
    port: env.PORT,
    env: env.NODE_ENV
  },

  client: {
    url: env.CLIENT_URL.replace(/\/$/, '') // Retirer le trailing slash
  },

  limits: {
    maxContentSizeMB: parseInt(env.MAX_CONTENT_SIZE_MB, 10),
    maxContentSizeBytes: parseInt(env.MAX_CONTENT_SIZE_MB, 10) * 1024 * 1024
  }
};
