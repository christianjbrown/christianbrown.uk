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
            const newPath = path + (path ? '.' : '') + key;
            const dataValue = data[key];

            if (params.keyRequired && dataValue === undefined) {
                throw new JsonPayloadContractViolation(newPath, 'required', dataValue);
            }

            if (params.cannotBeEmpty && (dataValue === '' || dataValue === {} || dataValue === null)) {
                throw new JsonPayloadContractViolation(newPath, 'empty', dataValue);
            }

            if (dataValue !== undefined && dataValue !== null) {
                await this.validateValue(dataValue, params, newPath);
            }
        }
    }

    /**
     * Validate a single value against a descriptor (`{type, contract}`). This is
     * the per-value half of the contract: it checks the value's type and, when
     * the descriptor carries a nested `contract`, recurses into it. It works the
     * same whether the value is a field inside an object or the top-level payload
     * itself, so a contract can describe `data` as an array or an object.
     *
     * @param {*}      value  - The value to validate.
     * @param {Object} params - The descriptor to validate against.
     * @param {String} path   - The current path in the JSON object (used for error messages).
     */
    async validateValue(value, params, path) {
        if (params.type === 'array') {
            if (!Array.isArray(value)) {
                throw new JsonPayloadContractViolation(path, 'type', value, params.type);
            }
            if (params['contract'] && typeof params['contract'] === 'object') {
                const elementPath = path + '[]';
                for (let i = 0; i < value.length; ++i) {
                    await this.validateContract(value[i], params['contract'], elementPath);
                }
            }
            return;
        }

        if (typeof value !== params.type) {
            throw new JsonPayloadContractViolation(path, 'type', value, params.type);
        }

        if (params.type === 'object' && params['contract'] && typeof params['contract'] === 'object') {
            await this.validateContract(value, params['contract'], path);
        }
    }
}
