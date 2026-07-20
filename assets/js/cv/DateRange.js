'use strict';

/**
 * Parses a "YYYY" or "YYYY-MM" value into {year, month, monthKnown}. A missing
 * month defaults to January for a start and December for an end (so a year-only
 * range spans whole years), matching the server-side rule; `monthKnown` lets the
 * display show just the year.
 *
 * @param {String}  value
 * @param {Boolean} isEnd
 *
 * @returns {Object}
 */
function parse(value, isEnd) {
    const [year, month] = value.split('-');

    return {
        year: Number(year),
        month: month ? Number(month) : (isEnd ? 12 : 1),
        monthKnown: Boolean(month),
    };
}

/**
 * The locale-formatted label for one endpoint: a short "month year" when the
 * month is known (order, connectors and abbreviation are the locale's — e.g.
 * "Aug 2022", "ago 2022", "08/2022"), or just the year otherwise.
 *
 * @param {String} locale
 * @param {Object} point
 *
 * @returns {String}
 */
function endpointLabel(locale, point) {
    if (!point.monthKnown) {
        return String(point.year);
    }

    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', timeZone: 'UTC' })
        .format(new Date(Date.UTC(point.year, point.month - 1, 1)));
}

/**
 * A localised, long-form duration for a whole number of months, e.g.
 * "3 years 9 months" / "3 años 9 meses" / "6 years". Intl owns the unit words,
 * plurals and joining.
 *
 * @param {String} locale
 * @param {Number} totalMonths
 *
 * @returns {String}
 */
function durationText(locale, totalMonths) {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const parts = [];
    if (years) {
        parts.push(new Intl.NumberFormat(locale, { style: 'unit', unit: 'year', unitDisplay: 'long' }).format(years));
    }
    if (months) {
        parts.push(new Intl.NumberFormat(locale, { style: 'unit', unit: 'month', unitDisplay: 'long' }).format(months));
    }

    return new Intl.ListFormat(locale, { style: 'narrow', type: 'unit' }).format(parts);
}

/**
 * Formats a CV date range with its inclusive duration, localised. An empty end
 * is an ongoing role: the range ends in the catalogue's "now" and the duration
 * counts up to and including the current month (from `now`).
 *
 * @param {Object} catalogue
 * @param {String} start   "YYYY" or "YYYY-MM"
 * @param {String} end     "YYYY", "YYYY-MM", or "" for ongoing
 * @param {Date}   now     the current date (injectable for tests)
 *
 * @returns {String}
 */
export default function formatDateRange(catalogue, start, end, now = new Date()) {
    const locale = catalogue.locale;
    const from = parse(start, false);
    const ongoing = !end;

    const to = ongoing
        ? { year: now.getFullYear(), month: now.getMonth() + 1, monthKnown: true }
        : parse(end, true);

    const totalMonths = (to.year * 12 + to.month) - (from.year * 12 + from.month) + 1;
    const endLabel = ongoing ? catalogue.cv.now : endpointLabel(locale, to);

    return `${endpointLabel(locale, from)} – ${endLabel} (${durationText(locale, totalMonths)})`;
}
