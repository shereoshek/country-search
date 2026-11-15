import { HttpError } from '../api/countries-api.js';
export function classifySearchError(error) {
    if (error instanceof HttpError) {
        return 'http';
    }
    if (typeof error === 'object' && error !== null && 'name' in error) {
        if (error.name === 'AbortError') {
            return 'abort';
        }
        if (error.name === 'TimeoutError') {
            return 'timeout';
        }
    }
    return 'network';
}
