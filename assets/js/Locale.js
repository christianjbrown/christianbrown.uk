'use strict';

import Cookie from './Cookie.js';

// The locales the site can render. en-GB is the default and the reference the
// others mirror. Order matters only in that the first supported match wins.
export const SUPPORTED_LOCALES = ['en-GB', 'de-DE', 'fr-FR', 'da-DK'];
export const DEFAULT_LOCALE = 'en-GB';

// Session cookie remembering an explicit ?locale= choice, so it carries across
// pages (the homepage and the smart-home page) for the rest of the visit.
export const LOCALE_COOKIE = 'locale';

/**
 * Matches a raw BCP-47 tag (e.g. "de", "de-AT", "fr-CA", "en-US") to a supported
 * locale: first by an exact case-insensitive match, then by primary subtag so a
 * regional variant still resolves to its base language. Returns null for
 * anything unsupported.
 *
 * @param {String|null|undefined} tag
 * @returns {String|null}
 */
export function matchLocale(tag) {
    if (!tag) {
        return null;
    }

    const lower = tag.toLowerCase();
    const exact = SUPPORTED_LOCALES.find((locale) => locale.toLowerCase() === lower);
    if (exact) {
        return exact;
    }

    const primary = lower.split('-')[0];
    return SUPPORTED_LOCALES.find((locale) => locale.toLowerCase().split('-')[0] === primary) ?? null;
}

/**
 * Resolves the locale to render in, in priority order:
 *   1. a `?locale=` query parameter naming a supported locale — this overrides
 *      everything, so a de/fr/en/da link works whatever the visitor's settings;
 *   2. otherwise a previously-chosen locale from the session cookie, so it
 *      carries across pages;
 *   3. otherwise the browser's accepted languages, matched by primary subtag;
 *   4. otherwise the en-GB default (unchanged from before locale support).
 *
 * The inputs are injectable so the resolution is unit-testable without touching
 * real globals.
 *
 * @param {String}        search        the URL query string (defaults to the page's)
 * @param {Array<String>} languages     the accepted languages (defaults to the browser's)
 * @param {String|null}   cookieLocale  a previously-persisted locale, if any
 * @returns {String} one of SUPPORTED_LOCALES
 */
export function resolveLocale(
    search = window.location.search,
    languages = navigator.languages,
    cookieLocale = null,
) {
    const fromQuery = matchLocale(new URLSearchParams(search).get('locale'));
    if (fromQuery) {
        return fromQuery;
    }

    const fromCookie = matchLocale(cookieLocale);
    if (fromCookie) {
        return fromCookie;
    }

    const accepted = languages && languages.length ? languages : [navigator.language];
    for (const language of accepted) {
        const matched = matchLocale(language);
        if (matched) {
            return matched;
        }
    }

    return DEFAULT_LOCALE;
}

/**
 * Resolves the locale (query → session cookie → browser → default), records it
 * on `<html lang>` (the layout ships a hardcoded "en" it can't branch on a query
 * param for), persists an explicit `?locale=` choice to the session cookie so it
 * carries across pages, and returns it. Call once per page.
 *
 * @returns {String}
 */
export function applyLocale() {
    const search = window.location.search;
    const chosen = matchLocale(new URLSearchParams(search).get('locale'));
    const locale = resolveLocale(search, navigator.languages, Cookie.get(LOCALE_COOKIE));

    if (chosen) {
        Cookie.set(LOCALE_COOKIE, chosen, null);
    }

    document.documentElement.lang = locale;

    return locale;
}

/**
 * Sets an element's text from the catalogue, when the element is on the page.
 * Used to swap the build-time English chrome (headings, nav labels) for the
 * resolved locale after load — a no-op for en-GB and for pages without it.
 *
 * @param {String} selector
 * @param {String} text
 */
export function setText(selector, text) {
    const dom = document.querySelector(selector);
    if (dom) {
        dom.textContent = text;
    }
}

/**
 * Sets an attribute (e.g. a `title` tooltip or image `alt`) on the first matching
 * element, when present. Same purpose as setText, for the accessibility/hover
 * text the build renders in English.
 *
 * @param {String} selector
 * @param {String} attribute
 * @param {String} value
 */
export function setAttr(selector, attribute, value) {
    const dom = document.querySelector(selector);
    if (dom) {
        dom.setAttribute(attribute, value);
    }
}

/**
 * Sets an attribute on every matching element (e.g. the repeated location-pin
 * icons down the CV). A no-op when nothing matches.
 *
 * @param {String} selector
 * @param {String} attribute
 * @param {String} value
 */
export function setAttrAll(selector, attribute, value) {
    document.querySelectorAll(selector).forEach((dom) => dom.setAttribute(attribute, value));
}
