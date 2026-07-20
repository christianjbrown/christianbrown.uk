'use strict';

import EN_GB from './messages.en-GB.js';
import DE_DE from './messages.de-DE.js';
import FR_FR from './messages.fr-FR.js';
import DA_DK from './messages.da-DK.js';
import ES_ES from './messages.es-ES.js';
import PT_PT from './messages.pt-PT.js';

const CATALOGUES = {
    'en-GB': EN_GB,
    'de-DE': DE_DE,
    'fr-FR': FR_FR,
    'da-DK': DA_DK,
    'es-ES': ES_ES,
    'pt-PT': PT_PT,
};

/**
 * Returns the message catalogue for a resolved locale, falling back to en-GB for
 * anything unrecognised (callers should pass a locale from Locale.resolveLocale,
 * which only ever yields a supported one).
 *
 * @param {String} locale
 * @returns {Object}
 */
export function catalogueFor(locale) {
    return CATALOGUES[locale] ?? EN_GB;
}

export { EN_GB };
