import pino from 'pino';

/**
 * Logger centralisé avec Pino
 * - Utilise pino-pretty en développement pour une meilleure lisibilité
 * - Format JSON structuré en production pour les outils d'analyse
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
});
