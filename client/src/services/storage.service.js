import { playsService } from './plays.service';
import { templatesService } from './templates.service';

const GUEST_DATA_KEY = 'scenacte_guest_data';
const GUEST_SETTINGS_KEY = 'scenacte_page_settings';

const DEFAULT_PLAY_CONTENT = `#Acte I : Bienvenue sur Scenacte

##Scène 1 : Comment écrire

@Alice
(entrant, hésitante)
Bonjour ! Je suis un personnage. Mon nom commence par @.

@Bob
Et moi je lui réponds. Chaque réplique est du texte libre, tout simplement.

(Ils se regardent un instant.)

@Alice
Les didascalies entre parenthèses (comme celle-ci) peuvent aussi s'insérer dans mes répliques.

@Bob
Pour créer un nouvel acte, tape # suivi du titre.
Pour une nouvelle scène, utilise ##.
C'est tout ce qu'il faut savoir pour commencer !

(Noir.)`;

// Génère un UUID simple pour les IDs des pièces invitées
const generateGuestId = () => {
  return 'guest_' + crypto.randomUUID();
};

// Valide la structure des données localStorage
const validateLocalData = (data) => {
  // Vérifier que data est un objet
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }

  // Vérifier que data.plays est un tableau
  if (!Array.isArray(data.plays)) {
    return false;
  }

  // Vérifier que chaque play a les propriétés minimales requises
  return data.plays.every((play) => {
    return (
      play &&
      typeof play === 'object' &&
      typeof play.id === 'string' &&
      typeof play.title === 'string' &&
      (typeof play.rawContent === 'string' || play.rawContent === undefined) &&
      typeof play.createdAt === 'string' &&
      typeof play.updatedAt === 'string'
    );
  });
};

// Vérifie si l'utilisateur est en mode invité (pas de token)
const isGuest = () => {
  return !localStorage.getItem('token');
};

// Récupère les données invité du localStorage
const getGuestData = () => {
  try {
    const raw = localStorage.getItem(GUEST_DATA_KEY);
    if (!raw) {
      return { plays: [] };
    }

    const data = JSON.parse(raw);

    // Valider la structure des données
    if (!validateLocalData(data)) {
      console.warn(
        '[StorageService] Données localStorage invalides, réinitialisation'
      );
      localStorage.removeItem(GUEST_DATA_KEY);
      return { plays: [] };
    }

    return data;
  } catch (e) {
    console.error('[StorageService] Erreur parsing localStorage:', e);
    localStorage.removeItem(GUEST_DATA_KEY);
    return { plays: [] };
  }
};

// Sauvegarde les données invité dans le localStorage
const setGuestData = (data) => {
  localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
};

// ============================================
// OPÉRATIONS LOCALES (MODE INVITÉ)
// ============================================

const getLocalPlays = () => {
  const data = getGuestData();
  // Retourne les pièces dans le même format que l'API
  return {
    plays: data.plays,
    pagination: {
      page: 1,
      limit: data.plays.length,
      total: data.plays.length,
      totalPages: 1,
    },
  };
};

const getLocalPlay = (id) => {
  const data = getGuestData();
  const play = data.plays.find((p) => p.id === id);

  if (!play) {
    throw new Error('Pièce non trouvée');
  }

  return { play };
};

const createLocalPlay = (playData) => {
  const data = getGuestData();

  const newPlay = {
    id: generateGuestId(),
    title: playData.title || 'Sans titre',
    subtitle: playData.subtitle || '',
    rawContent: playData.rawContent ?? DEFAULT_PLAY_CONTENT,
    htmlContent: playData.htmlContent || '',
    status: playData.status || 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastEditedAt: new Date().toISOString(),
  };

  data.plays.unshift(newPlay); // Ajoute en début de liste
  setGuestData(data);

  return { play: newPlay };
};

const saveLocalPlay = (id, playData) => {
  const data = getGuestData();
  const playIndex = data.plays.findIndex((p) => p.id === id);

  if (playIndex === -1) {
    throw new Error('Pièce non trouvée');
  }

  const updatedPlay = {
    ...data.plays[playIndex],
    ...playData,
    updatedAt: new Date().toISOString(),
    lastEditedAt: new Date().toISOString(),
  };

  data.plays[playIndex] = updatedPlay;
  setGuestData(data);

  return { play: updatedPlay };
};

const deleteLocalPlay = (id) => {
  const data = getGuestData();
  const playIndex = data.plays.findIndex((p) => p.id === id);

  if (playIndex === -1) {
    throw new Error('Pièce non trouvée');
  }

  data.plays.splice(playIndex, 1);
  setGuestData(data);

  return { success: true };
};

const updateLocalPlayStatus = (id, status) => {
  return saveLocalPlay(id, { status });
};

// ============================================
// API ABSTRAITE (AUTO-DÉTECTION MODE)
// ============================================

export const storageService = {
  // Retourne true si l'utilisateur est en mode invité
  isGuestMode: isGuest,

  // Liste les pièces (localStorage ou API selon le mode)
  async listPlays(params = {}) {
    if (isGuest()) {
      // En mode invité, on ignore la pagination et les filtres pour simplifier
      return getLocalPlays();
    }
    return playsService.listPlays(params);
  },

  // Récupère une pièce par ID
  async getPlay(id) {
    if (isGuest()) {
      return getLocalPlay(id);
    }
    return playsService.getPlay(id);
  },

  // Crée une nouvelle pièce
  async createPlay(data) {
    if (isGuest()) {
      return createLocalPlay(data);
    }
    return playsService.createPlay(data);
  },

  // Sauvegarde une pièce existante (crée une version)
  async savePlay(id, data) {
    if (isGuest()) {
      return saveLocalPlay(id, data);
    }
    return playsService.savePlay(id, data);
  },

  // Renomme une pièce (ne crée pas de version)
  async renamePlay(id, data) {
    if (isGuest()) {
      return saveLocalPlay(id, data);
    }
    return playsService.renamePlay(id, data);
  },

  // Supprime une pièce
  async deletePlay(id) {
    if (isGuest()) {
      return deleteLocalPlay(id);
    }
    return playsService.deletePlay(id);
  },

  // Met à jour le statut d'une pièce
  async updatePlayStatus(id, status) {
    if (isGuest()) {
      return updateLocalPlayStatus(id, status);
    }
    return playsService.updatePlayStatus(id, status);
  },

  // Récupère toutes les données invité (pour migration)
  getGuestData() {
    return getGuestData();
  },

  // Vérifie si des données invité existent
  hasGuestData() {
    const data = getGuestData();
    return data.plays.length > 0;
  },

  // Retourne le nombre de pièces invité
  getGuestPlaysCount() {
    const data = getGuestData();
    return data.plays.length;
  },

  // Supprime les données invité (après migration)
  clearGuestData() {
    localStorage.removeItem(GUEST_DATA_KEY);
  },

  // Migre les données invité vers le compte de l'utilisateur
  async migrateGuestData() {
    const data = getGuestData();

    if (data.plays.length === 0) {
      return { success: true, migrated: 0 };
    }

    // Créer chaque pièce sur le serveur
    const results = await Promise.allSettled(
      data.plays.map((play) =>
        playsService.createPlay({
          title: play.title,
          subtitle: play.subtitle || '',
          rawContent: play.rawContent || '',
          htmlContent: play.htmlContent || '',
          status: play.status || 'draft',
        })
      )
    );

    // Compter les succès
    const successCount = results.filter((r) => r.status === 'fulfilled').length;

    // Supprimer les données locales après migration
    this.clearGuestData();

    return {
      success: true,
      migrated: successCount,
      total: data.plays.length,
      failed: data.plays.length - successCount,
    };
  },

  // ============================================
  // SETTINGS DE MISE EN PAGE
  // ============================================

  /**
   * Récupère les templates publics (système)
   * Fonctionne en mode invité et connecté
   */
  async getPublicTemplates() {
    return templatesService.getPublicTemplates();
  },

  /**
   * Met à jour les paramètres de mise en page d'une pièce
   * @param {string} playId - ID de la pièce
   * @param {object} settings - { paperSize, templateId }
   */
  async updatePlaySettings(playId, settings) {
    if (isGuest()) {
      // En mode invité, on sauvegarde dans localStorage
      const data = getGuestData();
      const playIndex = data.plays.findIndex((p) => p.id === playId);

      if (playIndex !== -1) {
        data.plays[playIndex] = {
          ...data.plays[playIndex],
          paperSize: settings.paperSize,
          templateId: settings.templateId,
          updatedAt: new Date().toISOString(),
        };
        setGuestData(data);
      }

      // Aussi sauvegarder comme settings par défaut
      localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(settings));

      return { success: true };
    }

    // Mode connecté: appel API
    return playsService.renamePlay(playId, {
      paperSize: settings.paperSize,
      templateId: settings.templateId,
    });
  },

  /**
   * Récupère les settings de mise en page par défaut (mode invité)
   */
  getGuestPageSettings() {
    try {
      const raw = localStorage.getItem(GUEST_SETTINGS_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};
