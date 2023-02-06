'use strict';

import SmartHomePage from './smart-home-page.js';
import FetchMock from 'jest-fetch-mock';

FetchMock.enableMocks();

beforeEach(() => {
    fetch.resetMocks();
});

Date.now = () => { return 1675711099000; }

const HOME_TEMP_DATA = {
    'data': {
        'averageTempDegrees': 12.3456,
        'averageTempTimestamp': 1675711099 - (6 * 60 * 60),
        'devices': [
            {
                'name': 'Device 1',
                'temp': 11.59123,
                'timestamp': 1675711099 - (3 * 60 * 60),
                'stale': false
            },
            {
                'name': 'Device 2',
                'temp': 22.59123,
                'timestamp': 1675711099 - (2 * 24 * 60 * 60),
                'stale': true
            }
        ],
    },
    'success': true,
    'version': 1,
};
const WEATHER_DATA = {
    'data': {
    'temp': 42.497,
        'temp_feels_like': 42.965,
        'humidity': 80.492,
        'precipitation': 99.89,
    },
    'success': true,
    'version': 1,
};
const HOME_TEMP_HTML = '<tbody><tr><td><span class="primary important">Average</span><span class="secondary">6 hr(s) ago</span></td><td><span class="primary important">12.3°c</span><span class="secondary">54.2°f</span></td></tr><tr><td><span class="primary">Device 1</span><span class="secondary">3 hr(s) ago</span></td><td><span class="primary">11.6°c</span><span class="secondary">52.9°f</span></td></tr><tr><td><span class="primary muted">Device 2</span><span class="secondary muted">2 day(s) ago</span></td><td><span class="primary muted">22.6°c</span><span class="secondary muted">72.7°f</span></td></tr></tbody>';
const WEATHER_HTML = '<tbody><tr><td><span class="primary important">Temperature</span></td><td><span class="primary important">42.5°c</span><span class="secondary">108.5°f</span></td></tr><tr><td><span class="primary">Temperature feels like</span></td><td><span class="primary">43.0°c</span><span class="secondary">109.3°f</span></td></tr><tr><td><span class="primary">Humidity</span></td><td><span class="primary">80.492%</span></td></tr><tr><td><span class="primary">Chance of precipitation</span></td><td><span class="primary">99.89%</span></td></tr></tbody>';


test('SmartHomePage.runAll', () => {
    const clockDom = document.createElement('span');
    clockDom.setAttribute('id', 'test-clock-id');
    document.body.append(clockDom);

    const weatherTableDom = document.createElement('table');
    weatherTableDom.setAttribute('id', 'test-weather-table-id');
    document.body.append(weatherTableDom);

    const homeTempTableDom = document.createElement('table');
    homeTempTableDom.setAttribute('id', 'test-home-temp-table-id');
    document.body.append(homeTempTableDom);

    const smartHomePage = new SmartHomePage('#test-clock-id', '#test-weather-table-id',  '#test-home-temp-table-id');

    expect(clockDom.innerHTML).toBe('');
    expect(weatherTableDom.innerHTML).toBe('');
    expect(homeTempTableDom.innerHTML).toBe('');

    fetch.mockResponses(
        [JSON.stringify(HOME_TEMP_DATA), {}],
        [JSON.stringify(WEATHER_DATA), {}]
    );

    smartHomePage.runAll().then(
        () => {
            expect(clockDom.innerHTML).toBe('19:18 (7:18 pm)');
            expect(homeTempTableDom.innerHTML).toBe(HOME_TEMP_HTML);
            expect(weatherTableDom.innerHTML).toBe(WEATHER_HTML);
        }
    );

});

test('SmartHomePage.setupSchedule', () => {
    const clockDom = document.createElement('span');
    clockDom.setAttribute('id', 'test-clock-id');
    document.body.append(clockDom);

    const weatherTableDom = document.createElement('table');
    weatherTableDom.setAttribute('id', 'test-weather-table-id');
    document.body.append(weatherTableDom);

    const homeTempTableDom = document.createElement('table');
    homeTempTableDom.setAttribute('id', 'test-home-temp-table-id');
    document.body.append(homeTempTableDom);

    const smartHomePage = new SmartHomePage('#test-clock-id', '#test-weather-table-id',  '#test-home-temp-table-id');

    let setIntervalCalls = [];
    setInterval = (handler, timeout) => {
        setIntervalCalls.push([handler, timeout]);

        return 42;
    };

    smartHomePage.setupSchedule();

    expect(setIntervalCalls).toHaveLength(2);
    expect(typeof setIntervalCalls[0][0]).toBe('function');
    expect(setIntervalCalls[0][1]).toBe(60000);
    expect(typeof setIntervalCalls[1][0]).toBe('function');
    expect(setIntervalCalls[1][1]).toBe(300000);

    expect(clockDom.innerHTML).toBe('');
    expect(weatherTableDom.innerHTML).toBe('');
    expect(homeTempTableDom.innerHTML).toBe('');

    fetch.mockResponses(
        [JSON.stringify(HOME_TEMP_DATA), {}],
        [JSON.stringify(WEATHER_DATA), {}]
    );

    setIntervalCalls[0][0]().then(
        () => {
            // expect(clockDom.innerHTML).toBe('19:18 (7:18 pm)');
            // expect(homeTempTableDom.innerHTML).toBe(HOME_TEMP_HTML);
            // expect(weatherTableDom.innerHTML).toBe('');
        }
    );

    setIntervalCalls[1][0]().then(
        () => {
            // expect(weatherTableDom.innerHTML).toBe(WEATHER_HTML);
        }
    );
});


test('SmartHomePage.constructor bad DOM', () => {
    const clockDom = document.createElement('span');
    clockDom.setAttribute('id', 'test-clock-id');
    document.body.append(clockDom);

    const weatherTableDom = document.createElement('table');
    weatherTableDom.setAttribute('id', 'test-weather-table-id');
    document.body.append(weatherTableDom);

    const homeTempTableDom = document.createElement('table');
    homeTempTableDom.setAttribute('id', 'test-home-temp-table-id');
    document.body.append(homeTempTableDom);

    expect(() => new SmartHomePage('#test-clock-id-invalid', '#test-weather-table-id',  '#test-home-temp-table-id')).toThrowError('Found no DOM element matching selector "#test-clock-id-invalid"');
    expect(() => new SmartHomePage('#test-clock-id', '#test-weather-table-id-invalid',  '#test-home-temp-table-id')).toThrowError('Found no DOM element matching selector "#test-weather-table-id-invalid"');
    expect(() => new SmartHomePage('#test-clock-id', '#test-weather-table-id',  '#test-home-temp-table-id-invalid')).toThrowError('Found no DOM element matching selector "#test-home-temp-table-id-invalid"');

});
