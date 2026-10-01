'use strict';

/**
 * Sentry error and session-replay reporting. The vendored SDK is only ever
 * downloaded by a visitor who has consented: it is about 70 KB gzipped.
 */
export default class SentryReporter {
    #window;
    #document;
    #dsn;
    #sdkUrl;

    /**
     * @param {Window}   window
     * @param {Document} document
     * @param {String}   dsn     the Sentry DSN; empty switches reporting off
     * @param {String}   sdkUrl  where the vendored SDK is served from
     */
    constructor(window, document, dsn, sdkUrl) {
        this.#window = window;
        this.#document = document;
        this.#dsn = dsn;
        this.#sdkUrl = sdkUrl;
    }

    /**
     * Fetch the vendored SDK, resolving true once window.Sentry is defined and
     * false if the script could not be loaded. No memoisation, because enable
     * runs at most once per page view (the banner is hidden as soon as it is
     * answered).
     *
     * @returns {Promise<Boolean>}
     */
    loadSdk() {
        if (this.#window.Sentry) {
            return Promise.resolve(true);
        }

        return new Promise((resolve) => {
            const script = this.#document.createElement('script');
            script.src = this.#sdkUrl;
            script.addEventListener('load', () => resolve(true));
            script.addEventListener('error', () => resolve(false));
            this.#document.head.appendChild(script);
        });
    }

    /**
     * Bring up reporting. Not awaited by callers: reporting arrives when it
     * arrives, and nothing downstream depends on it. Guards against
     * double-initialisation and against the SDK not being there afterwards
     * (blocked load, or jsdom in tests): telemetry must never break the page.
     * Replay is recorded only when an error occurs (replaysSessionSampleRate 0),
     * with the SDK's default text/input masking on.
     *
     * @returns {Promise<void>}
     */
    async enable() {
        if (!this.#dsn) {
            return;
        }
        if (this.#window.Sentry) {
            if (this.#window.Sentry.getClient()) {
                return;
            }
        }
        const loaded = await this.loadSdk();
        if (!loaded) {
            return;
        }
        if (!this.#window.Sentry) {
            return;
        }
        this.#window.Sentry.init({
            dsn: this.#dsn,
            integrations: [this.#window.Sentry.replayIntegration()],
            replaysSessionSampleRate: 0,
            replaysOnErrorSampleRate: 1.0,
            environment: 'production',
        });
    }
}
