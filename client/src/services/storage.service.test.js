import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from './storage.service';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('isGuestMode', () => {
    it('should return true when no token exists', () => {
      expect(storageService.isGuestMode()).toBe(true);
    });

    it('should return false when token exists', () => {
      localStorage.setItem('token', 'fake-token');
      expect(storageService.isGuestMode()).toBe(false);
    });
  });

  describe('getGuestData', () => {
    it('should return empty plays array when no data exists', () => {
      const data = storageService.getGuestData();
      expect(data).toEqual({ plays: [] });
    });

    it('should return stored plays', () => {
      const testData = {
        plays: [
          {
            id: 'guest_1',
            title: 'Test Play',
            rawContent: 'Test content',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(testData));

      const data = storageService.getGuestData();
      expect(data.plays).toHaveLength(1);
      expect(data.plays[0].title).toBe('Test Play');
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('scenacte_guest_data', 'invalid json{');
      const data = storageService.getGuestData();
      expect(data).toEqual({ plays: [] });
    });

    it('should validate data structure and reset if invalid', () => {
      localStorage.setItem('scenacte_guest_data', JSON.stringify({ invalid: 'data' }));
      const data = storageService.getGuestData();
      expect(data).toEqual({ plays: [] });
    });

    it('should reject invalid play objects', () => {
      const invalidData = {
        plays: [
          { id: 'test' } // Missing required fields
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(invalidData));
      const data = storageService.getGuestData();
      expect(data).toEqual({ plays: [] });
    });
  });

  describe('hasGuestData', () => {
    it('should return false when no data exists', () => {
      expect(storageService.hasGuestData()).toBe(false);
    });

    it('should return true when plays exist', () => {
      const testData = {
        plays: [
          {
            id: 'guest_1',
            title: 'Test',
            rawContent: '',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(testData));

      expect(storageService.hasGuestData()).toBe(true);
    });
  });

  describe('clearGuestData', () => {
    it('should remove guest data from localStorage', () => {
      localStorage.setItem('scenacte_guest_data', JSON.stringify({ plays: [] }));

      storageService.clearGuestData();

      expect(localStorage.getItem('scenacte_guest_data')).toBeNull();
    });
  });

  describe('listPlays (guest mode)', () => {
    it('should return empty list for guest with no plays', async () => {
      const result = await storageService.listPlays();

      expect(result.plays).toEqual([]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 1
      });
    });

    it('should return stored plays for guest', async () => {
      const testData = {
        plays: [
          {
            id: 'guest_1',
            title: 'Play 1',
            rawContent: 'Content 1',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            id: 'guest_2',
            title: 'Play 2',
            rawContent: 'Content 2',
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(testData));

      const result = await storageService.listPlays();

      expect(result.plays).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('getPlay (guest mode)', () => {
    it('should retrieve a play by ID', async () => {
      const testData = {
        plays: [
          {
            id: 'guest_123',
            title: 'Test Play',
            rawContent: 'Content',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(testData));

      const result = await storageService.getPlay('guest_123');

      expect(result.play.id).toBe('guest_123');
      expect(result.play.title).toBe('Test Play');
    });

    it('should throw error for non-existent play', async () => {
      await expect(storageService.getPlay('non-existent')).rejects.toThrow('Pièce non trouvée');
    });
  });

  describe('createPlay (guest mode)', () => {
    it('should create a new play with generated ID', async () => {
      const playData = {
        title: 'New Play',
        subtitle: 'A subtitle',
        rawContent: '#Acte I'
      };

      const result = await storageService.createPlay(playData);

      expect(result.play.id).toMatch(/^guest_/);
      expect(result.play.title).toBe('New Play');
      expect(result.play.subtitle).toBe('A subtitle');
      expect(result.play.rawContent).toBe('#Acte I');
    });

    it('should add play to beginning of list', async () => {
      const existingData = {
        plays: [
          {
            id: 'guest_1',
            title: 'Old Play',
            rawContent: '',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(existingData));

      await storageService.createPlay({ title: 'New Play' });

      const allPlays = await storageService.listPlays();
      expect(allPlays.plays[0].title).toBe('New Play');
      expect(allPlays.plays[1].title).toBe('Old Play');
    });

    it('should use default title when not provided', async () => {
      const result = await storageService.createPlay({});

      expect(result.play.title).toBe('Sans titre');
    });

    it('should set default values for missing fields', async () => {
      const result = await storageService.createPlay({ title: 'Test' });

      expect(result.play.subtitle).toBe('');
      expect(result.play.rawContent).toBe('');
      expect(result.play.htmlContent).toBe('');
      expect(result.play.status).toBe('draft');
      expect(result.play.createdAt).toBeDefined();
      expect(result.play.updatedAt).toBeDefined();
      expect(result.play.lastEditedAt).toBeDefined();
    });

    it('should generate unique IDs for multiple plays', async () => {
      const result1 = await storageService.createPlay({ title: 'Play 1' });
      const result2 = await storageService.createPlay({ title: 'Play 2' });

      expect(result1.play.id).not.toBe(result2.play.id);
    });
  });

  describe('savePlay (guest mode)', () => {
    beforeEach(() => {
      const testData = {
        plays: [
          {
            id: 'guest_123',
            title: 'Original Title',
            subtitle: '',
            rawContent: 'Original content',
            htmlContent: '',
            status: 'draft',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            lastEditedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(testData));
    });

    it('should update an existing play', async () => {
      const result = await storageService.savePlay('guest_123', {
        title: 'Updated Title',
        rawContent: 'Updated content'
      });

      expect(result.play.title).toBe('Updated Title');
      expect(result.play.rawContent).toBe('Updated content');
    });

    it('should preserve unchanged fields', async () => {
      const result = await storageService.savePlay('guest_123', {
        title: 'Updated Title'
      });

      expect(result.play.title).toBe('Updated Title');
      expect(result.play.rawContent).toBe('Original content');
      expect(result.play.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should update timestamps', async () => {
      const result = await storageService.savePlay('guest_123', {
        title: 'Updated Title'
      });

      expect(result.play.updatedAt).not.toBe('2024-01-01T00:00:00.000Z');
      expect(result.play.lastEditedAt).not.toBe('2024-01-01T00:00:00.000Z');
    });

    it('should throw error for non-existent play', async () => {
      await expect(
        storageService.savePlay('non-existent', { title: 'Test' })
      ).rejects.toThrow('Pièce non trouvée');
    });
  });

  describe('deletePlay (guest mode)', () => {
    beforeEach(() => {
      const testData = {
        plays: [
          {
            id: 'guest_1',
            title: 'Play 1',
            rawContent: '',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            id: 'guest_2',
            title: 'Play 2',
            rawContent: '',
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(testData));
    });

    it('should delete a play', async () => {
      const result = await storageService.deletePlay('guest_1');

      expect(result.success).toBe(true);

      const allPlays = await storageService.listPlays();
      expect(allPlays.plays).toHaveLength(1);
      expect(allPlays.plays[0].id).toBe('guest_2');
    });

    it('should throw error for non-existent play', async () => {
      await expect(storageService.deletePlay('non-existent')).rejects.toThrow('Pièce non trouvée');
    });
  });

  describe('updatePlayStatus (guest mode)', () => {
    beforeEach(() => {
      const testData = {
        plays: [
          {
            id: 'guest_123',
            title: 'Test Play',
            subtitle: '',
            rawContent: '',
            htmlContent: '',
            status: 'draft',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            lastEditedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(testData));
    });

    it('should update play status', async () => {
      const result = await storageService.updatePlayStatus('guest_123', 'published');

      expect(result.play.status).toBe('published');
    });

    it('should preserve other fields when updating status', async () => {
      const result = await storageService.updatePlayStatus('guest_123', 'published');

      expect(result.play.title).toBe('Test Play');
      expect(result.play.rawContent).toBe('');
    });
  });

  describe('data validation', () => {
    it('should reject array instead of object', () => {
      localStorage.setItem('scenacte_guest_data', JSON.stringify([]));
      const data = storageService.getGuestData();
      expect(data).toEqual({ plays: [] });
    });

    it('should reject object without plays array', () => {
      localStorage.setItem('scenacte_guest_data', JSON.stringify({ other: 'data' }));
      const data = storageService.getGuestData();
      expect(data).toEqual({ plays: [] });
    });

    it('should reject plays with missing id', () => {
      const invalidData = {
        plays: [
          {
            title: 'Test',
            rawContent: '',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(invalidData));
      const data = storageService.getGuestData();
      expect(data).toEqual({ plays: [] });
    });

    it('should reject plays with missing title', () => {
      const invalidData = {
        plays: [
          {
            id: 'guest_1',
            rawContent: '',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(invalidData));
      const data = storageService.getGuestData();
      expect(data).toEqual({ plays: [] });
    });

    it('should reject plays with missing timestamps', () => {
      const invalidData = {
        plays: [
          {
            id: 'guest_1',
            title: 'Test',
            rawContent: ''
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(invalidData));
      const data = storageService.getGuestData();
      expect(data).toEqual({ plays: [] });
    });

    it('should accept plays with undefined rawContent', () => {
      const validData = {
        plays: [
          {
            id: 'guest_1',
            title: 'Test',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ]
      };
      localStorage.setItem('scenacte_guest_data', JSON.stringify(validData));
      const data = storageService.getGuestData();
      expect(data.plays).toHaveLength(1);
    });

    it('should reject null values', () => {
      localStorage.setItem('scenacte_guest_data', 'null');
      const data = storageService.getGuestData();
      expect(data).toEqual({ plays: [] });
    });
  });
});
