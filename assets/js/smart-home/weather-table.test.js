'use strict';

import WeatherTable from './weather-table.js';
import FetchMock from 'jest-fetch-mock';

FetchMock.enableMocks();

beforeEach(() => {
    fetch.resetMocks();
});

test.each([
    [
        {
            'data': {
                'temp': 42.497,
                'temp_feels_like': 42.965,
                'humidity': 80.492,
                'precipitation': 99.89,
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="primary important">Temperature</span></td><td><span class="primary important">42.5°c</span><span class="secondary">108.5°f</span></td></tr><tr><td><span class="primary">Temperature feels like</span></td><td><span class="primary">43.0°c</span><span class="secondary">109.3°f</span></td></tr><tr><td><span class="primary">Humidity</span></td><td><span class="primary">80.492%</span></td></tr><tr><td><span class="primary">Chance of precipitation</span></td><td><span class="primary">99.89%</span></td></tr></tbody>',
    ],
    [
        {
            'data': {
                'temp_feels_like': 42.965,
                'humidity': 80.492,
                'precipitation': 99.89,
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Data at path "data.temp" is required. Try again later.</span></td></tr></tbody>',
    ],
    [
        {
            'data': {
                'temp': 42.497,
                'humidity': 80.492,
                'precipitation': 99.89,
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Data at path "data.temp_feels_like" is required. Try again later.</span></td></tr></tbody>',
    ],
    [
        {
            'data': {
                'temp': 42.497,
                'temp_feels_like': 42.965,
                'precipitation': 99.89,
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Data at path "data.humidity" is required. Try again later.</span></td></tr></tbody>',
    ],
    [
        {
            'data': {
                'temp': 42.497,
                'temp_feels_like': 42.965,
                'humidity': 80.492,
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Data at path "data.precipitation" is required. Try again later.</span></td></tr></tbody>',
    ],
])('WeatherTable.update',
    /**
     * @param {Object} data
     * @param {String} expected
     */
    async (data, expected) => {
        const tableDomObj = document.createElement('table');
        const weatherTable = new WeatherTable(tableDomObj, 'test-url');

        fetch.mockResponseOnce(JSON.stringify(data));
        await weatherTable.update();
        expect(tableDomObj.innerHTML).toBe(expected);
    }
);
