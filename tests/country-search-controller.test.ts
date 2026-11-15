import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CountrySearchController,
  type CountrySearchState,
} from '../src/services/country-search-controller.js';

const countryResponse = [
  {
    name: 'Spain',
    flag: '🇪🇸',
    capital: 'Madrid',
    region: 'Europe',
    population: 48000000,
    languages: [{ name: 'Spanish' }],
    currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
    area: 505990,
    borders: ['AND', 'FRA', 'GIB', 'PRT'],
  },
];

describe('CountrySearchController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should show loading immediately when a non-empty query is entered', () => {
    const states: CountrySearchState[] = [];
    const controller = new CountrySearchController((state) => states.push(state), 300);

    controller.handleInput('Spain');

    expect(states.at(-1)).toEqual({ status: 'loading', query: 'Spain' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should show an empty state when the API returns 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Country not found', { status: 404 }));
    const states: CountrySearchState[] = [];
    const controller = new CountrySearchController((state) => states.push(state), 300);

    controller.handleInput('NoSuchCountry');
    await vi.advanceTimersByTimeAsync(300);

    expect(states.at(-1)).toEqual({ status: 'empty', query: 'NoSuchCountry' });
  });

  it('should retry the last query after a failed request', async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(countryResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const states: CountrySearchState[] = [];
    const controller = new CountrySearchController((state) => states.push(state), 300);

    controller.handleInput('Spain');
    await vi.advanceTimersByTimeAsync(300);

    expect(states.at(-1)?.status).toBe('error');

    controller.retryLastSearch();
    await vi.advanceTimersByTimeAsync(300);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe('https://countries.dev/name/Spain');
    expect(vi.mocked(fetch).mock.calls[1]?.[0]).toBe('https://countries.dev/name/Spain');
    expect(states.at(-1)).toMatchObject({
      status: 'success',
      query: 'Spain',
      countries: [{ name: 'Spain', capital: 'Madrid' }],
    });
  });
});
