'use strict';

import countries from '../data/countries.json' assert {type: 'json'};
import timezones from '../data/timezones.json' assert {type: 'json'};

export default class Country
{
    /**
     * @returns {Array}
     */
    static getCountryCodesFromTimezone() {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let countryCodes = [];
        if (timezone && timezones[timezone]) {
            countryCodes = timezones[timezone].c;
        }

        return countryCodes;
    }

    /**
     * @param {string} code
     *
     * @returns {string|null}
     */
    static getNameFromCountryCode(code) {
        let value = null;
        if (typeof countries[code] == 'string') {
            value = countries[code];
        }

        return value;
    }
}
