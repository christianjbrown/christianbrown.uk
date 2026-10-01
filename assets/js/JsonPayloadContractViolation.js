'use strict';

const FIELD_PROBLEM_TYPE = 'type';
const FIELD_PROBLEM_EMPTY = 'empty';
const FIELD_PROBLEM_REQUIRED = 'required';

// How each kind of field problem reads. Describing a new kind of problem is one
// more entry here; buildErrorMessage does not change.
const PROBLEM_DESCRIBERS = new Map([
    [FIELD_PROBLEM_TYPE, (fieldData, fieldCorrection) => `must be of type "${fieldCorrection}", not "${typeof fieldData}"`],
    [FIELD_PROBLEM_EMPTY, () => 'must not be empty'],
    [FIELD_PROBLEM_REQUIRED, () => 'is required'],
]);
const DESCRIBE_UNKNOWN_PROBLEM = () => 'broke the contract';

/**
 * Custom error class for representing contract violations in JSON payloads.
 */
export default class JsonPayloadContractViolation extends Error {
    #fieldPath;
    #fieldProblem;
    #fieldData;
    #fieldCorrection;

    /**
     * Create a new JsonPayloadContractViolation instance.
     *
     * @param {string} fieldPath - The path to the field in the JSON payload.
     * @param {string} fieldProblem - The type of contract violation (e.g., 'type', 'empty', 'required').
     * @param {*} fieldData - The data that caused the contract violation.
     * @param {*} [fieldCorrection] - The expected correction for the contract violation (only for 'type' problems).
     */
    constructor(fieldPath, fieldProblem, fieldData, fieldCorrection = null) {
        super(JsonPayloadContractViolation.buildErrorMessage(fieldPath, fieldProblem, fieldData, fieldCorrection));
        this.#fieldPath = fieldPath;
        this.#fieldProblem = fieldProblem;
        this.#fieldData = fieldData;
        this.#fieldCorrection = fieldCorrection;
    }

    /**
     * Build an error message based on the field details and contract violation type.
     *
     * @param {string} fieldPath - The path to the field in the JSON payload.
     * @param {string} fieldProblem - The type of contract violation (e.g., 'type', 'empty', 'required').
     * @param {*} fieldData - The data that caused the contract violation.
     * @param {*} fieldCorrection - The expected correction for the contract violation (only for 'type' problems).
     *
     * @returns {string} - The error message describing the contract violation.
     */
    static buildErrorMessage(fieldPath, fieldProblem, fieldData, fieldCorrection) {
        const describe = PROBLEM_DESCRIBERS.get(fieldProblem) ?? DESCRIBE_UNKNOWN_PROBLEM;

        return `Data at path "${fieldPath}" ${describe(fieldData, fieldCorrection)}`;
    }

    /**
     * Get details of the contract violation.
     *
     * @returns {{fieldPath: string, fieldProblem: string, fieldData: *, fieldCorrection: *}}
     */
    getFieldDetails() {
        return {
            fieldPath: this.#fieldPath,
            fieldProblem: this.#fieldProblem,
            fieldData: this.#fieldData,
            fieldCorrection: this.#fieldCorrection,
        };
    }
}
