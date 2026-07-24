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

function setCookies() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GOOGLE_ANALYTICS_ID);
    initSentry();
}

// Bring up Sentry error + session-replay reporting. Gated behind cookie
// consent (called only from setCookies), so it never runs for visitors who
// decline. The vendored SDK in the <head> defines window.Sentry; guard against
// it being absent (e.g. blocked/failed load, or jsdom in tests) and against
// double-initialisation. Replay is recorded only when an error occurs
// (replaysSessionSampleRate 0), with the SDK's default text/input masking on.
function initSentry() {
    if (!window.Sentry || window.Sentry.getClient()) {
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
