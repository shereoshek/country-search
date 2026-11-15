const API_BASE_URL = 'https://countries.dev/name';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string = `HTTP error: ${status}`,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export async function searchCountries(
  query: string,
  signal: AbortSignal,
): Promise<Record<string, unknown>[]> {
  const url = `${API_BASE_URL}/${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    method: 'GET',
    signal,
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status, `Request failed with status ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new TypeError('Expected an array of countries');
  }

  return data as Record<string, unknown>[];
}
