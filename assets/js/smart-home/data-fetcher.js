'use strict';

import JsonPayloadContractValidator from './json-payload-contract-validator.js';

const JSON_CONTRACT = {
    'data': {
        'type': 'object',
        'cannotBeEmpty': true,
        'keyRequired': true,
    },
    'success': {'type': 'boolean', 'keyRequired': true, 'cannotBeEmpty': true},
    'error': {'type': 'string', 'cannotBeEmpty': true},
    'version': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
};

export default class DataFetcher {
    #url;
    #dataContract;

    /**
     * @param {String} url
     * @param {Object} dataContract
     */
    constructor(url, dataContract) {
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
        await jsonPayloadContractValidator.validateContract(data['data'], this.#dataContract, 'data');

        return data['data'];
    }
}
