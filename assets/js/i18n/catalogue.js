'use strict';

import EN_GB from './messages.en-GB.js';

// Every catalogue used to be a static import here, so a page load pulled all
// nine of them: about 85KB decoded, of which a British visitor used one. They
// are dynamic imports now, so a locale's messages are fetched only when that
// locale is the one being rendered.
//
// en-GB stays a static import. It is the default, the fallback for an
// unrecognised locale, and the value the smart-home value classes take as their
// default parameter — so it is needed synchronously on every page, and making it
// a chunk would add a round trip to the common path rather than removing one.
//
// The import specifiers are written out in full rather than built from the
// locale: a bundler (and the browser's module preload scanner) can only see a
// dependency it can read literally, and a template string would hide all eight.
const LOADERS = {
    'de-DE': () => import('./messages.de-DE.js'),
    'fr-FR': () => import('./messages.fr-FR.js'),
    'nl-NL': () => import('./messages.nl-NL.js'),
    'da-DK': () => import('./messages.da-DK.js'),
    'es-ES': () => import('./messages.es-ES.js'),
    'pt-PT': () => import('./messages.pt-PT.js'),
    'zh-CN': () => import('./messages.zh-CN.js'),
    'zh-TW': () => import('./messages.zh-TW.js'),
};

/**
 * Returns the message catalogue for a resolved locale, falling back to en-GB for
 * anything unrecognised (callers should pass a locale from Locale.resolveLocale,
 * which only ever yields a supported one).
 *
 * A failed fetch also falls back to en-GB rather than rejecting. A visitor on a
 * flaky connection should get the page in English, not a half-rendered one:
 * every string this resolves has a server-rendered English value already on the
 * page behind it.
 *
 * @param {String} locale
 *
 * @returns {Promise<Object>}
 */
export async function catalogueFor(locale) {
    const load = LOADERS[locale];
    if (!load) {
        return EN_GB;
    }

    try {
        return (await load()).default;
    } catch {
        return EN_GB;
    }
}

export { EN_GB };
