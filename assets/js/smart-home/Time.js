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
     * Returns a string like "21 min(s) ago".
     *
     * @returns {String}
     */
    formatTimeAgo() {
        const elapsed = (Date.now() - this.#timestamp)/MS_PER_SEC;
        let str;
        if (elapsed < MS_PER_MINUTE) {
            str = Math.floor(elapsed) + ' sec(s) ago';
        } else if (elapsed < MS_PER_HOUR) {
            str = Math.floor(elapsed/MS_PER_MINUTE) + ' min(s) ago';
        } else if (elapsed < MS_PER_DAY) {
            str = Math.floor(elapsed/MS_PER_HOUR ) + ' hr(s) ago';
        } else {
            str = Math.floor(elapsed/MS_PER_DAY) + ' day(s) ago';
        }

        return str;
    };

    /**
     * Returns a string like "19:53 (7:53 pm)".
     *
     * @returns {String}
     */
    formatHour() {
        return this.#formatHour24()+' ('+this.#formatHour12()+')';
    }

    /**
     * Returns a string like "19:53".
     *
     * @returns {String}
     */
    #formatHour24() {
        const formatConfig = {
            'timeZone': this.#timezone,
            'hourCycle': 'h23',
            'hour': '2-digit',
            'minute': '2-digit'
        };
        return this.#format(formatConfig);
    }

    /**
     * Returns a string like "7:53 pm".
     *
     * @returns {String}
     */
    #formatHour12() {
        const formatConfig = {
            'timeZone': this.#timezone,
            'hour': 'numeric',
            'minute': '2-digit',
            'hourCycle': 'h12',
        };
        return this.#format(formatConfig);
    }

    /**
     * Returns a formatted time string.
     *
     * @param {DateTimeFormatOptions|Object} formatConfig
     *
     * @returns {string}
     */
    #format(formatConfig) {
        const format = new Intl.DateTimeFormat(this.#locale, formatConfig);
        return format.format(this.#timestamp);
    }
}