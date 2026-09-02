import { describe, it, expect } from 'vitest';
// Imported directly rather than through catalogueFor: the loader fetches the
// non-default catalogues on demand and is async, and what this file is checking
// is the content of the catalogue modules, not how they get loaded.
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

// en-GB is the reference catalogue every other locale mirrors. This test guards
// against a translated catalogue silently missing a key that en-GB has (e.g.
// adding a new label to en-GB but forgetting a locale) — nothing else enforces
// that parity. It checks presence and value-kind (object / function / leaf), not
// the translated strings themselves.
const REFERENCE = 'en-GB';
const LOCALES = ['de-DE', 'fr-FR', 'nl-NL', 'da-DK', 'es-ES', 'pt-PT', 'zh-CN', 'zh-TW'];

// Display-name maps keyed by raw SmartThings/location values are deliberately
// locale-specific (a locale may translate names en-GB leaves as-is), so their
// inner keys are not required to match — they're treated as opaque leaves.
const OPAQUE = new Set(['roomNames', 'deviceNames', 'locationNames']);

function kindOf(value) {
    if (typeof value === 'function') {
        return 'function';
    }
    if (value !== null && typeof value === 'object') {
        return 'object';
    }
    return 'leaf';
}

// Every key path in the reference, with its value kind, recursing into plain
// objects except the opaque data-name maps.
function collect(obj, prefix = '') {
    return Object.keys(obj).flatMap((key) => {
        const path = prefix ? `${prefix}.${key}` : key;
        const kind = kindOf(obj[key]);
        const here = [[path, kind]];
        if (kind === 'object' && !OPAQUE.has(key)) {
            return here.concat(collect(obj[key], path));
        }
        return here;
    });
}

function valueAt(obj, path) {
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

const referencePaths = collect(CATALOGUES[REFERENCE]);

describe('message catalogue parity', () => {
    describe.each(LOCALES)('%s', (locale) => {
        const catalogue = CATALOGUES[locale];

        it.each(referencePaths)('has "%s" (%s) like en-GB', (path, kind) => {
            const value = valueAt(catalogue, path);
            expect(value, `${locale} is missing key path "${path}"`).not.toBeUndefined();
            expect(kindOf(value), `${locale}."${path}" has the wrong value kind`).toBe(kind);
        });
    });
});
