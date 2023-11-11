'use strict';

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

    async #getTimezones() {
        if (!this.#timezones) {
            const { default: timezones } = await import('../data/timezones.json', { assert: { type: 'json' } })

            this.#timezones = timezones;
        }

        return this.#timezones;
    }
}
