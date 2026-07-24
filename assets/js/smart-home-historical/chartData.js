'use strict';

// Turns the historical endpoint's per-bucket rows into the column-oriented
// arrays uPlot expects. Each bucket carries a UTC `date` (YYYY-MM-DD) and, for
// the hourly resolutions, an `hour` (0-23); the eight metric fields are always
// present but may be null for a side that reported nothing in that bucket. We
// build both a temperature and a humidity trio (each: an outside line plus an
// inside min/max band); the chart plots one metric at a time. Each side mirrors
// the temperature choice of using the *max* outside field. A null becomes a gap
// in the line.

/**
 * The bucket's UTC start as Unix seconds (uPlot's x unit). Daily buckets have no
 * `hour`, so they anchor at 00:00 UTC.
 *
 * @param {Object} bucket
 * @return {Number}
 */
export function bucketToTimestamp(bucket) {
    const [year, month, day] = bucket.date.split('-').map(Number);
    const hour = typeof bucket.hour === 'number' ? bucket.hour : 0;

    return Date.UTC(year, month - 1, day, hour) / 1000;
}

/**
 * @param {*} value
 * @return {Number|null} the value, or null when absent (a line gap).
 */
function orNull(value) {
    return typeof value === 'number' ? value : null;
}

/**
 * One metric's three columns: an outside line and the inside min/max that form
 * the band.
 *
 * @typedef {{outside: Array, insideMin: Array, insideMax: Array}} MetricColumns
 */

/**
 * @param {Object[]} buckets  the endpoint's `data` array, earliest first.
 * @return {{x: Number[], temp: MetricColumns, humidity: MetricColumns}}
 */
export function bucketsToSeries(buckets) {
    const x = [];
    const temp = { outside: [], insideMin: [], insideMax: [] };
    const humidity = { outside: [], insideMin: [], insideMax: [] };

    for (const bucket of buckets) {
        x.push(bucketToTimestamp(bucket));
        temp.outside.push(orNull(bucket.outsideMaxTemp));
        temp.insideMin.push(orNull(bucket.insideMinTemp));
        temp.insideMax.push(orNull(bucket.insideMaxTemp));
        humidity.outside.push(orNull(bucket.outsideMaxHumidity));
        humidity.insideMin.push(orNull(bucket.insideMinHumidity));
        humidity.insideMax.push(orNull(bucket.insideMaxHumidity));
    }

    return { x, temp, humidity };
}
