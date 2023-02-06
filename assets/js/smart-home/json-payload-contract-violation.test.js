'use strict';

import JsonPayloadContractViolation from './json-payload-contract-violation.js';

test.each([
    ['type', 'Data at path "test-field-path" must be of type "test-correction", not "string"'],
    ['empty', 'Data at path "test-field-path" must not be empty'],
    ['required', 'Data at path "test-field-path" is required'],
    ['other', 'Data at path "test-field-path" broke the contract'],
])('JsonPayloadContractViolation',
    /**
     * @param {String} fieldProblem
     * @param {String}    expectedMessage
     */
    async (fieldProblem, expectedMessage) => {
        const violation = new JsonPayloadContractViolation('test-field-path', fieldProblem, 'test-data', 'test-correction');
        expect(violation.getFieldPath()).toBe('test-field-path');
        expect(violation.getFieldProblem()).toBe(fieldProblem);
        expect(violation.getFieldCorrection()).toBe('test-correction');
        expect(violation.getFieldData()).toBe('test-data');
        expect(violation.message).toBe(expectedMessage);
    }
);
