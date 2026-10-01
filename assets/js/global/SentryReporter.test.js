import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import SentryReporter from './SentryReporter.js';

const DSN = 'https://key@example.ingest.sentry.io/1';
const SDK_URL = '/assets/js/vendor/sentry.min.js';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const injectedScript = () => document.head.querySelector(`script[src="${SDK_URL}"]`);
const reporter = (dsn = DSN) => new SentryReporter(window, document, dsn, SDK_URL);

let sentry;
let replayIntegration;

beforeEach(() => {
    replayIntegration = { name: 'Replay' };
    sentry = {
        init: vi.fn(),
        getClient: vi.fn().mockReturnValue(undefined),
        replayIntegration: vi.fn().mockReturnValue(replayIntegration),
    };
});

afterEach(() => {
    delete window.Sentry;
    injectedScript()?.remove();
});

describe('SentryReporter', () => {
    it('initialises Sentry with the replay integration', async () => {
        window.Sentry = sentry;

        await reporter().enable();

        expect(sentry.init).toHaveBeenCalledTimes(1);
        const config = sentry.init.mock.calls[0][0];
        expect(config.dsn).toBe(DSN);
        expect(config.integrations).toContain(replayIntegration);
        expect(config.replaysSessionSampleRate).toBe(0);
        expect(config.replaysOnErrorSampleRate).toBe(1.0);
        expect(config.environment).toBe('production');
    });

    it('neither fetches nor initialises Sentry when no DSN is configured', async () => {
        window.Sentry = sentry;

        await reporter('').enable();

        expect(sentry.init).not.toHaveBeenCalled();
        expect(injectedScript()).toBeNull();
    });

    it('does not re-initialise when a Sentry client already exists', async () => {
        sentry.getClient.mockReturnValue({});
        window.Sentry = sentry;

        await reporter().enable();

        expect(sentry.init).not.toHaveBeenCalled();
    });

    it('does not fetch the SDK again when it is already on the page', async () => {
        window.Sentry = sentry;

        await reporter().enable();

        expect(injectedScript()).toBeNull();
    });

    it('initialises Sentry once the injected SDK has loaded', async () => {
        const pending = reporter().enable();
        await flush();

        expect(injectedScript()).not.toBeNull();
        expect(sentry.init).not.toHaveBeenCalled();

        window.Sentry = sentry;
        injectedScript().dispatchEvent(new Event('load'));
        await pending;

        expect(sentry.init).toHaveBeenCalledTimes(1);
    });

    it('is a no-op when the SDK script fails to load', async () => {
        const pending = reporter().enable();
        await flush();

        injectedScript().dispatchEvent(new Event('error'));
        await pending;

        expect(sentry.init).not.toHaveBeenCalled();
    });

    it('is a no-op when the script loads without defining window.Sentry', async () => {
        const pending = reporter().enable();
        await flush();

        // Loaded, but window.Sentry absent: a stubbed or truncated bundle.
        injectedScript().dispatchEvent(new Event('load'));
        await pending;

        expect(sentry.init).not.toHaveBeenCalled();
    });

    it('resolves loadSdk true straight away when window.Sentry exists', async () => {
        window.Sentry = sentry;

        await expect(reporter().loadSdk()).resolves.toBe(true);
    });
});
