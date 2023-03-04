'use strict';

import Country from './country.js';
import {
    CONSENT_KEY,
    CONSENT_OPT_KEY_MAX_AGE,
    CONSENT_VALUE_ACCEPT,
    CONSENT_VALUE_DECLINE,
    COUNTRIES_REQUIRING_CONSENT
} from './cookie.const.js';

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
        if (cookie === CONSENT_VALUE_ACCEPT) {
            value = true
        } else if (cookie === CONSENT_VALUE_DECLINE) {
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
        this.set(CONSENT_KEY, accept ? CONSENT_VALUE_ACCEPT : CONSENT_VALUE_DECLINE);
    }

    /**
     * deleteAll.
     */
    static deleteAll() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let key = cookies[i].split('=').at(0);
            this.delete(key);
        }
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
     * @param {string}      key
     * @param {string}      value
     * @param {number|null} days
     * @param {Object}      opts
     */
    static set(key, value, days = 365, opts = {}) {
        if (days !== null) {
            opts[CONSENT_OPT_KEY_MAX_AGE] = days * 60 * 60 * 24;
        }
        const optsStr = Object.entries(opts).reduce(
            (accumulatedStr, [k, v]) => `${accumulatedStr}; ${k}=${v}`, ''
        )
        document.cookie = key+'='+encodeURIComponent(value)+optsStr;
    }

    /**
     * @param {string} key
     * @param {Object} opts
     */
    static delete(key, opts = {}) {
        this.set(key, '', -1, opts);
    }
}
