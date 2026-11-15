export function mapCountryResponse(raw) {
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
