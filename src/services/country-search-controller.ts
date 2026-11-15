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

    // Invalidate the previous request immediately.
    this.requestVersion += 1;

    // Cancel the active request before starting another one.
    this.activeController?.abort();
    this.activeController = null;

    if (!normalizedQuery) {
      // Reset the pending debounce timer without sending a request.
      this.scheduleSearch('');
      this.onStateChange({ status: 'idle' });
      return;
    }

    this.scheduleSearch(normalizedQuery);
  }

  private async performSearch(query: string): Promise<void> {
    const currentVersion = this.requestVersion;
    const controller = new AbortController();

    this.activeController = controller;

    this.onStateChange({
      status: 'loading',
      query,
    });

    const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

    const combinedSignal = AbortSignal.any([controller.signal, timeoutSignal]);

    try {
      const rawCountries = await searchCountries(query, combinedSignal);

      // Ignore results from outdated requests.
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

      // User-initiated cancellation is not an error.
      if (errorType === 'abort') {
        return;
      }

      // Timeout, HTTP and network errors should be displayed.
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
