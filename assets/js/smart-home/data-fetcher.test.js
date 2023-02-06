'use strict';

import DataFetcher from './data-fetcher.js';
import FetchMock from 'jest-fetch-mock';

FetchMock.enableMocks();

beforeEach(() => {
    fetch.resetMocks();
});

test.each([
    [
        {
            'data': {},
            'success': false,
            'error': 'test-error',
            'version': 12,
        },
        'Fetched data okay, but data contains error: test-error',
    ],
    [
        {
            'data': {},
            'success': false,
            'version': 12,
        },
        'Fetched data okay, but data says it was not successful, without any further information about why',
    ],
    [
        {
            'data': {},
            'success': false,
            'version': 12,
        },
        'Fetched data okay, but data says it was not successful, without any further information about why',
        {'status': 500, 'statusText': 'Internal Server Error'}
    ],
    [
        {
            'data': {},
            'success': true,
            'version': 12,
        },
        'Fetching data, got 500 Internal Server Error from the server',
        {'status': 500, 'statusText': 'Internal Server Error'}
    ],
])('DataFetcher.fetch JSON error responses',
/**
     * @param {Object} data
     * @param {String} expected
     * @param {Object} fetchMockParams
     */
    async (data, expected, fetchMockParams = []) => {
        const dataFetcher = new DataFetcher('test-url', []);
        fetch.mockResponseOnce(JSON.stringify(data), fetchMockParams);
        await expect(dataFetcher.fetch()).rejects.toThrowError(expected);
    }
);

test.each([
    [
        'test-not-json',
        'Fetching data, got 500 Internal Server Error from the server, and the response body was not JSON',
        {'status': 500, 'statusText': 'Internal Server Error'},
    ],
    [
        'test-not-json',
        'Fetched data okay, but the response body was not JSON',
    ],
    [
        '"test-json-but-not-object"',
        'Fetched and parsed the data okay, but it\'s not what we expected',
    ],
    [
        '"test-json-but-not-object"',
        'Fetching data, got 500 Internal Server Error from the server, and the data is not what we expected',
        {'status': 500, 'statusText': 'Internal Server Error'},
    ],
])('DataFetcher.fetch non-JSON error responses',
    /**
     * @param {String} data
     * @param {String} expected
     * @param {Object} fetchMockParams
     */
    async (data, expected, fetchMockParams = []) => {
        const dataFetcher = new DataFetcher('test-url', []);
        fetch.mockResponseOnce(data, fetchMockParams);
        await expect(dataFetcher.fetch()).rejects.toThrowError(expected);
    }
);

test('DataFetcher.fetch response error - fetch', async () => {
        const dataFetcher = new DataFetcher('test-url', []);
        fetch.mockRejectOnce(new TypeError('Failed to fetch'));
        await expect(dataFetcher.fetch()).rejects.toThrowError('Could not connect to API');
    }
);

test('DataFetcher.fetch response error - other', async () => {
        const dataFetcher = new DataFetcher('test-url', []);
        const error = new URIError('test-error');
        fetch.mockRejectOnce(error);
        await expect(dataFetcher.fetch()).rejects.toThrow(error);
    }
);

test('DataFetcher.fetch response success', async () => {
        const dataFetcher = new DataFetcher('test-url', []);
        const response = {
            'data': {'test-data-key': 'test-data-value'},
            'success': true,
            'version': 12,
        };
        fetch.mockResponseOnce(JSON.stringify(response));
        const actual = await dataFetcher.fetch();
        expect(actual).toEqual({'test-data-key': 'test-data-value'});
    }
);
