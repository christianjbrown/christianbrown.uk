'use strict';

import Cookie from './Cookie.js';
import Theme from './Theme.js';
import { applyLocale, setText, setAttr, setAttrAll } from './Locale.js';
import { catalogueFor } from './i18n/catalogue.js';
import { formatLocations } from './i18n/locations.js';
import {
    COOKIES_ACCEPT_BUTTON_ID,
    COOKIES_DECLINE_BUTTON_ID,
    COOKIES_DIV_ID,
    DEV_CONSOLE_LINE_1,
    DEV_CONSOLE_LINE_1_STYLE,
    DEV_CONSOLE_LINE_2,
    DEV_CONSOLE_LINE_2_STYLE,
    GOOGLE_ANALYTICS_ID,
    SENTRY_DSN,
    SENTRY_SDK_URL,
    THEME_TOGGLE_ID
} from '/config/global.const.js';

const cookiesDivDom = document.getElementById(COOKIES_DIV_ID);
const cookiesAcceptButtonDom = document.getElementById(COOKIES_ACCEPT_BUTTON_ID);
const cookiesDeclineButtonDom = document.getElementById(COOKIES_DECLINE_BUTTON_ID);

// Resolve the locale once for the whole page and localise the shared header
// chrome — the job title, location, and the hover/accessibility text (title and
// alt) the build renders in English. Runs at module eval (the
// <script type="module"> is deferred, so the DOM is parsed) to keep the swap
// ahead of paint; a no-op for en-GB and for elements a given page lacks.
const catalogue = catalogueFor(applyLocale());
const header = catalogue.header;
setText('#header-job-title', header.jobTitle);
const headerLocation = document.getElementById('header-location');
if (headerLocation) {
    headerLocation.textContent = formatLocations(catalogue, headerLocation.getAttribute('data-location'));
}
setAttrAll('.header-home-link', 'title', header.homeLinkTitle);
setAttr('.header-avatar img', 'alt', header.avatarAlt);
setAttr('.location-icon', 'alt', header.locationIconAlt);
setAttr('#cv-home-temp', 'title', header.smartHomeLinkTitle);
setAttr('#' + THEME_TOGGLE_ID, 'title', catalogue.theme.switchTitle);

// Header colour-theme toggle (Auto → Light → Dark). Present on every page; the
// saved choice was already applied pre-paint by theme-init.js in the <head>.
// Pass the locale's toggle strings so its label and accessible name localise.
Theme.bindToggle(document.getElementById(THEME_TOGGLE_ID), catalogue.theme);

cookiesAcceptButtonDom.addEventListener('click',
    () => {
        cookiesDivDom.style.display = 'none';
        Cookie.setConsent(true);
        setCookies();
    }
);
cookiesDeclineButtonDom.addEventListener('click',
    () => {
        cookiesDivDom.style.display = 'none';
        Cookie.deleteAll();
        Cookie.setConsent(false);
    }
);

window.addEventListener('load',
    async() => {
        console.log('%c'+DEV_CONSOLE_LINE_1, DEV_CONSOLE_LINE_1_STYLE);
        console.log('%c'+DEV_CONSOLE_LINE_2, DEV_CONSOLE_LINE_2_STYLE);

        const needsConsent = await Cookie.needsConsent();
        if (needsConsent) {
            const consent= Cookie.getConsent();
            if (consent === null) {
                cookiesDivDom.style.display = 'flex';
            } else if (consent === true) {
                setCookies();
            }
        } else {
            setCookies();
        }
    }
);

// Turn on the consented telemetry: Google Analytics and Sentry. Skipped
// entirely on local dev hosts so a `jekyll serve` session never pollutes the
// production Analytics property or Sentry project — even with consent granted.
function setCookies() {
    if (isLocalhost()) {
        return;
    }
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GOOGLE_ANALYTICS_ID);
    loadGoogleAnalytics();
    initSentry();
}

export const GTAG_SCRIPT_ID = 'gtag-js';

// Fetch gtag.js, which drains whatever setCookies already queued on dataLayer.
// Loaded here rather than from a <script> in the layout so nothing is requested
// from Google until the visitor has actually consented — the tag sets no cookies
// before `config`, but the request alone would still hand Google their IP
// address on a page they hadn't agreed to be measured on. A classic script, not
// a module: gtag.js reads document.currentScript, which is null in a module.
export function loadGoogleAnalytics() {
    if (!GOOGLE_ANALYTICS_ID) {
        return;
    }
    if (document.getElementById(GTAG_SCRIPT_ID)) {
        return;
    }
    const script = document.createElement('script');
    script.id = GTAG_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ANALYTICS_ID)}`;
    document.head.appendChild(script);
}

// True for local development hosts — the localhost variants and the IPv4/IPv6
// loopback addresses — so local dev telemetry never reaches production.
export function isLocalhost() {
    const host = window.location.hostname;
    return host === 'localhost'
        || host.endsWith('.localhost')
        || host === '0.0.0.0'
        || host === '[::1]' // location.hostname brackets IPv6 loopback (never bare ::1)
        || /^127(?:\.\d{1,3}){3}$/.test(host);
}

// Fetch the vendored Sentry SDK, resolving true once window.Sentry is defined
// and false if the script could not be loaded. Injected rather than sitting in
// the <head> so the bundle is only ever downloaded by a visitor who has
// consented: it is ~70 KB gzipped, and previously every visitor paid for it
// including those who declined. No memoisation, because setCookies runs at most
// once per page view (the banner is hidden as soon as it is answered).
export function loadSentrySdk() {
    if (window.Sentry) {
        return Promise.resolve(true);
    }
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = SENTRY_SDK_URL;
        script.addEventListener('load', () => resolve(true));
        script.addEventListener('error', () => resolve(false));
        document.head.appendChild(script);
    });
}

// Bring up Sentry error + session-replay reporting. Called from setCookies (so
// it's gated behind both cookie consent and the local-dev-host check), which
// does not await it: reporting arrives when it arrives, and nothing downstream
// depends on it. Guards against double-initialisation and against the SDK not
// being there afterwards (blocked load, or jsdom in tests) — telemetry must
// never break the page. Replay is recorded only when an error occurs
// (replaysSessionSampleRate 0), with the SDK's default text/input masking on.
export async function initSentry() {
    if (!SENTRY_DSN) {
        return;
    }
    if (window.Sentry) {
        if (window.Sentry.getClient()) {
            return;
        }
    }
    const loaded = await loadSentrySdk();
    if (!loaded) {
        return;
    }
    if (!window.Sentry) {
        return;
    }
    window.Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [window.Sentry.replayIntegration()],
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
        environment: 'production',
    });
}
