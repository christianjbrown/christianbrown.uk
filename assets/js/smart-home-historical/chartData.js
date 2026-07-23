'use strict';

// Turns the historical endpoint's per-bucket rows into the column-oriented
// arrays uPlot expects. Each bucket carries a UTC `date` (YYYY-MM-DD) and, for
// the hourly resolutions, an `hour` (0-23); the eight metric fields are always
// present but may be null for a side that reported nothing in that bucket. We
// plot only the three temperature series; a null becomes a gap in the line.

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
 * @param {Object[]} buckets  the endpoint's `data` array, earliest first.
 * @return {{x: Number[], insideMax: Array, insideMin: Array, outsideMax: Array}}
 */
export function bucketsToSeries(buckets) {
    const x = [];
    const insideMax = [];
    const insideMin = [];
    const outsideMax = [];

    for (const bucket of buckets) {
        x.push(bucketToTimestamp(bucket));
        insideMax.push(orNull(bucket.insideMaxTemp));
        insideMin.push(orNull(bucket.insideMinTemp));
        outsideMax.push(orNull(bucket.outsideMaxTemp));
    }

    return { x, insideMax, insideMin, outsideMax };
}
