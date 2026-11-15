import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/utils/debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not execute the function immediately', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced();

    expect(callback).not.toHaveBeenCalled();
  });

  it('should execute the function after the specified delay', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced();

    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer when called again before the delay expires', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced();

    vi.advanceTimersByTime(200);

    debounced();

    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should use arguments from the latest call', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced('sp');
    debounced('spain');

    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('spain');
  });
});
