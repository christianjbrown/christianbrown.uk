import { describe, it, expect } from 'vitest';
import JsonPayloadContractViolation from './JsonPayloadContractViolation.js';

describe('JsonPayloadContractViolation', () => {
    it('is an Error subclass', () => {
        const violation = new JsonPayloadContractViolation('a.b', 'required', undefined);
        expect(violation).toBeInstanceOf(Error);
        expect(violation).toBeInstanceOf(JsonPayloadContractViolation);
    });

    describe('buildErrorMessage', () => {
        it('describes a type problem including the actual typeof', () => {
            expect(JsonPayloadContractViolation.buildErrorMessage('a', 'type', 123, 'string'))
                .toBe('Data at path "a" must be of type "string", not "number"');
        });

        it('describes an empty problem', () => {
            expect(JsonPayloadContractViolation.buildErrorMessage('a', 'empty', ''))
                .toBe('Data at path "a" must not be empty');
        });

        it('describes a required problem', () => {
            expect(JsonPayloadContractViolation.buildErrorMessage('a', 'required', undefined))
                .toBe('Data at path "a" is required');
        });

        it('falls back to a generic message for an unknown problem', () => {
            expect(JsonPayloadContractViolation.buildErrorMessage('a', 'wat', 1))
                .toBe('Data at path "a" broke the contract');
        });
    });

    it('exposes the message through the constructor', () => {
        const violation = new JsonPayloadContractViolation('x.y', 'type', true, 'string');
        expect(violation.message).toBe('Data at path "x.y" must be of type "string", not "boolean"');
    });

    describe('getFieldDetails', () => {
        it('returns all field details, defaulting the correction to null', () => {
            const violation = new JsonPayloadContractViolation('a.b', 'empty', '');
            expect(violation.getFieldDetails()).toEqual({
                fieldPath: 'a.b',
                fieldProblem: 'empty',
                fieldData: '',
                fieldCorrection: null,
            });
        });

        it('returns the supplied correction', () => {
            const violation = new JsonPayloadContractViolation('a', 'type', 1, 'string');
            expect(violation.getFieldDetails().fieldCorrection).toBe('string');
        });
    });
});
