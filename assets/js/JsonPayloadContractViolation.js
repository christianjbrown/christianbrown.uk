'use strict';

const FIELD_PROBLEM_TYPE = 'type';
const FIELD_PROBLEM_EMPTY = 'empty';
const FIELD_PROBLEM_REQUIRED = 'required';

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
        let message = `Data at path "${fieldPath}" `;
        switch (fieldProblem) {
            case FIELD_PROBLEM_TYPE:
                message += `must be of type "${fieldCorrection}", not "${typeof fieldData}"`;
                break;
            case FIELD_PROBLEM_EMPTY:
                message += 'must not be empty';
                break;
            case FIELD_PROBLEM_REQUIRED:
                message += 'is required';
                break;
            default:
                message += 'broke the contract';
                break;
        }
        return message;
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
