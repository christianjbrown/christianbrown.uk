import { describe, it, expect, afterEach, vi } from 'vitest';
import DataFetcher from './DataFetcher.js';

/** Build a minimal fetch Response stand-in. */
function response({ ok = true, status = 200, statusText = 'OK', json } = {}) {
    return {
        ok,
        status,
        statusText,
        json: json ?? (async () => ({})),
    };
}

/** A payload that satisfies the built-in JSON_CONTRACT. */
const validEnvelope = (overrides = {}) => ({
    data: { temp: 21 },
    success: true,
    version: '1.0.0',
    ...overrides,
});

function stubFetch(impl) {
    vi.stubGlobal('fetch', vi.fn(impl));
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('DataFetcher', () => {
    it('requests the configured url', async () => {
        stubFetch(async () => response({ json: async () => validEnvelope() }));
        await new DataFetcher('https://example.test/api').fetch();
        expect(fetch).toHaveBeenCalledWith('https://example.test/api');
    });

    describe('connection failures', () => {
        it('translates a "Failed to fetch" TypeError into a friendly message', async () => {
            stubFetch(async () => { throw new TypeError('Failed to fetch'); });
            await expect(new DataFetcher('u').fetch()).rejects.toThrow('Could not connect to API');
        });

        it('rethrows a TypeError with a different message', async () => {
            const err = new TypeError('something else');
            stubFetch(async () => { throw err; });
            await expect(new DataFetcher('u').fetch()).rejects.toBe(err);
        });

        it('rethrows a non-TypeError error', async () => {
            const err = new Error('boom');
            stubFetch(async () => { throw err; });
            await expect(new DataFetcher('u').fetch()).rejects.toBe(err);
        });
    });

    describe('non-JSON response bodies', () => {
        it('reports a bad body on an ok response', async () => {
            stubFetch(async () => response({ json: async () => { throw new Error('bad json'); } }));
            await expect(new DataFetcher('u').fetch())
                .rejects.toThrow('Fetched data okay, but the response body was not JSON');
        });

        it('reports the status on a non-ok response', async () => {
            stubFetch(async () => response({
                ok: false, status: 502, statusText: 'Bad Gateway',
                json: async () => { throw new Error('bad json'); },
            }));
            await expect(new DataFetcher('u').fetch())
                .rejects.toThrow('Fetching data, got 502 Bad Gateway from the server, and the response body was not JSON');
        });
    });

    describe('contract violations', () => {
        it('reports unexpected data on an ok response', async () => {
            stubFetch(async () => response({ json: async () => ({ success: true, data: { a: 1 } }) }));
            await expect(new DataFetcher('u').fetch())
                .rejects.toThrow(/Fetched and parsed the data okay, but it's not what we expected\./);
        });

        it('reports unexpected data together with the status on a non-ok response', async () => {
            stubFetch(async () => response({
                ok: false, status: 500, statusText: 'Server Error',
                json: async () => ({ success: true, data: { a: 1 } }),
            }));
            await expect(new DataFetcher('u').fetch())
                .rejects.toThrow(/Fetching data, got 500 Server Error from the server, and the data is not what we expected\./);
        });
    });

    describe('application-level errors', () => {
        it('surfaces an error field from the payload', async () => {
            stubFetch(async () => response({ json: async () => validEnvelope({ error: 'kaboom' }) }));
            await expect(new DataFetcher('u').fetch())
                .rejects.toThrow('Fetched data okay, but data contains error: kaboom');
        });

        it('reports an unsuccessful payload', async () => {
            stubFetch(async () => response({ json: async () => validEnvelope({ success: false }) }));
            await expect(new DataFetcher('u').fetch())
                .rejects.toThrow('Fetched data okay, but data says it was not successful, without any further information about why');
        });

        it('reports a non-ok status when the payload is otherwise valid', async () => {
            stubFetch(async () => response({
                ok: false, status: 503, statusText: 'Unavailable',
                json: async () => validEnvelope(),
            }));
            await expect(new DataFetcher('u').fetch())
                .rejects.toThrow('Fetching data, got 503 Unavailable from the server');
        });
    });

    describe('success', () => {
        it('returns the inner data with the default (empty) data contract', async () => {
            stubFetch(async () => response({ json: async () => validEnvelope({ data: { temp: 21 } }) }));
            await expect(new DataFetcher('u').fetch()).resolves.toEqual({ temp: 21 });
        });

        it('validates the inner data against a supplied data contract', async () => {
            const contract = { temp: { type: 'number', keyRequired: true } };
            stubFetch(async () => response({ json: async () => validEnvelope({ data: { temp: 21 } }) }));
            await expect(new DataFetcher('u', contract).fetch()).resolves.toEqual({ temp: 21 });
        });

        it('rejects when the inner data violates the supplied data contract', async () => {
            const contract = { temp: { type: 'string', keyRequired: true } };
            stubFetch(async () => response({ json: async () => validEnvelope({ data: { temp: 21 } }) }));
            await expect(new DataFetcher('u', contract).fetch()).rejects.toThrow(/must be of type "string"/);
        });
    });
});
