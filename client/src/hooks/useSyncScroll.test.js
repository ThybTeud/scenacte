import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSyncScroll } from './useSyncScroll';

describe('useSyncScroll', () => {
  describe('interface retournée', () => {
    it('expose previewScrollRef, scrollContainerRef et handleEditorScroll', () => {
      const { result } = renderHook(() => useSyncScroll());

      expect(result.current).toHaveProperty('previewScrollRef');
      expect(result.current).toHaveProperty('scrollContainerRef');
      expect(result.current).toHaveProperty('handleEditorScroll');
      expect(typeof result.current.handleEditorScroll).toBe('function');
    });

    it('initialise les refs à null', () => {
      const { result } = renderHook(() => useSyncScroll());

      expect(result.current.previewScrollRef.current).toBeNull();
      expect(result.current.scrollContainerRef.current).toBeNull();
    });
  });

  describe('handleEditorScroll', () => {
    it('ne lève pas d\'erreur quand previewScrollRef est null', () => {
      const { result } = renderHook(() => useSyncScroll());

      expect(() =>
        result.current.handleEditorScroll({ firstVisibleLine: 5 })
      ).not.toThrow();
    });

    it('ne lève pas d\'erreur quand scrollContainerRef est null', () => {
      const { result } = renderHook(() => useSyncScroll());
      result.current.previewScrollRef.current = { scrollToLine: vi.fn() };

      expect(() =>
        result.current.handleEditorScroll({ firstVisibleLine: 5 })
      ).not.toThrow();
    });

    it('n\'appelle pas scrollToLine si scrollContainerRef est null', () => {
      const { result } = renderHook(() => useSyncScroll());
      const mockScrollToLine = vi.fn();
      result.current.previewScrollRef.current = { scrollToLine: mockScrollToLine };

      result.current.handleEditorScroll({ firstVisibleLine: 5 });

      expect(mockScrollToLine).not.toHaveBeenCalled();
    });

    it('n\'appelle pas scrollToLine si firstVisibleLine est undefined', () => {
      const { result } = renderHook(() => useSyncScroll());
      const mockScrollToLine = vi.fn();
      result.current.previewScrollRef.current = { scrollToLine: mockScrollToLine };
      result.current.scrollContainerRef.current = document.createElement('div');

      result.current.handleEditorScroll({});

      expect(mockScrollToLine).not.toHaveBeenCalled();
    });

    it('appelle scrollToLine avec firstVisibleLine et le conteneur quand les deux refs sont définies', () => {
      const { result } = renderHook(() => useSyncScroll());
      const mockScrollToLine = vi.fn();
      const mockContainer = document.createElement('div');
      result.current.previewScrollRef.current = { scrollToLine: mockScrollToLine };
      result.current.scrollContainerRef.current = mockContainer;

      result.current.handleEditorScroll({ firstVisibleLine: 10 });

      expect(mockScrollToLine).toHaveBeenCalledWith(10, mockContainer);
    });

    it('appelle scrollToLine avec firstVisibleLine = 0', () => {
      const { result } = renderHook(() => useSyncScroll());
      const mockScrollToLine = vi.fn();
      const mockContainer = document.createElement('div');
      result.current.previewScrollRef.current = { scrollToLine: mockScrollToLine };
      result.current.scrollContainerRef.current = mockContainer;

      result.current.handleEditorScroll({ firstVisibleLine: 0 });

      expect(mockScrollToLine).toHaveBeenCalledWith(0, mockContainer);
    });

    it('handleEditorScroll est stable entre les renders', () => {
      const { result, rerender } = renderHook(() => useSyncScroll());
      const first = result.current.handleEditorScroll;

      rerender();

      expect(result.current.handleEditorScroll).toBe(first);
    });
  });
});
