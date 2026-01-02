import { playsService } from './plays.service';

const GUEST_DATA_KEY = 'scenacte_guest_data';

// Génère un UUID simple pour les IDs des pièces invitées
const generateGuestId = () => {
  return 'guest_' + crypto.randomUUID();
};

// Vérifie si l'utilisateur est en mode invité (pas de token)
const isGuest = () => {
  return !localStorage.getItem('token');
};

// Récupère les données invité du localStorage
const getGuestData = () => {
  const data = localStorage.getItem(GUEST_DATA_KEY);
  return data ? JSON.parse(data) : { plays: [] };
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
    rawContent: playData.rawContent || '',
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

  // Sauvegarde une pièce existante
  async savePlay(id, data) {
    if (isGuest()) {
      return saveLocalPlay(id, data);
    }
    return playsService.savePlay(id, data);
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
};
