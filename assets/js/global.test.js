import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GOOGLE_ANALYTICS_ID, SENTRY_DSN, SENTRY_SDK_URL } from '/config/global.const.js';
import EN_GB from './i18n/messages.en-GB.js';

// global.js is the composition root, so these tests drive the whole page the
// way a browser does: build the markup, import the module, fire the events.
// The behaviour of each concern is tested in its own module under global/; what
// is checked here is that the wiring joins them up, and that the configured
// values reach the services that use them.

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const MARKUP = `
    <div id="cookies-backdrop" hidden></div>
    <div id="cookies" role="dialog" aria-modal="true" hidden>
        <p id="cookies-text">Are you okay if this site uses cookies to <a id="cookies-link-analytics" href="https://support.google.com/analytics/answer/11397207">measure traffic</a> and <a id="cookies-link-sentry" href="https://sentry.io/">catch errors</a>?</p>
        <button id="cookies-decline">No</button>
        <button id="cookies-accept">Yes</button>
    </div>
    <button id="theme-toggle" title="Switch colour theme" hidden></button>
    <strong id="header-job-title">Engineering Manager</strong>
    <span id="header-location" data-location="London, UK">London, UK</span>`;

const CONFIG = {
    COOKIES_ACCEPT_BUTTON_ID: 'cookies-accept',
    COOKIES_BACKDROP_ID: 'cookies-backdrop',
    COOKIES_DECLINE_BUTTON_ID: 'cookies-decline',
    COOKIES_DIV_ID: 'cookies',
    COOKIES_LINK_ANALYTICS_ID: 'cookies-link-analytics',
    COOKIES_LINK_SENTRY_ID: 'cookies-link-sentry',
    COOKIES_TEXT_ID: 'cookies-text',
    DEV_CONSOLE_LINE_1: 'line one',
    DEV_CONSOLE_LINE_1_STYLE: 'color: purple;',
    DEV_CONSOLE_LINE_2: 'line two',
    DEV_CONSOLE_LINE_2_STYLE: 'color: green;',
    GOOGLE_ANALYTICS_ID: 'G-CONFIGURED',
    SENTRY_DSN: 'https://configured@example.ingest.sentry.io/1',
    SENTRY_SDK_URL: '/assets/js/vendor/sentry.min.js',
    THEME_TOGGLE_ID: 'theme-toggle',
};

let originalLocation;
let loadListeners;
let consoleLog;

function setHostname(hostname) {
    Object.defineProperty(window, 'location', {
        configurable: true, writable: true, value: { hostname },
    });
}

function clearCookies() {
    document.cookie.split(';').forEach((cookie) => {
        const key = cookie.split('=')[0].trim();
        if (key) {
            document.cookie = `${key}=; max-age=0; Path=/; Secure`;
        }
    });
}

// Every import re-runs the module's top level, which registers a window load
// listener. Capture them so each test can take its own back out.
async function importGlobal(config = CONFIG) {
    vi.resetModules();
    vi.doMock('/config/global.const.js', () => config);
    await import('./global.js');
    await flush();
}

const fireLoad = async () => {
    window.dispatchEvent(new Event('load'));
    await flush();
};

beforeEach(() => {
    document.body.innerHTML = MARKUP;
    clearCookies();
    window.dataLayer = undefined;
    loadListeners = [];
    const realAdd = window.addEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
        if (type === 'load') {
            loadListeners.push(listener);
        }
        realAdd(type, listener, options);
    });
    consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    originalLocation = window.location;
    setHostname('christianbrown.uk');
});

afterEach(() => {
    loadListeners.forEach((listener) => window.removeEventListener('load', listener));
    vi.restoreAllMocks();
    vi.doUnmock('/config/global.const.js');
    vi.resetModules();
    delete window.Sentry;
    document.getElementById('gtag-js')?.remove();
    Object.defineProperty(window, 'location', {
        configurable: true, writable: true, value: originalLocation,
    });
});

describe('global.js', () => {
    it('is built from the real build-time constants without error', async () => {
        vi.doUnmock('/config/global.const.js');
        vi.resetModules();

        await import('./global.js');
        await flush();

        // The real file's constants are what the services are handed.
        expect(typeof GOOGLE_ANALYTICS_ID).toBe('string');
        expect(typeof SENTRY_DSN).toBe('string');
        expect(typeof SENTRY_SDK_URL).toBe('string');
    });

    describe('header and theme toggle', () => {
        it('localises the header chrome and reveals the theme toggle (en-GB in jsdom)', async () => {
            await importGlobal();

            expect(document.getElementById('header-job-title').textContent).toBe(EN_GB.header.jobTitle);
            const toggle = document.getElementById('theme-toggle');
            expect(toggle.hidden).toBe(false);
            expect(toggle.textContent).toContain('Auto');
            expect(toggle.getAttribute('title')).toBe(EN_GB.theme.switchTitle);
            expect(toggle.getAttribute('aria-label')).toContain('Colour theme');
        });
    });

    describe('on window load', () => {
        it('prints the console banner from the configured lines', async () => {
            await importGlobal();

            await fireLoad();

            expect(consoleLog).toHaveBeenCalledWith('%cline one', 'color: purple;');
            expect(consoleLog).toHaveBeenCalledWith('%cline two', 'color: green;');
        });

        it('opens the localised dialog when consent is undecided, enabling nothing', async () => {
            await importGlobal();

            await fireLoad();

            expect(document.getElementById('cookies').hidden).toBe(false);
            expect(document.getElementById('cookies-backdrop').hidden).toBe(false);
            expect(document.getElementById('cookies-accept').textContent).toBe(EN_GB.cookies.accept);
            expect(window.dataLayer).toBeUndefined();
        });

        it('enables analytics straight away when consent was already granted', async () => {
            document.cookie = 'cookie-consent=1; Path=/; Secure';
            await importGlobal();

            await fireLoad();

            expect(document.getElementById('cookies').hidden).toBe(true);
            expect(window.dataLayer).toHaveLength(2);
        });

        it('does nothing when consent was previously declined', async () => {
            document.cookie = 'cookie-consent=0; Path=/; Secure';
            await importGlobal();

            await fireLoad();

            expect(document.getElementById('cookies').hidden).toBe(true);
            expect(window.dataLayer).toBeUndefined();
        });
    });

    describe('answering the dialog', () => {
        it('accepting stores consent, closes the dialog and loads the configured tag', async () => {
            await importGlobal();
            await fireLoad();

            document.getElementById('cookies-accept').dispatchEvent(new Event('click'));

            expect(document.cookie).toContain('cookie-consent=1');
            expect(document.getElementById('cookies').hidden).toBe(true);
            expect(document.getElementById('gtag-js').src).toContain('id=G-CONFIGURED');
            expect(Array.from(window.dataLayer[1])).toEqual(['config', 'G-CONFIGURED']);
        });

        it('hands the configured DSN and SDK location to Sentry', async () => {
            const sentry = { init: vi.fn(), getClient: vi.fn(), replayIntegration: vi.fn() };
            window.Sentry = sentry;
            await importGlobal();
            await fireLoad();

            document.getElementById('cookies-accept').dispatchEvent(new Event('click'));
            await flush();

            expect(sentry.init.mock.calls[0][0].dsn).toBe('https://configured@example.ingest.sentry.io/1');
        });

        it('requests the configured SDK file when Sentry is not yet on the page', async () => {
            await importGlobal();
            await fireLoad();

            document.getElementById('cookies-accept').dispatchEvent(new Event('click'));
            await flush();

            expect(document.head.querySelector('script[src="/assets/js/vendor/sentry.min.js"]')).not.toBeNull();
            document.head.querySelector('script[src="/assets/js/vendor/sentry.min.js"]').remove();
        });

        it('declining stores the refusal and fetches nothing', async () => {
            await importGlobal();
            await fireLoad();

            document.getElementById('cookies-decline').dispatchEvent(new Event('click'));
            await flush();

            expect(document.cookie).toContain('cookie-consent=0');
            expect(document.getElementById('cookies').hidden).toBe(true);
            expect(document.getElementById('gtag-js')).toBeNull();
            expect(window.dataLayer).toBeUndefined();
        });

        it('treats Escape as declining', async () => {
            await importGlobal();
            await fireLoad();

            document.getElementById('cookies').dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

            expect(document.cookie).toContain('cookie-consent=0');
        });

        it('skips telemetry on a local development host even with consent', async () => {
            setHostname('localhost');
            await importGlobal();
            await fireLoad();

            document.getElementById('cookies-accept').dispatchEvent(new Event('click'));

            expect(window.dataLayer).toBeUndefined();
            expect(document.getElementById('gtag-js')).toBeNull();
        });
    });

    // Both integrations are configuration-driven: clearing google_analytics_id
    // or sentry_dsn in _config.yml has to switch them off, rather than fetch a
    // bundle that then does nothing.
    describe('with telemetry switched off in config', () => {
        it('loads no analytics tag when no measurement id is configured', async () => {
            await importGlobal({ ...CONFIG, GOOGLE_ANALYTICS_ID: '' });
            await fireLoad();

            document.getElementById('cookies-accept').dispatchEvent(new Event('click'));

            expect(document.getElementById('gtag-js')).toBeNull();
        });

        it('neither fetches nor initialises Sentry when no DSN is configured', async () => {
            const sentry = { init: vi.fn(), getClient: vi.fn().mockReturnValue(undefined) };
            window.Sentry = sentry;
            await importGlobal({ ...CONFIG, SENTRY_DSN: '' });
            await fireLoad();

            document.getElementById('cookies-accept').dispatchEvent(new Event('click'));
            await flush();

            expect(sentry.init).not.toHaveBeenCalled();
        });
    });
});
