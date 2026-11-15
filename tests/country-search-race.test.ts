import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CountrySearchController,
  type CountrySearchState,
} from '../src/services/country-search-controller.js';

const oldCountry = {
  name: 'Poland',
  flag: '🇵🇱',
  capital: 'Warsaw',
  region: 'Europe',
  population: 38000000,
  languages: [{ name: 'Polish' }],
};

const newCountry = {
  name: 'Spain',
  flag: '🇪🇸',
  capital: 'Madrid',
  region: 'Europe',
  population: 48000000,
  languages: [{ name: 'Spanish' }],
};

describe('CountrySearchController race condition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should abort the previous request and keep only the latest result', async () => {
    let firstRequestAborted = false;

    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = String(input);

      if (url.endsWith('/sp')) {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            resolve(
              new Response(JSON.stringify([oldCountry]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }),
            );
          }, 1000);

          const onAbort = () => {
            clearTimeout(timer);
            firstRequestAborted = true;

            reject(new DOMException('Request aborted', 'AbortError'));
          };

          if (init?.signal?.aborted) {
            onAbort();
          } else {
            init?.signal?.addEventListener('abort', onAbort, {
              once: true,
            });
          }
        });
      }

      if (url.endsWith('/spain')) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(
              new Response(JSON.stringify([newCountry]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }),
            );
          }, 10);
        });
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    vi.stubGlobal('fetch', fetchMock);

    const states: CountrySearchState[] = [];

    const controller = new CountrySearchController((state) => states.push(state), 300);

    // Start the first, slower request.
    controller.handleInput('sp');

    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstSignal = fetchMock.mock.calls[0]?.[1]?.signal;

    // A new input must cancel the first request immediately.
    controller.handleInput('spain');

    expect(firstSignal?.aborted).toBe(true);
    expect(firstRequestAborted).toBe(true);

    // Start and complete the second, faster request.
    await vi.advanceTimersByTimeAsync(300);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(10);

    const finalState = states[states.length - 1];

    expect(finalState).toMatchObject({
      status: 'success',
      query: 'spain',
      countries: [
        {
          name: 'Spain',
          capital: 'Madrid',
        },
      ],
    });

    // The obsolete response must never replace the latest result.
    expect(states.some((state) => state.status === 'success' && state.query === 'sp')).toBe(false);

    // User-initiated cancellation must not be shown as an error.
    expect(states.some((state) => state.status === 'error')).toBe(false);
  });
});
