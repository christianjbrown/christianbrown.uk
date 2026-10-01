'use strict';

import Cookie from './Cookie.js';
import Theme from './Theme.js';
import ThemeToggle from './ThemeToggle.js';
import SystemClock from './Clock.js';
import { applyLocale } from './Locale.js';
import { catalogueFor } from './i18n/catalogue.js';
import ConsoleBanner from './global/ConsoleBanner.js';
import ConsentDecisions from './global/ConsentDecisions.js';
import ConsentPrompt from './global/ConsentPrompt.js';
import CookieConsentDialog from './global/CookieConsentDialog.js';
import CookieDialogLocaliser from './global/CookieDialogLocaliser.js';
import GoogleAnalytics from './global/GoogleAnalytics.js';
import HeaderLocaliser from './global/HeaderLocaliser.js';
import LocalHostPolicy from './global/LocalHostPolicy.js';
import SentryReporter from './global/SentryReporter.js';
import Telemetry from './global/Telemetry.js';
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

// The composition root for every page: the one place the object graph for the
// shared chrome is built. Each concern lives in its own module under global/.

const cookie = new Cookie(document);
const clock = new SystemClock();

// Started here, at module evaluation, and awaited by the two consumers below.
// Resolving the locale is synchronous; only fetching a non-default catalogue is
// not, and en-GB needs no fetch at all. Kicking it off once and sharing the
// promise means the dialog and the header chrome cannot disagree about the
// locale, and neither has to re-resolve it.
const cataloguePromise = catalogueFor(applyLocale(cookie));

const dialogElements = {
    dialog: document.getElementById(COOKIES_DIV_ID),
    backdrop: document.getElementById(COOKIES_BACKDROP_ID),
    acceptButton: document.getElementById(COOKIES_ACCEPT_BUTTON_ID),
    declineButton: document.getElementById(COOKIES_DECLINE_BUTTON_ID),
};
const dialog = new CookieConsentDialog(document, dialogElements);
const dialogLocaliser = new CookieDialogLocaliser({
    text: document.getElementById(COOKIES_TEXT_ID),
    analyticsLink: document.getElementById(COOKIES_LINK_ANALYTICS_ID),
    sentryLink: document.getElementById(COOKIES_LINK_SENTRY_ID),
    acceptButton: dialogElements.acceptButton,
    declineButton: dialogElements.declineButton,
});

const telemetry = new Telemetry(
    new LocalHostPolicy(window),
    new GoogleAnalytics(window, document, clock, GOOGLE_ANALYTICS_ID),
    new SentryReporter(window, document, SENTRY_DSN, SENTRY_SDK_URL),
);

dialog.bind(new ConsentDecisions(dialog, cookie, telemetry));

const banner = new ConsoleBanner(console, [
    { text: DEV_CONSOLE_LINE_1, style: DEV_CONSOLE_LINE_1_STYLE },
    { text: DEV_CONSOLE_LINE_2, style: DEV_CONSOLE_LINE_2_STYLE },
]);
const consentPrompt = new ConsentPrompt(cookie, dialog, dialogLocaliser, telemetry, cataloguePromise);

window.addEventListener('load', async () => {
    banner.print();
    await consentPrompt.run();
});

const headerLocaliser = new HeaderLocaliser(document, new ThemeToggle(new Theme(window)), THEME_TOGGLE_ID);

// A promise callback rather than a top-level await: an await here would suspend
// the rest of the module, and everything above it, the dialog's listeners and
// the load handler, has to be registered before the events it is waiting for
// can fire.
void cataloguePromise.then((catalogue) => headerLocaliser.localise(catalogue));
