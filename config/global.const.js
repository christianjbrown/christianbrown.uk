---
---
'use strict';

export const COOKIES_ACCEPT_BUTTON_ID = 'cookies-accept';
export const COOKIES_BACKDROP_ID = 'cookies-backdrop';
export const COOKIES_TEXT_ID = 'cookies-text';
export const COOKIES_LINK_ANALYTICS_ID = 'cookies-link-analytics';
export const COOKIES_LINK_SENTRY_ID = 'cookies-link-sentry';
export const COOKIES_DECLINE_BUTTON_ID = 'cookies-decline';
export const COOKIES_DIV_ID = 'cookies';
export const THEME_TOGGLE_ID = 'theme-toggle';
// The view-source/console easter egg. Single-sourced so this file and the
// HTML comment at the top of _layouts/global.html can never drift apart:
// the art lives in _includes/console-art.txt, the strapline in _config.yml.
// Both land inside template literals, so any future art must avoid a
// backtick, a backslash and `${`. Keep it under ~60 columns or it wraps in
// a docked DevTools console.
export const DEV_CONSOLE_LINE_1 = `{% include console-art.txt %}`;
export const DEV_CONSOLE_LINE_1_STYLE = 'color: purple; font-weight: bold;';
export const DEV_CONSOLE_LINE_2 = `{{ site.console_tagline }}`;
export const DEV_CONSOLE_LINE_2_STYLE = 'color: #75923C; font-weight: bold;';
export const GOOGLE_ANALYTICS_ID = '{{ site.google_analytics_id }}';
export const SENTRY_DSN = '{{ site.sentry_dsn }}';
// Vendored Sentry browser SDK, injected on demand by global.js once cookie
// consent is granted. Same-origin so the strict script-src CSP allows it; kept
// in step with bin/sync-vendor.mjs, which writes the file this points at.
export const SENTRY_SDK_URL = '/assets/js/vendor/sentry.min.js';
