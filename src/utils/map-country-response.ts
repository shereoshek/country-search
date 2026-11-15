export interface CountryCurrency {
  code: string;
  name: string;
  symbol: string;
}

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
  area?: number | null;
  borders?: string[] | null;
  currencies?: CountryCurrency[] | null;
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
  area: number | null;
  borders: string[];
  currencies: CountryCurrency[];
  languages: string[];
}

export function mapCountryResponse(raw: CountryApiResponse): CountryCard {
  return {
    name: raw.name,
    flag: raw.flags?.svg || raw.flag || raw.flags?.png || '',
    capital: raw.capital ?? null,
    region: raw.region ?? null,
    population: raw.population ?? 0,
    area: raw.area ?? null,
    borders: raw.borders ? [...raw.borders] : [],
    currencies: raw.currencies?.map((currency) => ({ ...currency })) ?? [],
    languages: raw.languages?.map((language) => language.name) ?? [],
  };
}
