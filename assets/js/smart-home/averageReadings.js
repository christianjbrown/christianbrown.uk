'use strict';

/**
 * Averages a set of device readings, preferring fresh ones. Readings with a
 * numeric value are averaged; the fresh ones are used when any are fresh,
 * otherwise the stale ones are averaged and the result is marked stale. The
 * timestamp is the earliest of the contributing readings. Returns null when
 * there is no numeric reading at all.
 *
 * @param {Array<{value: *, stale: Boolean, timestamp: *}>} readings
 *
 * @returns {{value: Number, stale: Boolean, timestamp: Number|null}|null}
 */
export default function averageReadings(readings) {
    const withValue = readings.filter((reading) => typeof reading.value === 'number');
    if (withValue.length === 0) {
        return null;
    }

    const fresh = withValue.filter((reading) => !reading.stale);
    const contributing = fresh.length ? fresh : withValue;

    const timestamps = contributing
        .map((reading) => reading.timestamp)
        .filter((timestamp) => typeof timestamp === 'number');

    return {
        value: contributing.reduce((sum, reading) => sum + reading.value, 0) / contributing.length,
        stale: fresh.length === 0,
        timestamp: timestamps.length ? Math.min(...timestamps) : null,
    };
}

/**
 * Averages the temperature across the given devices.
 *
 * @param {Array} devices
 *
 * @returns {{value: Number, stale: Boolean, timestamp: Number|null}|null}
 */
export function averageTemperature(devices) {
    return averageReadings(devices.map(
        (device) => ({value: device['temperatureValue'], stale: device['temperatureStale'] === true, timestamp: device['temperatureTimestamp']})
    ));
}

/**
 * Averages the humidity across the given devices.
 *
 * @param {Array} devices
 *
 * @returns {{value: Number, stale: Boolean, timestamp: Number|null}|null}
 */
export function averageHumidity(devices) {
    return averageReadings(devices.map(
        (device) => ({value: device['humidityValue'], stale: device['humidityStale'] === true, timestamp: device['humidityTimestamp']})
    ));
}
