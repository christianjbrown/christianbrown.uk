'use strict';

// Locale-aware date/time formatters for the chart's x-axis and legend. The
// buckets are UTC, but the readings are from a UK home, so we display them in UK
// wall-clock time (Europe/London handles the BST/GMT switch): a 10:00 UTC bucket
// reads 11:00 during BST. The locale comes from the site's resolver
// (SUPPORTED_LOCALES), so dates follow the visitor's locale and are never
// American month/day/year. Kept as named functions (the closures are exercised
// here, not inside an uPlot callback that jsdom can't run) so coverage holds.

const DAY_SECONDS = 86400;

// The home's timezone; fixed (not the viewer's) so the readings always read in
// the wall-clock time they were taken at.
const TIME_ZONE = 'Europe/London';

// Restricts the daily view's x-axis to day-or-longer tick spacings, so a short
// daily range doesn't get sub-day ticks (which would read as hours). uPlot picks
// whichever of these fits the available space.
export const DAY_INCRS = [1, 2, 5, 7, 14, 30, 60, 90, 180, 365].map((days) => days * DAY_SECONDS);

/**
 * A single x-axis tick label. Ticks spanning a day or more show the date; finer
 * ticks show the time.
 *
 * @param {String}  locale
 * @param {Number}  timestampSecs  Unix seconds (UTC).
 * @param {Boolean} showTime
 * @return {String}
 */
export function formatAxisTick(locale, timestampSecs, showTime) {
    const options = showTime
        ? { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }
        : { day: 'numeric', month: 'short', timeZone: TIME_ZONE };

    return new Intl.DateTimeFormat(locale, options).format(new Date(timestampSecs * 1000));
}

/**
 * The full date + time readout for the legend/cursor.
 *
 * @param {String} locale
 * @param {Number} timestampSecs  Unix seconds (UTC).
 * @return {String}
 */
export function formatPoint(locale, timestampSecs) {
    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIME_ZONE,
    }).format(new Date(timestampSecs * 1000));
}

/**
 * uPlot x-axis `values` callback, bound to a locale and the current resolution.
 * The daily view always shows dates (never hours); the hourly view shows the
 * time within a day and the date at day-spaced ticks.
 *
 * @param {String}  locale
 * @param {Boolean} hourly  whether the current resolution is hourly.
 * @return {Function}
 */
export function makeAxisValues(locale, hourly) {
    return (_self, splits, _axisIdx, _foundSpace, foundIncr) =>
        splits.map((secs) => formatAxisTick(locale, secs, hourly && foundIncr < DAY_SECONDS));
}

/**
 * uPlot x-series `value` callback (legend/cursor readout), bound to a locale.
 *
 * @param {String} locale
 * @return {Function}
 */
export function makePointValue(locale) {
    return (_self, secs) => (secs == null ? '' : formatPoint(locale, secs));
}
