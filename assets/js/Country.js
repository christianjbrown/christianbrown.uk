'use strict';

const TIMEZONES_URL = '/assets/data/timezones.json';

export default class Country {
    #timezones;

    /**
     * Get an array of country codes associated with the current timezone.
     *
     * @param {string|null} timezone
     *
     * @returns {string[]}
     */
    async getCountryCodesFromTimezone(timezone = null) {
        if (!timezone) {
            timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        const timezones = await this.#getTimezones();
        const value = timezones[timezone]?.c ?? [];

        return value;
    }

    /**
     * @private
     *
     * @returns {Promise<*>}
     */
    async #getTimezones() {
        if (!this.#timezones) {
            // Deliberately fetched rather than imported as a JSON module. An
            // `import ... with { type: 'json' }` is a parse-time construct: on an
            // engine that doesn't support import attributes the *whole* module
            // graph fails to load, which would take the cookie banner and the
            // analytics gate down with it. A fetch keeps every module parseable
            // everywhere and costs the same one request.
            const timezones = await (await fetch(TIMEZONES_URL)).json();

            this.#timezones = timezones;
        }

        return this.#timezones;
    }
}
