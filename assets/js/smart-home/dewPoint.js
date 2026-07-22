'use strict';

// Magnus-formula coefficients (Alduchov & Eskridge 1996), valid roughly
// -40..50°C — accurate enough for indoor/outdoor comfort comparisons.
const A = 17.625;
const B = 243.04;

/**
 * The dew point (°C) for a given air temperature and relative humidity, via the
 * Magnus approximation. The dew point is the temperature to which the air would
 * have to cool to become saturated — a direct measure of how much moisture the
 * air actually holds, so two dew points can be compared to tell which air is
 * "drier".
 *
 * @param {Number} tempC                 air temperature in °C
 * @param {Number} relativeHumidityPct   relative humidity, 0-100
 *
 * @returns {Number} dew point in °C
 */
export function dewPoint(tempC, relativeHumidityPct) {
    const gamma = Math.log(relativeHumidityPct / 100) + (A * tempC) / (B + tempC);

    return (B * gamma) / (A - gamma);
}
