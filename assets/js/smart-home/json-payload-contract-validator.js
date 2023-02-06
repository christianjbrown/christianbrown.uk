'use strict';

import JsonPayloadContractViolation from './json-payload-contract-violation.js';

export default class JsonPayloadContractValidator {
    /**
     * @param {Object} data
     * @param {Object} contract
     * @param {String} path
     */
    async validateContract(data, contract, path = '') {
        if (typeof data !== 'object') {
            throw new JsonPayloadContractViolation(path, 'type', data, 'object');
        }
        for (const key of Object.keys(contract)) {
            let params = contract[key];
            let newPath = path+(path?'.':'')+key;

            if (typeof params['keyRequired'] !== 'undefined' && params['keyRequired'] === true && typeof data[key] === 'undefined') {
                throw new JsonPayloadContractViolation(newPath, 'required', data[key]);
            } else if (data[key] !== 'undefined' && typeof params['cannotBeEmpty'] !== 'undefined' && params['cannotBeEmpty'] === true && (data[key] === '' || data[key] === {} || data[key] === null)) {
                throw new JsonPayloadContractViolation(newPath, 'empty', data[key]);
            }
            if (typeof data[key] !== 'undefined' && data[key] !== null && typeof params['type'] === 'string') {
                if (params['type'] === 'array') {
                    if (data[key].constructor === Array) {
                        newPath += '[]';
                        if (typeof params['contract'] === 'object') {
                            for (let i = 0; i < data[key].length; ++i) {
                                await this.validateContract(data[key][i], params['contract'], newPath);
                            }
                        }
                    } else {
                        throw new JsonPayloadContractViolation(newPath, 'type', data[key], params['type']);
                    }
                } else if (typeof data[key] !== params['type']) {
                    throw new JsonPayloadContractViolation(newPath, 'type', data[key], params['type']);
                }
                if (params['type'] === 'object' && typeof params['contract'] === 'object') {
                    await this.validateContract(data[key], params['contract'], newPath)
                }
            }
        }
    }
}
