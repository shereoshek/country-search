import { searchCountries } from '../api/countries-api.js';
import {
  mapCountryResponse,
  type CountryApiResponse,
  type CountryCard,
} from '../utils/map-country-response.js';
import { classifySearchError } from '../utils/search-error.js';
import { debounce } from '../utils/debounce.js';

const REQUEST_TIMEOUT_MS = 10000;

export type CountrySearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; countries: CountryCard[] }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; error: unknown };

export class CountrySearchController {
  private activeController: AbortController | null = null;

  private requestVersion = 0;

  private lastQuery: string | null = null;

  private readonly scheduleSearch: (query: string) => void;

  constructor(
    private readonly onStateChange: (state: CountrySearchState) => void,
    delay = 300,
  ) {
    this.scheduleSearch = debounce((query: string) => {
      if (query) {
        void this.performSearch(query);
      }
    }, delay);
  }

  handleInput(query: string): void {
    const normalizedQuery = query.trim();

    // Invalidate the previous request immediately, before the debounce delay.
    this.requestVersion += 1;

    // Abort the active network request as soon as the input changes.
    this.activeController?.abort();
    this.activeController = null;

    if (!normalizedQuery) {
      this.lastQuery = null;
      this.scheduleSearch('');
      this.onStateChange({ status: 'idle' });
      return;
    }

    this.lastQuery = normalizedQuery;

    // Update the UI immediately; the network request still waits for debounce.
    this.onStateChange({
      status: 'loading',
      query: normalizedQuery,
    });

    this.scheduleSearch(normalizedQuery);
  }

  retryLastSearch(): void {
    if (this.lastQuery === null) {
      return;
    }

    this.handleInput(this.lastQuery);
  }

  private async performSearch(query: string): Promise<void> {
    const currentVersion = this.requestVersion;
    const controller = new AbortController();

    this.activeController = controller;

    const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const combinedSignal = AbortSignal.any([controller.signal, timeoutSignal]);

    try {
      const rawCountries = await searchCountries(query, combinedSignal);

      // Ignore results from outdated requests as an extra guard alongside abort().
      if (currentVersion !== this.requestVersion) {
        return;
      }

      const countries = rawCountries.map((country) =>
        mapCountryResponse(country as unknown as CountryApiResponse),
      );

      if (countries.length === 0) {
        this.onStateChange({
          status: 'empty',
          query,
        });

        return;
      }

      this.onStateChange({
        status: 'success',
        query,
        countries,
      });
    } catch (error) {
      if (currentVersion !== this.requestVersion) {
        return;
      }

      const errorType = classifySearchError(error);

      // User-initiated cancellation is not an error shown to the user.
      if (errorType === 'abort') {
        return;
      }

      // Timeout, HTTP and network errors should be displayed with a retry action.
      this.onStateChange({
        status: 'error',
        query,
        error,
      });
    } finally {
      if (this.activeController === controller) {
        this.activeController = null;
      }
    }
  }
}
