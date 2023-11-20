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
     * @param {Boolean} includeDate
     *
     * @returns {String}
     */
    formatUserFriendlyHour(includeDate = false) {
        const date = new Date(this.#timestamp);

        // using all this toLocaleString stuff because it handles the timezone correctly using daylight savings
        const hour = parseInt(date.toLocaleString(this.#locale, {'timezone': this.#timezone, 'hour': 'numeric'}));
        const min = parseInt(date.toLocaleString(this.#locale, {'timezone': this.#timezone, 'minute': 'numeric'}));
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

        if (includeDate) {
            // toLocaleDateString doesn't handle adding 'st', 'nd', 'rd', 'th' to the day of the month
            const dayOfMonth = parseInt(date.toLocaleString(this.#locale, {'timezone': this.#timezone, 'day': 'numeric'}));
            const suffix = dayOfMonth % 10 === 1 && dayOfMonth !== 11 ? 'st' : dayOfMonth % 10 === 2 && dayOfMonth !== 12 ? 'nd' : dayOfMonth % 10 === 3 && dayOfMonth !== 13 ? 'rd' : 'th';
            const dayOfWeek = date.toLocaleString(this.#locale, {'timezone': this.#timezone, 'weekday': 'short'});
            str += ' on '+dayOfWeek+' '+dayOfMonth+suffix+' '+date.toLocaleDateString(this.#locale, {'timezone': this.#timezone, 'month': 'short'});
        }

        return str;
    }
}