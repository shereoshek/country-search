import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError, searchCountries } from '../src/api/countries-api.js';

const mockCountries = [
  {
    name: 'Spain',
    capital: 'Madrid',
    region: 'Europe',
    population: 48000000,
    flag: '🇪🇸',
    languages: [{ name: 'Spanish' }],
    currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  },
];

describe('searchCountries', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should send GET request to the correct API endpoint', async () => {
    const signal = new AbortController().signal;
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockCountries), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await searchCountries('Spain', signal);

    expect(fetchMock).toHaveBeenCalledWith('https://countries.dev/name/Spain', {
      method: 'GET',
      signal,
    });

    expect(result).toEqual(mockCountries);
  });

  it('should encode special characters in the search query', async () => {
    const signal = new AbortController().signal;
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(mockCountries), { status: 200 }));

    await searchCountries('New Zealand', signal);

    expect(fetchMock).toHaveBeenCalledWith('https://countries.dev/name/New%20Zealand', {
      method: 'GET',
      signal,
    });
  });

  it('should return an empty array when the response status is 404', async () => {
    const signal = new AbortController().signal;
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(new Response('Country not found', { status: 404 }));

    const result = await searchCountries('UnknownCountry', signal);

    expect(result).toEqual([]);
  });

  it('should throw HttpError when the server returns status 500', async () => {
    const signal = new AbortController().signal;
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }));

    const error = await searchCountries('Spain', signal).catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toHaveProperty('status', 500);
  });

  it('should propagate network errors', async () => {
    const signal = new AbortController().signal;
    const fetchMock = vi.mocked(fetch);
    const networkError = new TypeError('Failed to fetch');

    fetchMock.mockRejectedValueOnce(networkError);

    await expect(searchCountries('Spain', signal)).rejects.toBe(networkError);
  });
});
