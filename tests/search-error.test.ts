import { describe, expect, it } from 'vitest';

import { HttpError } from '../src/api/countries-api.js';
import { classifySearchError } from '../src/utils/search-error.js';

describe('classifySearchError', () => {
  it('should identify AbortError', () => {
    const error = new DOMException('Request aborted', 'AbortError');

    expect(classifySearchError(error)).toBe('abort');
  });

  it('should identify TimeoutError', () => {
    const error = new DOMException('Request timed out', 'TimeoutError');

    expect(classifySearchError(error)).toBe('timeout');
  });

  it('should identify HttpError', () => {
    const error = new HttpError(500, 'Internal Server Error');

    expect(classifySearchError(error)).toBe('http');
  });

  it('should identify network errors', () => {
    const error = new TypeError('Failed to fetch');

    expect(classifySearchError(error)).toBe('network');
  });
});
