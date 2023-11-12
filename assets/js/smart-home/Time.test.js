'use strict';

import Time from './Time.js';

test('Time', () => {
    const timeObj = new Time();
    expect(timeObj).toBeInstanceOf(Time);
});

test('Time.formatHour', () => {
    const timeObj = new Time(Date.parse('2023-01-01 20:40:30'));
    const actual = timeObj.formatHour();
    expect(actual).toBe('20:40 (8:40 pm)');
});

test.each(
    [
        [2, '2 sec(s) ago'],
        [59, '59 sec(s) ago'],
        [60, '1 min(s) ago'],
        [61, '1 min(s) ago'],
        [3600, '1 hr(s) ago'],
        [3601, '1 hr(s) ago'],
        [86400, '1 day(s) ago'],
    ]
)('Time.formatTimeAgo() with $secsAgo secs ago = $expected',
/**
     * @param {Number} secsAgo
     * @param {String} expected
     */
    (secsAgo, expected) => {
        expect(new Time(Date.now() - (secsAgo * 1000)).formatTimeAgo()).toBe(expected);
    }
);
