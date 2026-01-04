import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 300));

    expect(result.current).toBe('initial');
  });

  it('should update value after delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 300 });
    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('should respect custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated');
  });

  it('should use default delay of 300ms when not specified', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    await act(async () => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout when value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'update1' });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'update2' });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'final' });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('final');
  });

  it('should handle rapid value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'v0' } }
    );

    expect(result.current).toBe('v0');

    rerender({ value: 'v1' });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'v2' });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'v3' });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'v4' });

    expect(result.current).toBe('v0');

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('v4');
  });

  it('should handle different data types', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 42 } }
    );

    expect(result.current).toBe(42);

    rerender({ value: 100 });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });

  it('should handle object values', async () => {
    const initialObj = { name: 'John', age: 30 };
    const updatedObj = { name: 'Jane', age: 25 };

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: initialObj } }
    );

    expect(result.current).toBe(initialObj);

    rerender({ value: updatedObj });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(updatedObj);
  });

  it('should handle array values', async () => {
    const initialArr = [1, 2, 3];
    const updatedArr = [4, 5, 6];

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: initialArr } }
    );

    expect(result.current).toBe(initialArr);

    rerender({ value: updatedArr });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(updatedArr);
  });

  it('should handle null and undefined', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: null });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(null);

    rerender({ value: undefined });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(undefined);
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useDebouncedValue('value', 300));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should handle delay changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 500 });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle zero delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 0),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });

  it('should handle very long delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 10000),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    await act(async () => {
      vi.advanceTimersByTime(9999);
    });
    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });
});
