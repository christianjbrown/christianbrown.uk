'use strict';

import EN_GB from './messages.en-GB.js';
import DE_DE from './messages.de-DE.js';
import FR_FR from './messages.fr-FR.js';
import NL_NL from './messages.nl-NL.js';
import DA_DK from './messages.da-DK.js';
import ES_ES from './messages.es-ES.js';
import PT_PT from './messages.pt-PT.js';
import ZH_CN from './messages.zh-CN.js';
import ZH_TW from './messages.zh-TW.js';

const CATALOGUES = {
    'en-GB': EN_GB,
    'de-DE': DE_DE,
    'fr-FR': FR_FR,
    'nl-NL': NL_NL,
    'da-DK': DA_DK,
    'es-ES': ES_ES,
    'pt-PT': PT_PT,
    'zh-CN': ZH_CN,
    'zh-TW': ZH_TW,
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
