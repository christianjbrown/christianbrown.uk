'use strict';

// The historical-climate endpoint's curated route whitelist, ordered from most
// zoomed-in (finest resolution, shortest window) to most zoomed-out. The zoom
// control steps along this ladder; the URL is the endpoint base + '/' + route,
// and the human label for each route comes from the message catalogue
// (climateHistory.resolutions[route]).

export const RESOLUTIONS = [
    'hourly-day',
    'hourly-1-month',
    'daily-1-month',
    'daily-3-month',
    'daily-6-month',
    'daily-12-month',
];

// Default view: a month of hourly readings.
export const DEFAULT_INDEX = 1;

/**
 * @param {Number} index
 * @return {Number} the index clamped into the ladder's bounds.
 */
export function clampIndex(index) {
    return Math.max(0, Math.min(RESOLUTIONS.length - 1, index));
}

/**
 * @param {Number} index
 * @return {String} the endpoint route at that ladder position.
 */
export function routeAt(index) {
    return RESOLUTIONS[clampIndex(index)];
}

/**
 * @param {Number} index
 * @return {Boolean} whether that ladder position is an hourly resolution.
 */
export function isHourly(index) {
    return routeAt(index).startsWith('hourly');
}

/**
 * @param {Number} index
 * @return {Boolean} whether there is a finer resolution to zoom into.
 */
export function canZoomIn(index) {
    return index > 0;
}

/**
 * @param {Number} index
 * @return {Boolean} whether there is a longer window to zoom out to.
 */
export function canZoomOut(index) {
    return index < RESOLUTIONS.length - 1;
}
