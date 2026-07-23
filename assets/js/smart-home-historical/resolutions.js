'use strict';

// The historical-climate endpoint's curated route whitelist, ordered from most
// zoomed-in (finest resolution, shortest window) to most zoomed-out. The zoom
// control steps along this ladder; the URL is the endpoint base + '/' + route.

export const RESOLUTIONS = [
    { route: 'hourly-day', label: 'Last day · hourly' },
    { route: 'hourly-1-month', label: 'Last month · hourly' },
    { route: 'daily-1-month', label: 'Last month · daily' },
    { route: 'daily-3-month', label: 'Last 3 months · daily' },
    { route: 'daily-6-month', label: 'Last 6 months · daily' },
    { route: 'daily-12-month', label: 'Last 12 months · daily' },
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
    return RESOLUTIONS[clampIndex(index)].route;
}

/**
 * @param {Number} index
 * @return {String} the human label at that ladder position.
 */
export function labelAt(index) {
    return RESOLUTIONS[clampIndex(index)].label;
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
