import { playsService } from './plays.service';
import { templatesService } from './templates.service';

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

export const storageService = {
  // Liste les pièces via API
  async listPlays(params = {}) {
    const response = await playsService.listPlays(params);
    // Aplatir les stats depuis statistics (JSONB) vers les champs attendus par PlayCard
    response.plays = response.plays.map((play) => ({
      ...play,
      charactersCount: play.statistics?.totalCharacters ?? 0,
      scenesCount: play.statistics?.totalScenes ?? 0,
      repliquesCount: play.statistics?.totalLines ?? 0,
    }));
    return response;
  },

  // Récupère une pièce par ID
  async getPlay(id) {
    return playsService.getPlay(id);
  },

  // Crée une nouvelle pièce
  async createPlay(data) {
    return playsService.createPlay({
      ...data,
      rawContent: data.rawContent ?? DEFAULT_PLAY_CONTENT,
    });
  },

  // Sauvegarde une pièce existante (crée une version)
  async savePlay(id, data) {
    return playsService.savePlay(id, data);
  },

  // Renomme une pièce (ne crée pas de version)
  async renamePlay(id, data) {
    return playsService.renamePlay(id, data);
  },

  // Supprime une pièce
  async deletePlay(id) {
    return playsService.deletePlay(id);
  },

  // Met à jour le statut d'une pièce
  async updatePlayStatus(id, status) {
    return playsService.updatePlayStatus(id, status);
  },

  // ============================================
  // SETTINGS DE MISE EN PAGE
  // ============================================

  /**
   * Récupère les templates publics (système)
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
    return playsService.renamePlay(playId, {
      paperSize: settings.paperSize,
      templateId: settings.templateId,
    });
  },
};
