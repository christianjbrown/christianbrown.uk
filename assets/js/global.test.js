import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { GOOGLE_ANALYTICS_ID, SENTRY_DSN, SENTRY_SDK_URL } from '/config/global.const.js';
import EN_GB from './i18n/messages.en-GB.js';
import DE_DE from './i18n/messages.de-DE.js';

const { getConsent, setConsent, deleteAll } = vi.hoisted(() => ({
    getConsent: vi.fn(),
    setConsent: vi.fn(),
    deleteAll: vi.fn(),
}));

vi.mock('./Cookie.js', () => ({
    // get/set are used by Locale.js (locale cookie); stubbed so global.js's
    // import-time locale resolution finds no cookie and writes none.
    default: { getConsent, setConsent, deleteAll, get: () => null, set: () => {} },
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
let cookiesBackdrop;
let acceptButton;
let declineButton;
let globalModule;

describe('global.js', () => {
    beforeAll(async () => {
        document.body.innerHTML = `
            <div id="cookies-backdrop" hidden></div>
            <div id="cookies" role="dialog" aria-modal="true" hidden>
                <p id="cookies-text">Are you okay if this site uses cookies to <a id="cookies-link-analytics" href="https://support.google.com/analytics/answer/11397207">measure traffic</a> and <a id="cookies-link-sentry" href="https://sentry.io/">catch errors</a>?</p>
                <button id="cookies-decline">\u{1F6AB} No</button>
                <button id="cookies-accept">\u{1F36A} Yes</button>
            </div>
            <button id="theme-toggle" title="Switch colour theme" hidden></button>
            <a class="header-home-link" title="Christian Brown homepage"></a>
            <div class="header-avatar"><img src="/avatar.jpg" alt="Christian Brown's avatar"></div>
            <img class="location-icon" alt="Location icon">
            <strong id="header-job-title">Engineering Manager</strong>
            <span id="header-location" data-location="London, UK">London, UK</span>`;
        cookiesDiv = document.getElementById('cookies');
        cookiesBackdrop = document.getElementById('cookies-backdrop');
        acceptButton = document.getElementById('cookies-accept');
        declineButton = document.getElementById('cookies-decline');
        vi.spyOn(console, 'log').mockImplementation(() => {});
        originalLocation = window.location;
        // DOM is in place, so the module's top-level lookups succeed.
        globalModule = await import('./global.js');
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        getConsent.mockReset();
        setConsent.mockReset();
        deleteAll.mockReset();
        cookiesDiv.hidden = true;
        cookiesBackdrop.hidden = true;
        document.getElementById(globalModule.GTAG_SCRIPT_ID)?.remove();
        document.querySelector(`script[src="${SENTRY_SDK_URL}"]`)?.remove();
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

    describe('cookie dialog buttons', () => {
        it('accepting closes the dialog, stores consent and enables analytics', () => {
            globalModule.openCookieDialog();
            acceptButton.dispatchEvent(new Event('click'));

            expect(cookiesDiv.hidden).toBe(true);
            expect(cookiesBackdrop.hidden).toBe(true);
            expect(setConsent).toHaveBeenCalledWith(true);
            expect(window.dataLayer).toHaveLength(2); // gtag('js', ...) + gtag('config', ...)
        });

        it('declining closes the dialog, deletes cookies and records the refusal', () => {
            globalModule.openCookieDialog();
            declineButton.dispatchEvent(new Event('click'));

            expect(cookiesDiv.hidden).toBe(true);
            expect(cookiesBackdrop.hidden).toBe(true);
            expect(deleteAll).toHaveBeenCalledTimes(1);
            expect(setConsent).toHaveBeenCalledWith(false);
            expect(window.dataLayer).toBeUndefined(); // declining must not enable analytics
        });
    });

    describe('cookie dialog focus and keyboard handling', () => {
        it('opens onto decline and returns focus to the opener on close', () => {
            const opener = document.getElementById('theme-toggle');
            opener.hidden = false;
            opener.focus();

            globalModule.openCookieDialog();
            expect(document.activeElement).toBe(declineButton);

            globalModule.closeCookieDialog();
            expect(document.activeElement).toBe(opener);
        });

        it('treats Escape as declining', () => {
            globalModule.openCookieDialog();

            cookiesDiv.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

            expect(cookiesDiv.hidden).toBe(true);
            expect(setConsent).toHaveBeenCalledWith(false);
        });

        it('wraps Tab from the last control back to the first', () => {
            globalModule.openCookieDialog();
            acceptButton.focus(); // the last focusable in the dialog

            cookiesDiv.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));

            expect(document.activeElement).toBe(cookiesDiv.querySelector('a[href]'));
        });

        it('wraps Shift+Tab from the first control back to the last', () => {
            globalModule.openCookieDialog();
            cookiesDiv.querySelector('a[href]').focus();

            cookiesDiv.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));

            expect(document.activeElement).toBe(acceptButton);
        });
    });

    describe('cookie dialog localisation', () => {
        const textDom = () => document.getElementById('cookies-text');
        const analyticsLink = () => document.getElementById('cookies-link-analytics');
        const sentryLink = () => document.getElementById('cookies-link-sentry');

        it('rebuilds the question, the link labels and the buttons from the catalogue', () => {
            globalModule.localiseCookieDialog(DE_DE);

            expect(textDom().textContent).toBe(
                'Ist es in Ordnung, wenn diese Website Cookies verwendet, um Zugriffe zu messen und Fehler zu erfassen?',
            );
            expect(analyticsLink().textContent).toBe('Zugriffe zu messen');
            expect(sentryLink().textContent).toBe('Fehler zu erfassen');
            expect(declineButton.textContent).toBe(DE_DE.cookies.decline);
            expect(acceptButton.textContent).toBe(DE_DE.cookies.accept);
        });

        // The whole point of assembling from nodes rather than innerHTML: the
        // anchors are moved, not recreated, so nothing a translation says can
        // change where they point or strip their rel.
        it('keeps the original anchors, with their hrefs intact', () => {
            const before = [analyticsLink(), sentryLink()];

            globalModule.localiseCookieDialog(DE_DE);

            expect(analyticsLink()).toBe(before[0]);
            expect(sentryLink()).toBe(before[1]);
            expect(analyticsLink().getAttribute('href')).toBe('https://support.google.com/analytics/answer/11397207');
            expect(sentryLink().getAttribute('href')).toBe('https://sentry.io/');
        });

        it('treats a catalogue string as text, never as markup', () => {
            globalModule.localiseCookieDialog({
                ...EN_GB,
                cookies: { ...EN_GB.cookies, question: '<img src=x onerror=alert(1)> {traffic} {errors}' },
            });

            expect(textDom().querySelector('img')).toBeNull();
            expect(textDom().textContent).toContain('<img src=x onerror=alert(1)>');
        });

        // A language that puts the clauses the other way round.
        it('places the links wherever the template puts the holes', () => {
            globalModule.localiseCookieDialog({
                ...EN_GB,
                cookies: { ...EN_GB.cookies, question: 'A {errors} B {traffic} C' },
            });

            expect(textDom().textContent).toBe('A catch errors B measure traffic C');
            expect(textDom().firstChild.textContent).toBe('A ');
        });

        it('leaves the dialog alone when the catalogue has no cookie strings', () => {
            const before = textDom().textContent;

            globalModule.localiseCookieDialog({ ...EN_GB, cookies: undefined });

            expect(textDom().textContent).toBe(before);
        });

        it('localises the dialog before opening it on load', async () => {
            getConsent.mockReturnValue(null);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(cookiesDiv.hidden).toBe(false);
            // jsdom resolves to en-GB, so the English stands.
            expect(acceptButton.textContent).toBe(EN_GB.cookies.accept);
        });
    });

    describe('on window load', () => {
        // The dialog is shown to every undecided visitor now, rather than only
        // to those whose browser timezone mapped to an EU/UK country.
        it('opens the dialog when consent is undecided', async () => {
            getConsent.mockReturnValue(null);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(cookiesDiv.hidden).toBe(false);
            expect(cookiesBackdrop.hidden).toBe(false);
            expect(window.dataLayer).toBeUndefined();
        });

        it('enables analytics when consent was already granted', async () => {
            getConsent.mockReturnValue(true);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(cookiesDiv.hidden).toBe(true);
            expect(window.dataLayer).toHaveLength(2);
        });

        it('does nothing when consent was previously declined', async () => {
            getConsent.mockReturnValue(false);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(cookiesDiv.hidden).toBe(true);
            expect(window.dataLayer).toBeUndefined();
        });
    });

    // gtag.js is injected on consent rather than sitting in the layout, so a
// visitor who declines never sends Google a request at all.
describe('Google Analytics tag', () => {
    const gtagScript = () => document.getElementById(globalModule.GTAG_SCRIPT_ID);

    it('fetches no tag before the visitor has answered the banner', () => {
        expect(gtagScript()).toBeNull();
    });

    it('fetches no tag when the visitor declines', () => {
        declineButton.dispatchEvent(new Event('click'));

        expect(gtagScript()).toBeNull();
    });

    it('injects the tag once consent is accepted', () => {
        acceptButton.dispatchEvent(new Event('click'));

        const script = gtagScript();
        expect(script).not.toBeNull();
        expect(script.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ANALYTICS_ID)}`);
        expect(script.async).toBe(true);
    });

    // gtag.js reads document.currentScript, which is null in a module, so the
    // injected element must stay a classic script.
    it('injects a classic script, not a module', () => {
        acceptButton.dispatchEvent(new Event('click'));

        expect(gtagScript().type).toBe('');
    });

    it('queues the config command on dataLayer before the tag arrives', () => {
        acceptButton.dispatchEvent(new Event('click'));

        const commands = window.dataLayer.map((args) => Array.from(args));
        expect(commands).toContainEqual(['config', GOOGLE_ANALYTICS_ID]);
    });

    it('does not inject the tag twice', () => {
        globalModule.loadGoogleAnalytics();
        globalModule.loadGoogleAnalytics();

        expect(document.querySelectorAll(`#${globalModule.GTAG_SCRIPT_ID}`)).toHaveLength(1);
    });
});

// Sentry init is gated behind consent (called from setCookies), so it fires
// on exactly the same paths as analytics. The SDK is no longer in the <head>:
// initSentry injects a <script> and waits for it, so these tests either stub
// window.Sentry up front (the loader then short-circuits) or drive the injected
// element's load/error events by hand — jsdom does not fetch it. The suite's
// default hostname is production (see top-level beforeEach).
describe('Sentry error reporting', () => {
    let sentry;
    let replayIntegration;

    const injectedScript = () => document.head.querySelector(`script[src="${SENTRY_SDK_URL}"]`);

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

    it('initialises Sentry with the replay integration once consent is accepted', async () => {
        window.Sentry = sentry;

        acceptButton.dispatchEvent(new Event('click'));
        await flush();

        expect(sentry.replayIntegration).toHaveBeenCalledTimes(1);
        expect(sentry.init).toHaveBeenCalledTimes(1);
        const config = sentry.init.mock.calls[0][0];
        expect(config.dsn).toBe(SENTRY_DSN);
        expect(config.integrations).toContain(replayIntegration);
        expect(config.replaysSessionSampleRate).toBe(0);
        expect(config.replaysOnErrorSampleRate).toBe(1.0);
    });

    it('initialises Sentry on the consent-granted window load path', async () => {
        getConsent.mockReturnValue(true);
        window.Sentry = sentry;

        window.dispatchEvent(new Event('load'));
        await flush();

        expect(sentry.init).toHaveBeenCalledTimes(1);
    });

    it('does not re-initialise when a Sentry client already exists', async () => {
        sentry.getClient.mockReturnValue({});
        window.Sentry = sentry;

        acceptButton.dispatchEvent(new Event('click'));
        await flush();

        expect(sentry.init).not.toHaveBeenCalled();
    });

    it('does not fetch the SDK again when it is already on the page', async () => {
        window.Sentry = sentry;

        acceptButton.dispatchEvent(new Event('click'));
        await flush();

        expect(injectedScript()).toBeNull();
    });

    // The point of the lazy load: nothing is requested until consent is given,
    // so a visitor who declines never downloads the bundle at all.
    it('requests the SDK only once consent is accepted', async () => {
        expect(injectedScript()).toBeNull();

        declineButton.dispatchEvent(new Event('click'));
        await flush();

        expect(injectedScript()).toBeNull();

        acceptButton.dispatchEvent(new Event('click'));
        await flush();

        expect(injectedScript()).not.toBeNull();
    });

    it('initialises Sentry once the injected SDK has loaded', async () => {
        acceptButton.dispatchEvent(new Event('click'));
        await flush();

        const script = injectedScript();
        expect(script).not.toBeNull();
        expect(sentry.init).not.toHaveBeenCalled();

        window.Sentry = sentry;
        script.dispatchEvent(new Event('load'));
        await flush();

        expect(sentry.init).toHaveBeenCalledTimes(1);
    });

    it('is a no-op (no throw) when the SDK script fails to load', async () => {
        acceptButton.dispatchEvent(new Event('click'));
        await flush();

        injectedScript().dispatchEvent(new Event('error'));
        await flush();

        expect(sentry.init).not.toHaveBeenCalled();
    });

    it('is a no-op (no throw) when the script loads without defining window.Sentry', async () => {
        acceptButton.dispatchEvent(new Event('click'));
        await flush();

        // Loaded, but window.Sentry absent: a stubbed or truncated bundle.
        injectedScript().dispatchEvent(new Event('load'));
        await flush();

        expect(sentry.init).not.toHaveBeenCalled();
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
            expect(document.getElementById(globalModule.GTAG_SCRIPT_ID)).toBeNull(); // no tag fetched
            expect(sentry.init).not.toHaveBeenCalled(); // no Sentry
        });
    });
});

// Both integrations are configuration-driven: clearing google_analytics_id or
// sentry_dsn in _config.yml has to actually switch them off, rather than fetch
// a bundle that then does nothing. Loaded through a fresh module registry so
// the build-time constants can be forced empty. Last in the file: the re-import
// re-runs global.js's top-level DOM work and re-binds its button listeners.
describe('global.js with telemetry switched off in config', () => {
    afterEach(() => {
        delete window.Sentry;
        document.getElementById('gtag-js')?.remove();
        vi.doUnmock('/config/global.const.js');
        vi.resetModules();
    });

    async function importWith({ GOOGLE_ANALYTICS_ID = 'G-TEST', SENTRY_DSN = '' } = {}) {
        vi.resetModules();
        vi.doMock('/config/global.const.js', () => ({
            COOKIES_ACCEPT_BUTTON_ID: 'cookies-accept',
            COOKIES_BACKDROP_ID: 'cookies-backdrop',
            COOKIES_DECLINE_BUTTON_ID: 'cookies-decline',
            COOKIES_DIV_ID: 'cookies',
            COOKIES_LINK_ANALYTICS_ID: 'cookies-link-analytics',
            COOKIES_LINK_SENTRY_ID: 'cookies-link-sentry',
            COOKIES_TEXT_ID: 'cookies-text',
            DEV_CONSOLE_LINE_1: '',
            DEV_CONSOLE_LINE_1_STYLE: '',
            DEV_CONSOLE_LINE_2: '',
            DEV_CONSOLE_LINE_2_STYLE: '',
            GOOGLE_ANALYTICS_ID,
            SENTRY_DSN,
            SENTRY_SDK_URL: '/assets/js/vendor/sentry.min.js',
            THEME_TOGGLE_ID: 'theme-toggle',
        }));

        return import('./global.js');
    }

    it('loads no analytics tag when no measurement id is configured', async () => {
        const { loadGoogleAnalytics, GTAG_SCRIPT_ID } = await importWith({ GOOGLE_ANALYTICS_ID: '' });
        loadGoogleAnalytics();

        expect(document.getElementById(GTAG_SCRIPT_ID)).toBeNull();
    });

    it('neither fetches nor initialises Sentry when no DSN is configured', async () => {
        const sentry = { init: vi.fn(), getClient: vi.fn().mockReturnValue(undefined) };
        window.Sentry = sentry;

        const { initSentry } = await importWith();
        await initSentry();

        expect(sentry.init).not.toHaveBeenCalled();
    });
});
