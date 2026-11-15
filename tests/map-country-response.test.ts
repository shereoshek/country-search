import { describe, expect, it } from 'vitest';

import { mapCountryResponse, type CountryApiResponse } from '../src/utils/map-country-response.js';

describe('mapCountryResponse', () => {
  it('should map all country properties correctly', () => {
    const raw = {
      name: 'Spain',
      flag: '🇪🇸',
      flags: {
        svg: 'https://countries.dev/flags/es.svg',
        png: 'https://countries.dev/flags/es.png',
      },
      capital: 'Madrid',
      region: 'Europe',
      population: 48000000,
      languages: [{ name: 'Spanish' }, { name: 'Catalan' }],
    } satisfies CountryApiResponse;

    expect(mapCountryResponse(raw)).toEqual({
      name: 'Spain',
      flag: 'https://countries.dev/flags/es.svg',
      capital: 'Madrid',
      region: 'Europe',
      population: 48000000,
      languages: ['Spanish', 'Catalan'],
    });
  });

  it('should use emoji when SVG flag is unavailable', () => {
    const raw = {
      name: 'Spain',
      flag: '🇪🇸',
      capital: 'Madrid',
      region: 'Europe',
      population: 48000000,
      languages: [],
    } satisfies CountryApiResponse;

    expect(mapCountryResponse(raw).flag).toBe('🇪🇸');
  });

  it('should use PNG when SVG and emoji are unavailable', () => {
    const raw = {
      name: 'Spain',
      flags: {
        png: 'https://countries.dev/flags/es.png',
      },
    } satisfies CountryApiResponse;

    expect(mapCountryResponse(raw).flag).toBe('https://countries.dev/flags/es.png');
  });

  it('should provide default values for missing optional properties', () => {
    const raw = {
      name: 'Nauru',
    } satisfies CountryApiResponse;

    expect(mapCountryResponse(raw)).toEqual({
      name: 'Nauru',
      flag: '',
      capital: null,
      region: null,
      population: 0,
      languages: [],
    });
  });

  it('should not modify the original API response', () => {
    const raw = {
      name: 'Spain',
      flag: '🇪🇸',
      capital: 'Madrid',
      region: 'Europe',
      population: 48000000,
      languages: [{ name: 'Spanish' }],
    } satisfies CountryApiResponse;

    const original = structuredClone(raw);

    mapCountryResponse(raw);

    expect(raw).toEqual(original);
  });
});
