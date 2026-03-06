import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useArrows, computePaths } from './useArrows';

// ─── ResizeObserver mock ─────────────────────────────────────────────────────

let resizeObserverCallbacks = [];

class MockResizeObserver {
  constructor(cb) {
    this._cb = cb;
    resizeObserverCallbacks.push(cb);
  }
  observe() {}
  disconnect() {
    resizeObserverCallbacks = resizeObserverCallbacks.filter((c) => c !== this._cb);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeElement(rect) {
  return { getBoundingClientRect: () => ({ ...rect }) };
}

function makeContainer(rect) {
  return { getBoundingClientRect: () => ({ ...rect }) };
}

function makeRef(element) {
  return { current: element };
}

// ─── Tests for computePaths (pure function) ───────────────────────────────────

describe('computePaths', () => {
  let getByIdSpy;

  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver;
    resizeObserverCallbacks = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resizeObserverCallbacks = [];
  });

  function setupElements(fromRect, toRect) {
    const elements = {
      'label-el': makeElement(fromRect),
      'target-el': makeElement(toRect),
    };
    getByIdSpy = vi.spyOn(document, 'getElementById').mockImplementation(
      (id) => elements[id] ?? null,
    );
  }

  const container = makeContainer({ left: 0, top: 0, width: 800, height: 400 });

  it('returns null for unknown element IDs', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(null);
    const result = computePaths(
      [{ from: 'missing', to: 'also-missing', fromSide: 'right' }],
      container,
    );
    expect(result[0]).toBeNull();
  });

  describe('start point — fromSide: "right"', () => {
    it('starts at the right edge of the from element', () => {
      setupElements(
        { left: 10, right: 80, top: 50, bottom: 70, height: 20, width: 70 },
        { left: 200, right: 300, top: 50, bottom: 70, height: 20, width: 100 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'right' }],
        container,
      );

      // startX = fromRect.right - container.left = 80 - 0 = 80
      expect(path.points[0].x).toBe(80);
      // startY = fromRect.top + height/2 - container.top = 50 + 10 = 60
      expect(path.points[0].y).toBe(60);
    });
  });

  describe('start point — fromSide: "left"', () => {
    it('starts at the left edge of the from element', () => {
      setupElements(
        { left: 600, right: 700, top: 100, bottom: 140, height: 40, width: 100 },
        { left: 100, right: 200, top: 100, bottom: 140, height: 40, width: 100 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'left' }],
        container,
      );

      // startX = fromRect.left - container.left = 600 - 0 = 600
      expect(path.points[0].x).toBe(600);
      // startY = 100 + 20 = 120
      expect(path.points[0].y).toBe(120);
    });
  });

  describe('end point', () => {
    it('ends at the left edge of target when fromSide is "right"', () => {
      setupElements(
        { left: 10, right: 80, top: 50, bottom: 70, height: 20, width: 70 },
        { left: 200, right: 350, top: 50, bottom: 70, height: 20, width: 150 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'right' }],
        container,
      );

      // endX = toRect.left - container.left = 200
      expect(path.end.x).toBe(200);
    });

    it('ends at the right edge of target when fromSide is "left"', () => {
      setupElements(
        { left: 600, right: 700, top: 100, bottom: 140, height: 40, width: 100 },
        { left: 100, right: 250, top: 100, bottom: 140, height: 40, width: 150 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'left' }],
        container,
      );

      // endX = toRect.right - container.left = 250
      expect(path.end.x).toBe(250);
    });
  });

  describe('single horizontal segment (deltaY ≈ 0)', () => {
    it('produces exactly 2 points when elements are vertically aligned', () => {
      // Same vertical centre → deltaY = 0
      setupElements(
        { left: 10, right: 80, top: 50, bottom: 70, height: 20, width: 70 },
        { left: 200, right: 350, top: 50, bottom: 70, height: 20, width: 150 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'right' }],
        container,
      );

      expect(path.points).toHaveLength(2);
      expect(path.points[0].y).toBe(path.points[1].y);
    });

    it('is still horizontal when deltaY < 5px threshold', () => {
      setupElements(
        { left: 10, right: 80, top: 50, bottom: 70, height: 20, width: 70 },
        // target vertically offset by 4px (centre at 54 vs 60 → deltaY = -6)
        // Let's make them match to 1px difference
        { left: 200, right: 350, top: 51, bottom: 71, height: 20, width: 150 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'right' }],
        container,
      );

      // deltaY = 61 - 60 = 1 → horizontal
      expect(path.points).toHaveLength(2);
    });
  });

  describe('two segments: horizontal + 45° diagonal', () => {
    it('produces exactly 3 points when elements differ vertically', () => {
      // from centre Y = 60, to centre Y = 160 → deltaY = 100
      setupElements(
        { left: 10, right: 80, top: 50, bottom: 70, height: 20, width: 70 },
        { left: 200, right: 350, top: 150, bottom: 170, height: 20, width: 150 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'right' }],
        container,
      );

      expect(path.points).toHaveLength(3);
    });

    it('diagonal is exactly 45° — |deltaX| === |deltaY| of the diagonal segment', () => {
      // from: right edge at 80, centre Y at 60
      // to:   left edge at 300, centre Y at 160 → deltaY = 100
      setupElements(
        { left: 10, right: 80, top: 50, bottom: 70, height: 20, width: 70 },
        { left: 300, right: 450, top: 150, bottom: 170, height: 20, width: 150 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'right' }],
        container,
      );

      const [, junction, end] = path.points;
      const diagonalDeltaX = Math.abs(end.x - junction.x);
      const diagonalDeltaY = Math.abs(end.y - junction.y);

      expect(diagonalDeltaX).toBe(diagonalDeltaY);
    });

    it('diagonal is exactly 45° for fromSide: "left"', () => {
      // from: left edge at 600, centre Y at 120
      // to:   right edge at 200, centre Y at 220 → deltaY = 100
      setupElements(
        { left: 600, right: 700, top: 110, bottom: 130, height: 20, width: 100 },
        { left: 100, right: 200, top: 210, bottom: 230, height: 20, width: 100 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'left' }],
        container,
      );

      const [, junction, end] = path.points;
      const diagonalDeltaX = Math.abs(end.x - junction.x);
      const diagonalDeltaY = Math.abs(end.y - junction.y);

      expect(diagonalDeltaX).toBe(diagonalDeltaY);
    });

    it('junction point is at correct X position (fromSide: "right")', () => {
      // endX = 300, deltaY = 100 → junctionX = 300 - 1 * 100 = 200
      setupElements(
        { left: 10, right: 80, top: 50, bottom: 70, height: 20, width: 70 },
        { left: 300, right: 450, top: 150, bottom: 170, height: 20, width: 150 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'right' }],
        container,
      );

      const [, junction] = path.points;
      // endX = 300, |deltaY| = 100, sign = +1 → junctionX = 300 - 100 = 200
      expect(junction.x).toBe(200);
      // First segment is horizontal: junction.y === start.y
      expect(junction.y).toBe(path.points[0].y);
    });

    it('junction point is at correct X position (fromSide: "left")', () => {
      // endX = 200, deltaY = 100 → junctionX = 200 - (-1) * 100 = 300
      setupElements(
        { left: 600, right: 700, top: 110, bottom: 130, height: 20, width: 100 },
        { left: 100, right: 200, top: 210, bottom: 230, height: 20, width: 100 },
      );

      const [path] = computePaths(
        [{ from: 'label-el', to: 'target-el', fromSide: 'left' }],
        container,
      );

      const [, junction] = path.points;
      // endX = 200, |deltaY| = 100, sign = -1 → junctionX = 200 + 100 = 300
      expect(junction.x).toBe(300);
      expect(junction.y).toBe(path.points[0].y);
    });
  });
});

// ─── Tests for useArrows (hook) ───────────────────────────────────────────────

describe('useArrows', () => {
  beforeEach(() => {
    global.ResizeObserver = MockResizeObserver;
    resizeObserverCallbacks = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resizeObserverCallbacks = [];
  });

  const ARROWS = [{ from: 'label-el', to: 'target-el', fromSide: 'right' }];

  function setupElements() {
    const elements = {
      'label-el': makeElement({ left: 10, right: 80, top: 50, bottom: 70, height: 20, width: 70 }),
      'target-el': makeElement({ left: 200, right: 350, top: 50, bottom: 70, height: 20, width: 150 }),
    };
    vi.spyOn(document, 'getElementById').mockImplementation(
      (id) => elements[id] ?? null,
    );
  }

  it('returns empty paths initially when containerRef is null', () => {
    const ref = { current: null };
    const { result } = renderHook(() => useArrows(ARROWS, ref));
    expect(result.current.paths).toHaveLength(0);
  });

  it('computes paths on mount when container is present', async () => {
    setupElements();
    const container = makeContainer({ left: 0, top: 0, width: 800, height: 400 });
    const ref = makeRef(container);

    const { result } = renderHook(() => useArrows(ARROWS, ref));

    // After mount effect runs
    await act(async () => {});

    expect(result.current.paths).toHaveLength(1);
    expect(result.current.paths[0]).not.toBeNull();
  });

  it('recalculates paths when ResizeObserver fires', async () => {
    setupElements();
    const container = makeContainer({ left: 0, top: 0, width: 800, height: 400 });
    const ref = makeRef(container);

    const { result } = renderHook(() => useArrows(ARROWS, ref));
    await act(async () => {});

    const firstPaths = result.current.paths;

    // Trigger ResizeObserver
    await act(async () => {
      resizeObserverCallbacks.forEach((cb) => cb([]));
    });

    // Paths should be recomputed (same structure for same elements)
    expect(result.current.paths).toHaveLength(firstPaths.length);
    expect(result.current.paths[0]).not.toBeNull();
  });

  it('disconnects ResizeObserver on unmount', async () => {
    setupElements();
    const container = makeContainer({ left: 0, top: 0, width: 800, height: 400 });
    const ref = makeRef(container);

    const { unmount } = renderHook(() => useArrows(ARROWS, ref));
    await act(async () => {});

    expect(resizeObserverCallbacks).toHaveLength(1);

    unmount();

    expect(resizeObserverCallbacks).toHaveLength(0);
  });
});
