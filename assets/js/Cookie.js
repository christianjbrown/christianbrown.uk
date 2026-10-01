'use strict';

import { CONSENT_KEY, CONSENT_OPT_KEY_MAX_AGE, CONSENT_VALUE_ACCEPT, CONSENT_VALUE_DECLINE } from './Cookie.const.js';

// What each stored consent value means. A new value is one more entry here.
const CONSENT_BY_VALUE = new Map([
    [CONSENT_VALUE_ACCEPT, true],
    [CONSENT_VALUE_DECLINE, false],
]);

export default class Cookie {
    #document;

    /**
     * @param {Document} document  the document whose cookie jar this reads and writes
     */
    constructor(document) {
        this.#document = document;
    }

    /**
     * Get user consent.
     *
     * @returns {boolean|null}
     */
    getConsent() {
        const cookie = this.get(CONSENT_KEY);

        return CONSENT_BY_VALUE.has(cookie) ? CONSENT_BY_VALUE.get(cookie) : null;
    }

    /**
     * Set user consent.
     *
     * @param {boolean} accept
     */
    setConsent(accept) {
        this.set(CONSENT_KEY, accept ? CONSENT_VALUE_ACCEPT : CONSENT_VALUE_DECLINE);
    }

    /**
     * Delete all cookies.
     */
    deleteAll() {
        const cookies = this.#document.cookie.split(';');
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
    get(name) {
        const match = this.#document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
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
    set(key, value, days = 365, opts = {}) {
        const options = { ...opts };
        if (days !== null) {
            options[CONSENT_OPT_KEY_MAX_AGE] = days * 60 * 60 * 24;
        }
        const optionsStr = Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ');
        const prefix = optionsStr ? `${optionsStr}; ` : '';
        this.#document.cookie = `${key}=${encodeURIComponent(value)}; ${prefix}Path=/; SameSite=Lax; Secure`;
    }

    /**
     * Delete a cookie by name.
     *
     * @param {string} key
     * @param {Object} opts
     */
    delete(key, opts = {}) {
        this.set(key, '', -1, opts);
    }
}
