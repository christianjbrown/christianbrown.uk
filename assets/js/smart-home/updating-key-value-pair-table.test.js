'use strict';

import UpdatingKeyValuePairTable from './updating-key-value-pair-table.js';
import FetchMock from 'jest-fetch-mock';

FetchMock.enableMocks();

beforeEach(() => {
    fetch.resetMocks();
});

test ('updatingKeyValuePairTable.update success', async () => {
        const tableDomObj = document.createElement('table');
        // this tests that the table gets cleared later
        tableDomObj.insertRow().insertCell().append('test-cell');

        const updatingKeyValuePairTable = new UpdatingKeyValuePairTable(tableDomObj, 'test-url');
        updatingKeyValuePairTable._renderUpdate = () => {
            const timestamp = Date.now()/1000;

            updatingKeyValuePairTable._addTempTableRow('test-name-1', 41.596, timestamp - (3 * 60 * 60), false, false);
            updatingKeyValuePairTable._addTempTableRow('test-name-2', 42.696, timestamp - (2 * 24 * 60 * 60), true, false);
            updatingKeyValuePairTable._addTempTableRow('test-name-3', 43.796, timestamp - (6 * 60 * 60), false, true);
            updatingKeyValuePairTable._addTempTableRow('test-name-4', 44.796);

            updatingKeyValuePairTable._addTableRow('test-primary-key-1', 'test-primary-value-1', 'test-secondary-value-1', 'test-secondary-key-1', false, false);
            updatingKeyValuePairTable._addTableRow('test-primary-key-2', 'test-primary-value-2', 'test-secondary-value-2', 'test-secondary-key-2', true, false);
            updatingKeyValuePairTable._addTableRow('test-primary-key-3', 'test-primary-value-3', 'test-secondary-value-3', 'test-secondary-key-3', false, true);
            updatingKeyValuePairTable._addTableRow('test-primary-key-4', 'test-primary-value-4');
        };

        const response = {
            'data': {'test-data-key': 'test-data-value'},
            'success': true,
            'version': 1,
        };
        fetch.mockResponseOnce(JSON.stringify(response));
        await updatingKeyValuePairTable.update();
        expect(tableDomObj.innerHTML).toBe('<tbody><tr><td><span class="primary">test-name-1</span><span class="secondary">3 hr(s) ago</span></td><td><span class="primary">41.6°c</span><span class="secondary">106.9°f</span></td></tr><tr><td><span class="primary muted">test-name-2</span><span class="secondary muted">2 day(s) ago</span></td><td><span class="primary muted">42.7°c</span><span class="secondary muted">108.9°f</span></td></tr><tr><td><span class="primary important">test-name-3</span><span class="secondary">6 hr(s) ago</span></td><td><span class="primary important">43.8°c</span><span class="secondary">110.8°f</span></td></tr><tr><td><span class="primary">test-name-4</span></td><td><span class="primary">44.8°c</span><span class="secondary">112.6°f</span></td></tr><tr><td><span class="primary">test-primary-key-1</span><span class="secondary">test-secondary-key-1</span></td><td><span class="primary">test-primary-value-1</span><span class="secondary">test-secondary-value-1</span></td></tr><tr><td><span class="primary muted">test-primary-key-2</span><span class="secondary muted">test-secondary-key-2</span></td><td><span class="primary muted">test-primary-value-2</span><span class="secondary muted">test-secondary-value-2</span></td></tr><tr><td><span class="primary important">test-primary-key-3</span><span class="secondary">test-secondary-key-3</span></td><td><span class="primary important">test-primary-value-3</span><span class="secondary">test-secondary-value-3</span></td></tr><tr><td><span class="primary">test-primary-key-4</span></td><td><span class="primary">test-primary-value-4</span></td></tr></tbody>');
    }
);


test.each([
    [
        {
            'success': true,
            'error': 'test-error',
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Fetched and parsed the data okay, but it\'s not what we expected. Data at path "data" is required. Try again later.</span></td></tr></tbody>',
    ],
    [
        {
            'data': {},
            'error': 'test-error',
            'version': 1,
        },
        '<tbody><tr><td><span class="error">Error: Fetched and parsed the data okay, but it\'s not what we expected. Data at path "success" is required. Try again later.</span></td></tr></tbody>',
    ],
    [
        {
            'data': {},
            'success': true,
            'error': 'test-error',
        },
        '<tbody><tr><td><span class="error">Error: Fetched and parsed the data okay, but it\'s not what we expected. Data at path "version" is required. Try again later.</span></td></tr></tbody>',
    ],
])('UpdatingKeyValuePairTable.update errors',
    /**
     * @param {Object} response
     * @param {String} expected
     */
    async (response, expected) => {
        const tableDomObj = document.createElement('table');
        // this tests that the table gets cleared later
        tableDomObj.insertRow().insertCell().append('test-cell');
        const updatingKeyValuePairTable = new UpdatingKeyValuePairTable(tableDomObj, 'test-url');
        fetch.mockResponseOnce(JSON.stringify(response));
        await updatingKeyValuePairTable.update();
        expect(tableDomObj.innerHTML).toBe(expected);
    }
);
