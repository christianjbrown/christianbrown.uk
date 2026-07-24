'use strict';

// uPlot value/axis formatters, kept as named functions (not inline arrows in the
// chart options) so they can be unit-tested directly — the chart canvas can't be
// exercised under jsdom, so any logic buried in an inline uPlot callback would go
// uncovered.

/**
 * A temperature in whole-degree Celsius display form, or an em dash when absent.
 *
 * @param {Number|null} value
 * @return {String}
 */
export function degrees(value) {
    return typeof value === 'number' ? `${value}°C` : '—';
}

/**
 * uPlot y-axis `values` callback: label each tick split in degrees.
 *
 * @param {Object}   _self
 * @param {Number[]} splits
 * @return {String[]}
 */
export function tempAxisValues(_self, splits) {
    return splits.map((value) => degrees(value));
}

/**
 * uPlot series `value` callback: the legend/cursor readout for a point.
 *
 * @param {Object}      _self
 * @param {Number|null} value
 * @return {String}
 */
export function tempSeriesValue(_self, value) {
    return degrees(value);
}

/**
 * A relative humidity in whole-percent display form, or an em dash when absent.
 *
 * @param {Number|null} value
 * @return {String}
 */
export function percent(value) {
    return typeof value === 'number' ? `${value}%` : '—';
}

/**
 * uPlot y-axis `values` callback: label each tick split in percent.
 *
 * @param {Object}   _self
 * @param {Number[]} splits
 * @return {String[]}
 */
export function humidityAxisValues(_self, splits) {
    return splits.map((value) => percent(value));
}

/**
 * uPlot series `value` callback: the legend/cursor readout for a humidity point.
 *
 * @param {Object}      _self
 * @param {Number|null} value
 * @return {String}
 */
export function humiditySeriesValue(_self, value) {
    return percent(value);
}
