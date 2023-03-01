'use strict';

const CONSENT_KEY = 'cookie-consent';

const COUNTRIES_REQUIRING_CONSENT = [ 'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES', 'EU', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];

import Country from './country.js';

export default class Cookie
{
    /**
     * @returns {boolean}
     */
    static needsConsent() {
        const countryCodes = Country.getCountryCodesFromTimezone();
        const needsConsent = countryCodes.length && countryCodes.filter(value => COUNTRIES_REQUIRING_CONSENT.includes(value)).length;

        return needsConsent;
    }

    /**
     * @returns {boolean|null}
     */
    static getConsent() {
        const cookie = Cookie.get(CONSENT_KEY);
        let value = null;
        if (cookie === '1') {
            value = true
        } else if (cookie === '0') {
            value = false;
        }

        return value;
    }

    /**
     * @param {boolean} accept
     *
     * @returns {boolean}
     */
    static setConsent(accept) {
        Cookie.set(CONSENT_KEY, accept ? '1' : '0');
    }


    /**
     * @param {string} name
     *
     * @returns {string}
     */
    static get(name) {
        let c = document.cookie.match(`(?:(?:^|.*; *)${name} *= *([^;]*).*$)|^.*$`)[1]
        if (c) return decodeURIComponent(c)
    }

    /**
     * @param {string}      name
     * @param {string}      value
     * @param {Object}      opts
     * @param {number|null} days
     */
    static set(name, value, opts = [], days = 365) {
        if (days) {
            opts['max-age'] = days * 60 * 60 * 24;
        }
        opts = Object.entries(opts).reduce(
            (accumulatedStr, [k, v]) => `${accumulatedStr}; ${k}=${v}`, ''
        )
        document.cookie = name+'='+encodeURIComponent(value)+opts
    }

    /**
     * @param {string} name
     * @param {Array}  opts
     */
    static delete(name, opts) {
        this.set(name, '', {'max-age': -1, ...opts});
    }
}
