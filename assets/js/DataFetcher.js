'use strict';

import JsonPayloadContractValidator from './JsonPayloadContractValidator.js';

const JSON_CONTRACT = {
    'data': {
        'type': 'object',
        'cannotBeEmpty': true,
        'keyRequired': true,
    },
    'success': {'type': 'boolean', 'keyRequired': true, 'cannotBeEmpty': true},
    'error': {'type': 'string', 'cannotBeEmpty': true},
    'timestamp_unix': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
    'version': {'type': 'string', 'keyRequired': true, 'cannotBeEmpty': true},
};

export default class DataFetcher {
    #url;
    #dataContract;
    #generatedAtUnix = null;

    /**
     * @param {String} url
     * @param {Object} dataContract
     */
    constructor(url, dataContract = {}) {
        this.#url = url;
        this.#dataContract = dataContract;
    }

    /**
     * Fetches an update from the URL and parses the response.
     *
     * @throws Error
     * @throws URIError
     */
    async fetch() {
        let response, data;

        try {
            response = await fetch(this.#url);
        } catch (err) {
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                throw new Error('Could not connect to API');
            }
            throw err;
        }

        try {
            data = await response.json();
        } catch (err) {
            let errString;
            if (response.ok) {
                errString = 'Fetched data okay, but the response body was not JSON';
            } else {
                errString = 'Fetching data, got '+response.status+' '+response.statusText+' from the server, and the response body was not JSON';
            }
            throw new Error(errString);
        }

        const jsonPayloadContractValidator = new JsonPayloadContractValidator();
        try {
            await jsonPayloadContractValidator.validateContract(data, JSON_CONTRACT);
        } catch (err) {
            if (response.ok) {
                throw new Error('Fetched and parsed the data okay, but it\'s not what we expected. '+err.message);
            } else {
                throw new Error('Fetching data, got '+response.status+' '+response.statusText+' from the server, and the data is not what we expected. '+err.message);
            }
        }

        if (data['error']) {
            throw new Error('Fetched data okay, but data contains error: '+data['error']);
        } else if (data['success'] !== true) {
            throw new Error('Fetched data okay, but data says it was not successful, without any further information about why');
        } else if (!response.ok) {
            throw new Error('Fetching data, got '+response.status+' '+response.statusText+' from the server');
        }
        // The per-endpoint contract is a descriptor for the `data` value itself,
        // so `data` may be an array or an object (any depth) — whatever the
        // endpoint declares. A contract with no `type` means "no payload
        // validation" (the default), so it is skipped.
        if (this.#dataContract && this.#dataContract.type) {
            await jsonPayloadContractValidator.validateValue(data['data'], this.#dataContract, 'data');
        }

        // The envelope timestamp records when the origin generated this payload.
        // Surfacing it lets callers show honest freshness — an edge that serves a
        // stale-while-revalidate copy returns an older timestamp here.
        this.#generatedAtUnix = data['timestamp_unix'];

        return data['data'];
    }

    /**
     * The Unix timestamp (seconds) at which the origin generated the most recent
     * successful payload, or null if no fetch has succeeded yet.
     *
     * @return {Number|null}
     */
    getGeneratedAtUnix() {
        return this.#generatedAtUnix;
    }
}
