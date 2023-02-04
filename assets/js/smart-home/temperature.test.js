'use strict';

import Temperature from './temperature.js';

test('Time.formatC', () => {
    const temperatureObj = new Temperature(42.786);
    expect(temperatureObj.formatC()).toBe('42.8°c');
    expect(temperatureObj.formatC(2)).toBe('42.79°c');
});

test('Time.formatF', () => {
    const temperatureObj = new Temperature(42.786);
    expect(temperatureObj.formatF()).toBe('109.0°f');
    expect(temperatureObj.formatF(2)).toBe('109.01°f');
});
