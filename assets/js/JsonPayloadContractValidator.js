'use strict';

import JsonPayloadContractViolation from './JsonPayloadContractViolation.js';

/**
 * JSON Payload Contract Validator class.
 */
export default class JsonPayloadContractValidator {
    /**
     * Validate a JSON payload against a contract.
     *
     * @param {Object} data - The JSON payload to validate.
     * @param {Object} contract - The contract to validate against.
     * @param {String} path - (Optional) The current path in the JSON object (used for error messages).
     */
    async validateContract(data, contract, path = '') {
        if (typeof data !== 'object') {
            throw new JsonPayloadContractViolation(path, 'type', data, 'object');
        }

        for (const key of Object.keys(contract)) {
            const params = contract[key];
            let newPath = path + (path ? '.' : '') + key;
            const dataValue = data[key];

            if (params.keyRequired && dataValue === undefined) {
                throw new JsonPayloadContractViolation(newPath, 'required', dataValue);
            }

            if (params.cannotBeEmpty && (dataValue === '' || dataValue === {} || dataValue === null)) {
                throw new JsonPayloadContractViolation(newPath, 'empty', dataValue);
            }

            if (dataValue !== undefined && dataValue !== null) {
                if (params.type === 'array') {
                    if (Array.isArray(dataValue)) {
                        newPath += '[]';
                        if (params['contract'] && typeof params['contract'] === 'object') {
                            for (let i = 0; i < dataValue.length; ++i) {
                                await this.validateContract(dataValue[i], params['contract'], newPath);
                            }
                        }
                    } else {
                        throw new JsonPayloadContractViolation(newPath, 'type', dataValue, params.type);
                    }
                } else if (typeof dataValue !== params.type) {
                    throw new JsonPayloadContractViolation(newPath, 'type', dataValue, params.type);
                }

                if (params.type === 'object' && params['contract'] && typeof params['contract'] === 'object') {
                    await this.validateContract(dataValue, params['contract'], newPath);
                }
            }
        }
    }
}
