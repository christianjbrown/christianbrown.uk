'use strict';

import HomeTemperatureTable from './home-temperature-table.js';
import FetchMock from 'jest-fetch-mock';

FetchMock.enableMocks();

beforeEach(() => {
    fetch.resetMocks();
});

const timestamp = Date.now()/1000;

test.each([
    [
        {
            'data': {
                'averageTempDegrees': 12.3456,
                'averageTempTimestamp': timestamp - (6 * 60 * 60),
                'devices': [
                    {
                        'name': 'Device 1',
                        'temp': 11.59123,
                        'timestamp': timestamp - (3 * 60 * 60),
                        'stale': false
                    },
                    {
                        'name': 'Device 2',
                        'temp': 22.59123,
                        'timestamp': timestamp - (2 * 24 * 60 * 60),
                        'stale': true
                    }
                ],
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="primary important">Average</span><span class="secondary">6 hr(s) ago</span></td><td><span class="primary important">12.3°c</span><span class="secondary">54.2°f</span></td></tr><tr><td><span class="primary">Device 1</span><span class="secondary">3 hr(s) ago</span></td><td><span class="primary">11.6°c</span><span class="secondary">52.9°f</span></td></tr><tr><td><span class="primary muted">Device 2</span><span class="secondary muted">2 day(s) ago</span></td><td><span class="primary muted">22.6°c</span><span class="secondary muted">72.7°f</span></td></tr></tbody>',
    ],
    [
        {
            'data': {
                'devices': [{}],
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Data at path "data.averageTempDegrees" is required. Try again later.</span></td></tr></tbody>',
    ],
    [
        {
            'data': {
                'averageTempDegrees': 42.0,
                'averageTempTimestamp': 123,
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Data at path "data.devices" is required. Try again later.</span></td></tr></tbody>',
    ],
    [
        {
            'data': {
                'averageTempDegrees': 42.0,
                'averageTempTimestamp': 123,
                'devices': [{}],
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Data at path "data.devices[].name" is required. Try again later.</span></td></tr></tbody>',
    ],
    [
        {
            'data': {
                'averageTempDegrees': 42.0,
                'averageTempTimestamp': 123,
                'devices': [
                    {
                        'name': 'test-name',
                    }
                ],
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Data at path "data.devices[].timestamp" is required. Try again later.</span></td></tr></tbody>',
    ],
    [
        {
            'data': {
                'averageTempDegrees': 42.0,
                'averageTempTimestamp': 123,
                'devices': [
                    {
                        'name': 'test-name',
                        'timestamp': 1,
                    }
                ],
            },
            'success': true,
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Data at path "data.devices[].temp" is required. Try again later.</span></td></tr></tbody>',
    ],
])('HomeTemperatureTable.update',
    /**
     * @param {Object} data
     * @param {String} expected
     */
    async (data, expected) => {
        const tableDomObj = document.createElement('table');
        const homeTemperatureTable = new HomeTemperatureTable(tableDomObj, 'test-url');

        fetch.mockResponseOnce(JSON.stringify(data));
        await homeTemperatureTable.update();
        expect(tableDomObj.innerHTML).toBe(expected);
    }
);
