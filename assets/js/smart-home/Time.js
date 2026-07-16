'use strict';

const DEFAULT_TIMEZONE = 'Europe/London';
const DEFAULT_LOCALE = 'en-GB'
const MS_PER_SEC = 1000;
const MS_PER_MINUTE = 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

export default class Time {
    #timestamp;
    #timezone;
    #locale;

    /**
     * @param {Number} timestamp
     * @param {String} timezone
     * @param {String} locale
     */
    constructor(timestamp = Date.now(), timezone = DEFAULT_TIMEZONE, locale = DEFAULT_LOCALE) {
        this.#timestamp = timestamp;
        this.#timezone = timezone;
        this.#locale = locale;
    }

    /**
     * Returns a string like "21 mins ago".
     *
     * @returns {String}
     */
    formatTimeAgo() {
        const elapsed = (Date.now() - this.#timestamp)/MS_PER_SEC;
        // Singular unit only when the value is exactly 1; plural otherwise.
        const withUnit = (value, unit) => value + ' ' + unit + (value === 1 ? '' : 's') + ' ago';
        if (elapsed < MS_PER_MINUTE) {
            return withUnit(Math.floor(elapsed), 'sec');
        } else if (elapsed < MS_PER_HOUR) {
            return withUnit(Math.floor(elapsed/MS_PER_MINUTE), 'min');
        } else if (elapsed < MS_PER_DAY) {
            return withUnit(Math.floor(elapsed/MS_PER_HOUR), 'hr');
        } else {
            return withUnit(Math.floor(elapsed/MS_PER_DAY), 'day');
        }
    };

    /**
     * Returns the daylight-savings-aware timezone abbreviation for this
     * timestamp in the configured timezone, e.g. "GMT" or "BST".
     *
     * @returns {String}
     */
    getTimezoneAbbreviation() {
        // Asking for timeZoneName: 'short' guarantees a timeZoneName part in the
        // output (e.g. "GMT"/"BST" for Europe/London).
        const parts = Intl.DateTimeFormat(this.#locale, {'timeZone': this.#timezone, 'timeZoneName': 'short'}).formatToParts(new Date(this.#timestamp));

        return parts.find((part) => part.type === 'timeZoneName').value;
    }

    /**
     * Returns a string like "19:53 (7:53 pm)".
     *
     * @param {Boolean} includeDate
     * @param {Boolean} includeTimezone
     *
     * @returns {String}
     */
    formatUserFriendlyHour(includeDate = false, includeTimezone = false) {
        const date = new Date(this.#timestamp);

        // using all this toLocaleString stuff because it handles the timezone correctly using daylight savings
        const hour = parseInt(Intl.DateTimeFormat(this.#locale, {'timeZone': this.#timezone, 'hour': 'numeric'}).format(date));
        const min = parseInt(Intl.DateTimeFormat(this.#locale, {'timeZone': this.#timezone, 'minute': 'numeric'}).format(date));
        let str;
        if (hour === 0 && min === 0) {
            str = 'midnight';
        } else if (hour === 12 && min === 0) {
            str = 'noon';
        } else {
            // toLocaleString could do some of this with '2-digit', but it also has a bug
            // with hour12: true and hourCycle: 'h12' at noon incorrectly showing '00:00'
            const hour0pad = hour < 10 ? '0'+hour : hour;
            const min0pad = min < 10 ? '0'+min : min;
            str = hour0pad+':'+min0pad;
            if (hour > 12) {
                str += ' ('+(hour-12);
                if (min > 0) {
                    str +=':'+min0pad;
                }
                str += 'pm)';
            }
        }

        if (includeTimezone) {
            str += ' '+this.getTimezoneAbbreviation();
        }

        if (includeDate) {
            str += ' on '+this.formatUserFriendlyDate();
        }

        return str;
    }

    /**
     * Returns a string like "Thu 16th Jul", or — when long is true —
     * "Thursday, 16th of July".
     *
     * @param {Boolean} long
     *
     * @returns {String}
     */
    formatUserFriendlyDate(long = false) {
        const date = new Date(this.#timestamp);

        // toLocaleDateString doesn't handle adding 'st', 'nd', 'rd', 'th' to the day of the month
        const dayOfMonth = parseInt(Intl.DateTimeFormat(this.#locale, {'timeZone': this.#timezone, 'day': 'numeric'}).format(date));
        const suffix = dayOfMonth % 10 === 1 && dayOfMonth !== 11 ? 'st' : dayOfMonth % 10 === 2 && dayOfMonth !== 12 ? 'nd' : dayOfMonth % 10 === 3 && dayOfMonth !== 13 ? 'rd' : 'th';
        const dayOfWeek = Intl.DateTimeFormat(this.#locale, {'timeZone': this.#timezone, 'weekday': long ? 'long' : 'short'}).format(date);
        const month = Intl.DateTimeFormat(this.#locale, {'timeZone': this.#timezone, 'month': long ? 'long' : 'short'}).format(date);

        return long
            ? dayOfWeek+', '+dayOfMonth+suffix+' of '+month
            : dayOfWeek+' '+dayOfMonth+suffix+' '+month;
    }
}