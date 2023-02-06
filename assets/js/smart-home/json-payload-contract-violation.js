'use strict';

const FIELD_PROBLEM_TYPE = 'type';
const FIELD_PROBLEM_EMPTY = 'empty';
const FIELD_PROBLEM_REQUIRED = 'required';

export default class JsonPayloadContractViolation extends Error {
    #fieldPath;
    #fieldProblem;
    #fieldData;
    #fieldCorrection;

    /**
     * @param {String} fieldPath
     * @param {String} fieldProblem
     * @param {any}    fieldData
     * @param {any}    fieldCorrection
     */
    constructor(fieldPath, fieldProblem, fieldData, fieldCorrection = null) {
        let message = 'Data at path "'+fieldPath+'" ';
        switch (fieldProblem) {
            case FIELD_PROBLEM_TYPE:
                message += 'must be of type "'+fieldCorrection+'", not "'+typeof fieldData+'"';
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
        super(message);
        this.#fieldPath = fieldPath;
        this.#fieldProblem = fieldProblem;
        this.#fieldData = fieldData;
        this.#fieldCorrection = fieldCorrection;
    }

    /**
     * @returns {String}
     */
    getFieldPath() {
        return this.#fieldPath;
    }

    /**
     * @returns {String}
     */
    getFieldData() {
        return this.#fieldData;
    }

    /**
     * @returns {String}
     */
    getFieldProblem() {
        return this.#fieldProblem;
    }

    /**
     * @returns {String}
     */
    getFieldCorrection() {
        return this.#fieldCorrection;
    }

}
