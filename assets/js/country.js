'use strict';

import { COUNTRIES , TIMEZONES} from './country.const.js';

export default class Country
{
    /**
     * @returns {Array}
     */
    static getCountryCodesFromTimezone() {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let countryCodes = [];
        if (timezone && TIMEZONES[timezone]) {
            countryCodes = TIMEZONES[timezone].c;
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
        if (typeof COUNTRIES[code] == 'string') {
            value = COUNTRIES[code];
        }

        return value;
    }
}
