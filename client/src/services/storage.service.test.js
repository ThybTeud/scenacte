import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from './storage.service';
import { playsService } from './plays.service';

vi.mock('./plays.service', () => ({
  playsService: {
    listPlays: vi.fn(),
    createPlay: vi.fn(),
    getPlay: vi.fn(),
    savePlay: vi.fn(),
    renamePlay: vi.fn(),
    deletePlay: vi.fn(),
    updatePlayStatus: vi.fn(),
  },
}));

vi.mock('./templates.service', () => ({
  templatesService: {
    getPublicTemplates: vi.fn(),
  },
}));

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listPlays', () => {
    it('delegates to playsService and maps statistics', async () => {
      playsService.listPlays.mockResolvedValue({
        plays: [
          {
            id: '1',
            title: 'Test Play',
            statistics: { totalCharacters: 3, totalScenes: 2, totalLines: 20 },
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const result = await storageService.listPlays();

      expect(playsService.listPlays).toHaveBeenCalledWith({});
      expect(result.plays[0].charactersCount).toBe(3);
      expect(result.plays[0].scenesCount).toBe(2);
      expect(result.plays[0].repliquesCount).toBe(20);
    });

    it('uses 0 as default when statistics are missing', async () => {
      playsService.listPlays.mockResolvedValue({
        plays: [{ id: '1', title: 'Test', statistics: null }],
        pagination: {},
      });

      const result = await storageService.listPlays();

      expect(result.plays[0].charactersCount).toBe(0);
      expect(result.plays[0].scenesCount).toBe(0);
      expect(result.plays[0].repliquesCount).toBe(0);
    });

    it('passes params to playsService', async () => {
      playsService.listPlays.mockResolvedValue({ plays: [], pagination: {} });

      await storageService.listPlays({ page: 2, limit: 10 });

      expect(playsService.listPlays).toHaveBeenCalledWith({ page: 2, limit: 10 });
    });
  });

  describe('getPlay', () => {
    it('delegates to playsService', async () => {
      playsService.getPlay.mockResolvedValue({ play: { id: '1', title: 'Test' } });

      const result = await storageService.getPlay('1');

      expect(playsService.getPlay).toHaveBeenCalledWith('1');
      expect(result.play.id).toBe('1');
    });
  });

  describe('createPlay', () => {
    it('delegates to playsService with default rawContent', async () => {
      playsService.createPlay.mockResolvedValue({ play: { id: '1', title: 'New' } });

      await storageService.createPlay({ title: 'New' });

      expect(playsService.createPlay).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New', rawContent: expect.any(String) })
      );
    });

    it('preserves provided rawContent', async () => {
      playsService.createPlay.mockResolvedValue({ play: { id: '1' } });

      await storageService.createPlay({ title: 'New', rawContent: '#Acte I' });

      expect(playsService.createPlay).toHaveBeenCalledWith(
        expect.objectContaining({ rawContent: '#Acte I' })
      );
    });
  });

  describe('savePlay', () => {
    it('delegates to playsService', async () => {
      playsService.savePlay.mockResolvedValue({ play: { id: '1' } });

      await storageService.savePlay('1', { title: 'Updated' });

      expect(playsService.savePlay).toHaveBeenCalledWith('1', { title: 'Updated' });
    });
  });

  describe('renamePlay', () => {
    it('delegates to playsService', async () => {
      playsService.renamePlay.mockResolvedValue({ play: { id: '1' } });

      await storageService.renamePlay('1', { title: 'Renamed' });

      expect(playsService.renamePlay).toHaveBeenCalledWith('1', { title: 'Renamed' });
    });
  });

  describe('deletePlay', () => {
    it('delegates to playsService', async () => {
      playsService.deletePlay.mockResolvedValue({ success: true });

      const result = await storageService.deletePlay('1');

      expect(playsService.deletePlay).toHaveBeenCalledWith('1');
      expect(result.success).toBe(true);
    });
  });

  describe('updatePlayStatus', () => {
    it('delegates to playsService', async () => {
      playsService.updatePlayStatus.mockResolvedValue({ play: { id: '1', status: 'published' } });

      await storageService.updatePlayStatus('1', 'published');

      expect(playsService.updatePlayStatus).toHaveBeenCalledWith('1', 'published');
    });
  });

  describe('updatePlaySettings', () => {
    it('calls renamePlay with paperSize and templateId', async () => {
      playsService.renamePlay.mockResolvedValue({ success: true });

      await storageService.updatePlaySettings('play-1', {
        paperSize: 'A4',
        templateId: 'tmpl-1',
      });

      expect(playsService.renamePlay).toHaveBeenCalledWith('play-1', {
        paperSize: 'A4',
        templateId: 'tmpl-1',
      });
    });
  });
});
