import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { SENTRY_DSN } from '/config/global.const.js';

const { needsConsent, getConsent, setConsent, deleteAll } = vi.hoisted(() => ({
    needsConsent: vi.fn(),
    getConsent: vi.fn(),
    setConsent: vi.fn(),
    deleteAll: vi.fn(),
}));

vi.mock('./Cookie.js', () => ({
    // get/set are used by Locale.js (locale cookie); stubbed so global.js's
    // import-time locale resolution finds no cookie and writes none.
    default: { needsConsent, getConsent, setConsent, deleteAll, get: () => null, set: () => {} },
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// setCookies() (Google Analytics + Sentry) skips local dev hosts, but jsdom
// serves from localhost. Default the suite to a production-like hostname so the
// consented telemetry paths actually run; the local-dev-host tests override via
// setHostname. jsdom forbids redefining location.hostname alone, so swap the
// whole window.location object (restored after each test).
let originalLocation;
function setHostname(hostname) {
    Object.defineProperty(window, 'location', {
        configurable: true, writable: true, value: { hostname },
    });
}

let cookiesDiv;
let acceptButton;
let declineButton;

describe('global.js', () => {
    beforeAll(async () => {
        document.body.innerHTML = `
            <div id="cookies"></div>
            <button id="cookies-accept"></button>
            <button id="cookies-decline"></button>
            <button id="theme-toggle" title="Switch colour theme" hidden></button>
            <a class="header-home-link" title="Christian Brown homepage"></a>
            <div class="header-avatar"><img src="/avatar.jpg" alt="Christian Brown's avatar"></div>
            <img class="location-icon" alt="Location icon">
            <strong id="header-job-title">Engineering Manager</strong>
            <span id="header-location" data-location="London, UK">London, UK</span>`;
        cookiesDiv = document.getElementById('cookies');
        acceptButton = document.getElementById('cookies-accept');
        declineButton = document.getElementById('cookies-decline');
        vi.spyOn(console, 'log').mockImplementation(() => {});
        originalLocation = window.location;
        // DOM is in place, so the module's top-level lookups succeed.
        await import('./global.js');
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        needsConsent.mockReset();
        getConsent.mockReset();
        setConsent.mockReset();
        deleteAll.mockReset();
        cookiesDiv.style.display = '';
        window.dataLayer = undefined;
        setHostname('christianbrown.uk'); // production by default; telemetry runs
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            configurable: true, writable: true, value: originalLocation,
        });
    });

    describe('shared header + theme localisation', () => {
        it('localises the header chrome and theme toggle on import (en-GB in jsdom)', () => {
            expect(document.getElementById('header-job-title').textContent).toBe('Engineering Manager');
            expect(document.getElementById('header-location').textContent).toBe('London, UK');
            expect(document.documentElement.lang).toBe('en-GB');
            // Hover/accessibility text.
            expect(document.querySelector('.header-home-link').getAttribute('title')).toBe('Christian Brown homepage');
            expect(document.querySelector('.header-avatar img').getAttribute('alt')).toBe("Christian Brown's avatar");
            expect(document.querySelector('.location-icon').getAttribute('alt')).toBe('Location icon');
            // Theme toggle: revealed, localised label and title.
            const toggle = document.getElementById('theme-toggle');
            expect(toggle.hidden).toBe(false);
            expect(toggle.textContent).toContain('Auto');
            expect(toggle.getAttribute('title')).toBe('Switch colour theme');
            expect(toggle.getAttribute('aria-label')).toContain('Colour theme');
        });
    });

    describe('cookie banner buttons', () => {
        it('accepting hides the banner, stores consent and enables analytics', () => {
            acceptButton.dispatchEvent(new Event('click'));

            expect(cookiesDiv.style.display).toBe('none');
            expect(setConsent).toHaveBeenCalledWith(true);
            expect(window.dataLayer).toHaveLength(2); // gtag('js', ...) + gtag('config', ...)
        });

        it('declining hides the banner, deletes cookies and records the refusal', () => {
            declineButton.dispatchEvent(new Event('click'));

            expect(cookiesDiv.style.display).toBe('none');
            expect(deleteAll).toHaveBeenCalledTimes(1);
            expect(setConsent).toHaveBeenCalledWith(false);
            expect(window.dataLayer).toBeUndefined(); // declining must not enable analytics
        });
    });

    describe('on window load', () => {
        it('shows the banner when consent is needed but undecided', async () => {
            needsConsent.mockResolvedValue(true);
            getConsent.mockReturnValue(null);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(cookiesDiv.style.display).toBe('flex');
            expect(window.dataLayer).toBeUndefined();
        });

        it('enables analytics when consent is needed and already granted', async () => {
            needsConsent.mockResolvedValue(true);
            getConsent.mockReturnValue(true);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(cookiesDiv.style.display).not.toBe('flex');
            expect(window.dataLayer).toHaveLength(2);
        });

        it('does nothing when consent is needed and previously declined', async () => {
            needsConsent.mockResolvedValue(true);
            getConsent.mockReturnValue(false);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(cookiesDiv.style.display).not.toBe('flex');
            expect(window.dataLayer).toBeUndefined();
        });

        it('enables analytics directly when consent is not required', async () => {
            needsConsent.mockResolvedValue(false);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(getConsent).not.toHaveBeenCalled();
            expect(window.dataLayer).toHaveLength(2);
        });
    });

    // Sentry init is gated behind consent (called from setCookies), so it fires
    // on exactly the same paths as analytics. The vendored SDK sets window.Sentry
    // in the real <head>; jsdom has none, so each test stubs it as needed. The
    // suite's default hostname is production (see top-level beforeEach).
    describe('Sentry error reporting', () => {
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
        });

        it('initialises Sentry with the replay integration once consent is accepted', () => {
            window.Sentry = sentry;

            acceptButton.dispatchEvent(new Event('click'));

            expect(sentry.replayIntegration).toHaveBeenCalledTimes(1);
            expect(sentry.init).toHaveBeenCalledTimes(1);
            const config = sentry.init.mock.calls[0][0];
            expect(config.dsn).toBe(SENTRY_DSN);
            expect(config.integrations).toContain(replayIntegration);
            expect(config.replaysSessionSampleRate).toBe(0);
            expect(config.replaysOnErrorSampleRate).toBe(1.0);
        });

        it('initialises Sentry on the consent-granted window load path', async () => {
            needsConsent.mockResolvedValue(true);
            getConsent.mockReturnValue(true);
            window.Sentry = sentry;

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(sentry.init).toHaveBeenCalledTimes(1);
        });

        it('does not re-initialise when a Sentry client already exists', () => {
            sentry.getClient.mockReturnValue({});
            window.Sentry = sentry;

            acceptButton.dispatchEvent(new Event('click'));

            expect(sentry.init).not.toHaveBeenCalled();
        });

        it('is a no-op (no throw) when the Sentry SDK failed to load', () => {
            // window.Sentry is absent (deleted in afterEach); accepting cookies
            // must still succeed without a reporter present.
            expect(() => acceptButton.dispatchEvent(new Event('click'))).not.toThrow();
        });
    });

    // Neither Google Analytics nor Sentry may fire on a local `jekyll serve`
    // session — even with consent — whichever loopback/localhost form the
    // address takes. setCookies() short-circuits before both.
    describe('local dev host guard', () => {
        let sentry;

        beforeEach(() => {
            sentry = { init: vi.fn(), getClient: vi.fn().mockReturnValue(undefined), replayIntegration: vi.fn() };
            window.Sentry = sentry;
        });

        afterEach(() => {
            delete window.Sentry;
        });

        it.each([
            'localhost',
            'app.localhost',
            '0.0.0.0',
            '[::1]',       // location.hostname brackets IPv6 loopback
            '127.0.0.1',
            '127.255.255.254',
        ])('skips analytics and Sentry on the local dev host %s', (hostname) => {
            setHostname(hostname);

            acceptButton.dispatchEvent(new Event('click'));

            expect(window.dataLayer).toBeUndefined(); // no GA
            expect(sentry.init).not.toHaveBeenCalled(); // no Sentry
        });
    });
});
