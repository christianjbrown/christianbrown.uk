'use strict';

import EN_GB from '../i18n/messages.en-GB.js';

const DEFAULT_TIMEZONE = 'Europe/London';
const MS_PER_SEC = 1000;
const SECS_PER_MINUTE = 60;
const SECS_PER_HOUR = SECS_PER_MINUTE * 60;
const SECS_PER_DAY = SECS_PER_HOUR * 24;

export default class Time {
    #timestamp;
    #timezone;
    #catalogue;

    /**
     * @param {Number} timestamp
     * @param {String} timezone
     * @param {Object} catalogue  a message catalogue (locale + date/time
     *                            wording); defaults to en-GB. The timezone stays
     *                            Europe/London whatever the locale — this is a
     *                            London home — only the language changes.
     */
    constructor(timestamp = Date.now(), timezone = DEFAULT_TIMEZONE, catalogue = EN_GB) {
        this.#timestamp = timestamp;
        this.#timezone = timezone;
        this.#catalogue = catalogue;
    }

    /**
     * Returns a string like "21 mins ago" — the wording is the catalogue's
     * (en-GB keeps the site's terse "mins/hrs"; de-DE/fr-FR use Intl).
     *
     * @returns {String}
     */
    formatTimeAgo() {
        const elapsed = (Date.now() - this.#timestamp) / MS_PER_SEC;
        let value;
        let unit;
        if (elapsed < SECS_PER_MINUTE) {
            value = Math.floor(elapsed);
            unit = 'second';
        } else if (elapsed < SECS_PER_HOUR) {
            value = Math.floor(elapsed / SECS_PER_MINUTE);
            unit = 'minute';
        } else if (elapsed < SECS_PER_DAY) {
            value = Math.floor(elapsed / SECS_PER_HOUR);
            unit = 'hour';
        } else {
            value = Math.floor(elapsed / SECS_PER_DAY);
            unit = 'day';
        }

        return this.#catalogue.time.relativeTime(value, unit);
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
        const parts = Intl.DateTimeFormat(this.#catalogue.locale, {'timeZone': this.#timezone, 'timeZoneName': 'short'}).formatToParts(new Date(this.#timestamp));

        return parts.find((part) => part.type === 'timeZoneName').value;
    }

    /**
     * Returns a string like "19:53 (7:53 pm)". The 12-hour gloss is en-GB only;
     * de-DE/fr-FR are 24-hour, and midnight/noon are shown as localised words.
     *
     * @param {Boolean} includeDate
     * @param {Boolean} includeTimezone
     *
     * @returns {String}
     */
    formatUserFriendlyHour(includeDate = false, includeTimezone = false) {
        const date = new Date(this.#timestamp);
        const locale = this.#catalogue.locale;

        // using all this toLocaleString stuff because it handles the timezone correctly using daylight savings
        const hour = parseInt(Intl.DateTimeFormat(locale, {'timeZone': this.#timezone, 'hour': 'numeric'}).format(date));
        const min = parseInt(Intl.DateTimeFormat(locale, {'timeZone': this.#timezone, 'minute': 'numeric'}).format(date));
        let str;
        if (hour === 0 && min === 0) {
            str = this.#catalogue.time.midnight;
        } else if (hour === 12 && min === 0) {
            str = this.#catalogue.time.noon;
        } else {
            // toLocaleString could do some of this with '2-digit', but it also has a bug
            // with hour12: true and hourCycle: 'h12' at noon incorrectly showing '00:00'
            const hour0pad = hour < 10 ? '0'+hour : hour;
            const min0pad = min < 10 ? '0'+min : min;
            str = hour0pad+':'+min0pad;
            if (this.#catalogue.time.twelveHourGloss && hour > 12) {
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
            str += this.#catalogue.time.onWord+this.formatUserFriendlyDate();
        }

        return str;
    }

    /**
     * Returns a string like "Thu 16th Jul", or — when long is true —
     * "Thursday, 16th of July". Delegated to the catalogue, which owns the
     * locale's ordinals and word order.
     *
     * @param {Boolean} long
     *
     * @returns {String}
     */
    formatUserFriendlyDate(long = false) {
        return this.#catalogue.time.formatDate(new Date(this.#timestamp), this.#timezone, long);
    }
}
