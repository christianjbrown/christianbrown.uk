'use strict';

import Country from './Country.js';
import { CONSENT_KEY, CONSENT_OPT_KEY_MAX_AGE, CONSENT_VALUE_ACCEPT, CONSENT_VALUE_DECLINE, COUNTRIES_REQUIRING_CONSENT } from './Cookie.const.js';

export default class Cookie {
    /**
     * Check if consent is needed.
     *
     * @returns {boolean}
     */
    static async needsConsent() {
        const country = new Country();
        const countryCodes = await country.getCountryCodesFromTimezone();
        const value = countryCodes.some(code => COUNTRIES_REQUIRING_CONSENT.includes(code));

        return value;
    }

    /**
     * Get user consent.
     *
     * @returns {boolean|null}
     */
    static getConsent() {
        const cookie = Cookie.get(CONSENT_KEY);
        switch (cookie) {
            case CONSENT_VALUE_ACCEPT:
                return true;
            case CONSENT_VALUE_DECLINE:
                return false;
            default:
                return null;
        }
    }

    /**
     * Set user consent.
     *
     * @param {boolean} accept
     */
    static setConsent(accept) {
        Cookie.set(CONSENT_KEY, accept ? CONSENT_VALUE_ACCEPT : CONSENT_VALUE_DECLINE);
    }

    /**
     * Delete all cookies.
     */
    static deleteAll() {
        const cookies = document.cookie.split(';');
        cookies.map(cookie => {
            const key = cookie.split('=')[0].trim();
            this.delete(key);
        });
    }

    /**
     * Get a cookie by name.
     *
     * @param {string} name
     *
     * @returns {string|null}
     */
    static get(name) {
        const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
        return match ? decodeURIComponent(match[1]) : null;
    }

    /**
     * Set a cookie. Pass `days = null` for a session cookie (no Max-Age, so it
     * expires when the browser closes).
     *
     * @param {string} key
     * @param {string} value
     * @param {number|null} days
     * @param {Object} opts
     */
    static set(key, value, days = 365, opts = {}) {
        const options = { ...opts };
        if (days !== null) {
            options[CONSENT_OPT_KEY_MAX_AGE] = days * 60 * 60 * 24;
        }
        const optionsStr = Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ');
        const prefix = optionsStr ? `${optionsStr}; ` : '';
        document.cookie = `${key}=${encodeURIComponent(value)}; ${prefix}Path=/; SameSite=Lax; Secure`;
    }

    /**
     * Delete a cookie by name.
     *
     * @param {string} key
     * @param {Object} opts
     */
    static delete(key, opts = {}) {
        this.set(key, '', -1, opts);
    }
}
