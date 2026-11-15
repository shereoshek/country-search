export interface CountryApiResponse {
  name: string;
  flag?: string;
  flags?: {
    svg?: string;
    png?: string;
  };
  capital?: string | null;
  region?: string | null;
  population?: number;
  languages?: Array<{
    name: string;
  }> | null;
}

export interface CountryCard {
  name: string;
  flag: string;
  capital: string | null;
  region: string | null;
  population: number;
  languages: string[];
}

export function mapCountryResponse(raw: CountryApiResponse): CountryCard {
  return {
    name: raw.name,
    flag: raw.flags?.svg || raw.flag || raw.flags?.png || '',
    capital: raw.capital ?? null,
    region: raw.region ?? null,
    population: raw.population ?? 0,
    languages: raw.languages?.map((language) => language.name) ?? [],
  };
}
