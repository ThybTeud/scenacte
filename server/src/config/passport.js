import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './env.js';
import prisma from '../db/index.js';
import { logger } from '../utils/logger.js';

if (config.oauth.googleClientId && config.oauth.googleClientSecret && config.oauth.callbackUrl) {
  passport.use(new GoogleStrategy(
    {
      clientID: config.oauth.googleClientId,
      clientSecret: config.oauth.googleClientSecret,
      callbackURL: config.oauth.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Aucun email associé au compte Google'));
        }

        const providerId = profile.id;
        const avatarUrl = profile.photos?.[0]?.value ?? null;

        // 1. Compte déjà lié à Google
        let user = await prisma.user.findFirst({
          where: { provider: 'google', providerId },
        });
        if (user) return done(null, user);

        // 2. Email existant (compte local) → fusion
        user = await prisma.user.findFirst({ where: { email } });
        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { provider: 'google', providerId, avatarUrl },
          });
          return done(null, user);
        }

        // 3. Nouveau compte OAuth
        user = await prisma.user.create({
          data: { email, provider: 'google', providerId, avatarUrl },
        });
        done(null, user);
      } catch (err) {
        logger.error(err, 'Google OAuth strategy error');
        done(err);
      }
    }
  ));
} else {
  logger.warn('Google OAuth non configuré (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / OAUTH_CALLBACK_URL manquants)');
}

export default passport;
