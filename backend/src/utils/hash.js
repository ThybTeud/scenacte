import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash un mot de passe avec bcrypt
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<string>} Hash du mot de passe
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare un mot de passe en clair avec un hash
 * @param {string} password - Mot de passe en clair
 * @param {string} hash - Hash stocké en base
 * @returns {Promise<boolean>} true si le mot de passe correspond
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}