'use strict';

import Cookie from './Cookie.js';
import Theme from './Theme.js';
import { applyLocale, setText, setAttr, setAttrAll } from './Locale.js';
import { catalogueFor } from './i18n/catalogue.js';
import { formatLocations } from './i18n/locations.js';
import {
    COOKIES_ACCEPT_BUTTON_ID,
    COOKIES_BACKDROP_ID,
    COOKIES_DECLINE_BUTTON_ID,
    COOKIES_DIV_ID,
    COOKIES_LINK_ANALYTICS_ID,
    COOKIES_LINK_SENTRY_ID,
    COOKIES_TEXT_ID,
    DEV_CONSOLE_LINE_1,
    DEV_CONSOLE_LINE_1_STYLE,
    DEV_CONSOLE_LINE_2,
    DEV_CONSOLE_LINE_2_STYLE,
    GOOGLE_ANALYTICS_ID,
    SENTRY_DSN,
    SENTRY_SDK_URL,
    THEME_TOGGLE_ID
} from '/config/global.const.js';

// Everything in the dialog that can take focus. Both buttons are always
// present, so there is no case where the trap has nothing to cycle between.
const FOCUSABLE_SELECTOR = 'a[href], button';

const cookiesDivDom = document.getElementById(COOKIES_DIV_ID);
const cookiesBackdropDom = document.getElementById(COOKIES_BACKDROP_ID);
const cookiesAcceptButtonDom = document.getElementById(COOKIES_ACCEPT_BUTTON_ID);
const cookiesDeclineButtonDom = document.getElementById(COOKIES_DECLINE_BUTTON_ID);

// Started here, at module evaluation, and awaited by the two consumers below.
// Resolving the locale is synchronous; only fetching a non-default catalogue is
// not, and en-GB needs no fetch at all. Kicking it off once and sharing the
// promise means the dialog and the header chrome cannot disagree about the
// locale, and neither has to re-resolve it.
const cataloguePromise = catalogueFor(applyLocale());

// Where focus was before the dialog took it, so it can be handed back rather
// than dropped to the top of the document when the dialog closes.
let focusedBeforeDialog = null;

cookiesAcceptButtonDom.addEventListener('click', () => acceptCookies());
cookiesDeclineButtonDom.addEventListener('click', () => declineCookies());
cookiesDivDom.addEventListener('keydown', (event) => handleDialogKey(event));

// The dialog is shown to everyone who has not answered it, rather than only to
// visitors whose browser timezone mapped to a country in an EU/UK list. That
// guess was wrong for anyone travelling or on a VPN, and being wrong meant
// measuring them without asking. It also cost a 47KB timezones.json fetch on
// every single page view to make.
window.addEventListener('load', async () => {
    console.log('%c'+DEV_CONSOLE_LINE_1, DEV_CONSOLE_LINE_1_STYLE);
    console.log('%c'+DEV_CONSOLE_LINE_2, DEV_CONSOLE_LINE_2_STYLE);

    const consent = Cookie.getConsent();
    if (consent === null) {
        // Localise before showing it rather than after: a consent question that
        // appears in English and then rewrites itself into the reader's language
        // is worse than one that appears a moment later already in it.
        localiseCookieDialog(await cataloguePromise);
        openCookieDialog();

        return;
    }
    if (consent === true) {
        setCookies();
    }
});

// A promise callback rather than a top-level await: an await here would suspend
// the rest of the module, and everything above it — the dialog's listeners and
// the load handler — has to be registered before the events it is waiting for
// can fire.
void cataloguePromise.then(localiseChrome);

/**
 * Localises the shared header chrome: the job title, location, and the
 * hover/accessibility text (title and alt) the build renders in English. A no-op
 * for en-GB and for elements a given page lacks.
 *
 * @param {Object} catalogue
 */
export function localiseChrome(catalogue) {
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

    // Header colour-theme toggle (Auto → Light → Dark). Present on every page;
    // the saved choice was already applied pre-paint by theme-init.js in the
    // <head>. Pass the locale's toggle strings so its label and accessible name
    // localise.
    Theme.bindToggle(document.getElementById(THEME_TOGGLE_ID), catalogue.theme);
}

/**
 * Rewrites the consent dialog into the resolved locale.
 *
 * The question is a template with two holes, `{traffic}` and `{errors}`, which
 * the two links go into. It is assembled out of text nodes and the dialog's own
 * two anchors, moved into place — never innerHTML — so a catalogue string can
 * only ever become text, and the anchors keep their hrefs, their rel and their
 * event behaviour whatever a translation does to the sentence around them. A
 * language that wants the links in the other order just moves the holes.
 *
 * @param {Object} catalogue
 */
export function localiseCookieDialog(catalogue) {
    const strings = catalogue.cookies;
    const textDom = document.getElementById(COOKIES_TEXT_ID);
    const analyticsLinkDom = document.getElementById(COOKIES_LINK_ANALYTICS_ID);
    const sentryLinkDom = document.getElementById(COOKIES_LINK_SENTRY_ID);
    if (!strings || !textDom || !analyticsLinkDom || !sentryLinkDom) {
        return;
    }

    analyticsLinkDom.textContent = strings.measureTraffic;
    sentryLinkDom.textContent = strings.catchErrors;

    const holes = { '{traffic}': analyticsLinkDom, '{errors}': sentryLinkDom };
    const assembled = strings.question
        .split(/(\{traffic\}|\{errors\})/)
        .filter((part) => part !== '')
        .map((part) => holes[part] ?? part);
    textDom.replaceChildren(...assembled);

    cookiesAcceptButtonDom.textContent = strings.accept;
    cookiesDeclineButtonDom.textContent = strings.decline;
}

/**
 * Show the dialog and move focus into it.
 *
 * Focus lands on decline rather than accept: it is the answer that does the
 * least, so it is the safe thing to hit with a stray Return.
 */
export function openCookieDialog() {
    focusedBeforeDialog = document.activeElement;
    cookiesBackdropDom.hidden = false;
    cookiesDivDom.hidden = false;
    cookiesDeclineButtonDom.focus();
}

/**
 * Hide the dialog and give focus back to whatever had it.
 */
export function closeCookieDialog() {
    cookiesDivDom.hidden = true;
    cookiesBackdropDom.hidden = true;
    if (focusedBeforeDialog) {
        focusedBeforeDialog.focus();
        focusedBeforeDialog = null;
    }
}

/**
 * Keyboard handling for the open dialog.
 *
 * Escape closes it as a refusal. Treating it as "ask me again later" would mean
 * the dialog reappeared on every page, which is worse for the visitor than
 * taking their dismissal at face value, and refusing is the answer that leaves
 * them un-measured.
 *
 * Tab is trapped, because a modal that lets you tab out into a page you cannot
 * see or click is a modal in name only.
 *
 * @param {KeyboardEvent} event
 */
export function handleDialogKey(event) {
    if (event.key === 'Escape') {
        declineCookies();

        return;
    }
    if (event.key !== 'Tab') {
        return;
    }

    const focusable = [...cookiesDivDom.querySelectorAll(FOCUSABLE_SELECTOR)];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();

        return;
    }
    if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

/**
 * Record consent and turn the telemetry on.
 */
export function acceptCookies() {
    closeCookieDialog();
    Cookie.setConsent(true);
    setCookies();
}

/**
 * Record the refusal, after clearing anything already set.
 */
export function declineCookies() {
    closeCookieDialog();
    Cookie.deleteAll();
    Cookie.setConsent(false);
}

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
