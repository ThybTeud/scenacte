/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {Object} {valid: boolean, message: string}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email requis' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Format email invalide' };
  }

  if (email.length > 255) {
    return { valid: false, message: 'Email trop long (max 255 caractères)' };
  }

  return { valid: true, message: '' };
}

/**
 * Valide un nom d'utilisateur
 * @param {string} username - Username à valider
 * @returns {Object} {valid: boolean, message: string}
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Nom d\'utilisateur requis' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { valid: false, message: 'Nom d\'utilisateur trop court (min 3 caractères)' };
  }

  if (trimmed.length > 50) {
    return { valid: false, message: 'Nom d\'utilisateur trop long (max 50 caractères)' };
  }

  // Lettres, chiffres
  const usernameRegex = /^[a-zA-Z]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { valid: false, message: 'Nom d\'utilisateur invalide' };
  }

  return { valid: true, message: '' };
}

/**
 * Valide un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} {valid: boolean, message: string}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Mot de passe requis' };
  }

  if (password.length < 12) {
    return { valid: false, message: 'Mot de passe trop court (min 12 caractères)' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Mot de passe trop long (max 128 caractères)' };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const complexity = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

  if (complexity < 3) {
    return {
      valid: false,
      message: 'Mot de passe trop faible (nécessite 3 types parmi : minuscules, majuscules, chiffres, symboles)'
    };
  }

  return { valid: true, message: '' };
}

/**
 * Valide un titre de pièce
 * @param {string} title - Titre à valider
 * @returns {Object} {valid: boolean, message: string}
 */
export function validateTitle(title) {
  if (!title || typeof title !== 'string') {
    return { valid: false, message: 'Titre requis' };
  }

  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: 'Titre requis' };
  }

  if (trimmed.length > 255) {
    return { valid: false, message: 'Titre trop long (max 255 caractères)' };
  }

  return { valid: true, message: '' };
}

/**
 * Valide un contenu (rawContent ou htmlContent)
 * @param {string} content - Contenu à valider
 * @param {number} maxSizeBytes - Taille max en bytes
 * @returns {Object} {valid: boolean, message: string}
 */
export function validateContent(content, maxSizeBytes) {
  if (content === undefined || content === null) {
    return { valid: false, message: 'Contenu requis' };
  }

  if (typeof content !== 'string') {
    return { valid: false, message: 'Le contenu doit être une chaîne de caractères' };
  }

  // Calcul de la taille en bytes (UTF-8)
  const sizeBytes = Buffer.byteLength(content, 'utf8');

  if (sizeBytes > maxSizeBytes) {
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
    return { 
      valid: false, 
      message: `Contenu trop volumineux (${sizeMB} MB, max ${maxMB} MB)` 
    };
  }

  return { valid: true, message: '' };
}

/**
 * Valide un UUID
 * @param {string} id - UUID à valider
 * @returns {Object} {valid: boolean, message: string}
 */
export function validateUUID(id) {
  if (!id || typeof id !== 'string') {
    return { valid: false, message: 'ID requis' };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { valid: false, message: 'Format ID invalide' };
  }

  return { valid: true, message: '' };
}

/**
 * Valide un statut de pièce
 * @param {string} status - Statut à valider
 * @returns {Object} {valid: boolean, message: string}
 */
export function validatePlayStatus(status) {
  const validStatuses = ['draft', 'completed', 'archived'];
  
  if (!status || typeof status !== 'string') {
    return { valid: false, message: 'Statut requis' };
  }

  if (!validStatuses.includes(status)) {
    return { 
      valid: false, 
      message: `Statut invalide (valeurs acceptées : ${validStatuses.join(', ')})` 
    };
  }

  return { valid: true, message: '' };
}

/**
 * Valide un type de version
 * @param {string} versionType - Type de version à valider
 * @returns {Object} {valid: boolean, message: string}
 */
export function validateVersionType(versionType) {
  const validTypes = ['auto', 'manual'];
  
  if (!versionType || typeof versionType !== 'string') {
    return { valid: false, message: 'Type de version requis' };
  }

  if (!validTypes.includes(versionType)) {
    return { 
      valid: false, 
      message: `Type de version invalide (valeurs acceptées : ${validTypes.join(', ')})` 
    };
  }

  return { valid: true, message: '' };
}

/**
 * Valide des statistiques de pièce
 * @param {Object} stats - Statistiques à valider
 * @returns {Object} {valid: boolean, message: string}
 */
export function validateStatistics(stats) {
  if (!stats || typeof stats !== 'object') {
    return { valid: false, message: 'Statistiques requises' };
  }

  const requiredFields = [
    'totalActs',
    'totalScenes',
    'totalCharacters',
    'totalLines',
    'wordCount',
    'estimatedDurationMinutes'
  ];

  for (const field of requiredFields) {
    if (typeof stats[field] !== 'number' || stats[field] < 0) {
      return { 
        valid: false, 
        message: `Champ ${field} invalide (nombre >= 0 requis)` 
      };
    }
  }

  return { valid: true, message: '' };
}

/**
 * Valide un objet de pagination
 * @param {number} page - Numéro de page
 * @param {number} limit - Nombre d'éléments par page
 * @returns {Object} {valid: boolean, message: string, page: number, limit: number}
 */
export function validatePagination(page = 1, limit = 20) {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    return { valid: false, message: 'Numéro de page invalide (min 1)' };
  }

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return { valid: false, message: 'Limite invalide (entre 1 et 100)' };
  }

  return { 
    valid: true, 
    message: '', 
    page: parsedPage, 
    limit: parsedLimit 
  };
}