import { describe, it, expect } from 'vitest';
import JsonPayloadContractValidator from './JsonPayloadContractValidator.js';
import JsonPayloadContractViolation from './JsonPayloadContractViolation.js';

const validator = () => new JsonPayloadContractValidator();

const detailsOf = async (data, contract, path) => {
    try {
        await validator().validateContract(data, contract, path);
    } catch (err) {
        expect(err).toBeInstanceOf(JsonPayloadContractViolation);
        return err.getFieldDetails();
    }
    throw new Error('Expected validateContract to throw');
};

const detailsOfValue = async (value, params, path = 'data') => {
    try {
        await validator().validateValue(value, params, path);
    } catch (err) {
        expect(err).toBeInstanceOf(JsonPayloadContractViolation);
        return err.getFieldDetails();
    }
    throw new Error('Expected validateValue to throw');
};

describe('JsonPayloadContractValidator', () => {
    it('rejects data that is not an object', async () => {
        const details = await detailsOf('not-an-object', {});
        expect(details).toMatchObject({ fieldPath: '', fieldProblem: 'type', fieldCorrection: 'object' });
    });

    it('accepts an empty contract', async () => {
        await expect(validator().validateContract({}, {})).resolves.toBeUndefined();
    });

    describe('required', () => {
        it('throws when a required key is missing', async () => {
            const details = await detailsOf({}, { a: { keyRequired: true } });
            expect(details).toMatchObject({ fieldPath: 'a', fieldProblem: 'required' });
        });

        it('passes when a required key is present', async () => {
            await expect(validator().validateContract({ a: 1 }, { a: { keyRequired: true, type: 'number' } }))
                .resolves.toBeUndefined();
        });
    });

    describe('cannotBeEmpty', () => {
        it('throws for an empty string', async () => {
            const details = await detailsOf({ a: '' }, { a: { cannotBeEmpty: true } });
            expect(details).toMatchObject({ fieldPath: 'a', fieldProblem: 'empty' });
        });

        it('throws for null', async () => {
            const details = await detailsOf({ a: null }, { a: { cannotBeEmpty: true } });
            expect(details).toMatchObject({ fieldPath: 'a', fieldProblem: 'empty' });
        });

        it('ignores null when emptiness is not enforced', async () => {
            await expect(validator().validateContract({ a: null }, { a: { type: 'number' } }))
                .resolves.toBeUndefined();
        });
    });

    describe('scalar types', () => {
        it('throws on a type mismatch', async () => {
            const details = await detailsOf({ a: 'x' }, { a: { type: 'number' } });
            expect(details).toMatchObject({ fieldPath: 'a', fieldProblem: 'type', fieldCorrection: 'number' });
        });

        it('passes when the type matches', async () => {
            await expect(validator().validateContract({ a: true }, { a: { type: 'boolean' } }))
                .resolves.toBeUndefined();
        });

        it('skips validation for absent, optional keys', async () => {
            await expect(validator().validateContract({}, { a: { type: 'number' } }))
                .resolves.toBeUndefined();
        });
    });

    describe('arrays', () => {
        it('throws when an array is expected but a scalar is given', async () => {
            const details = await detailsOf({ a: 'x' }, { a: { type: 'array' } });
            expect(details).toMatchObject({ fieldPath: 'a', fieldProblem: 'type', fieldCorrection: 'array' });
        });

        it('accepts an array with no element contract', async () => {
            await expect(validator().validateContract({ a: [1, 2, 3] }, { a: { type: 'array' } }))
                .resolves.toBeUndefined();
        });

        it('validates each element against the element contract', async () => {
            const contract = { a: { type: 'array', contract: { b: { type: 'number', keyRequired: true } } } };
            await expect(validator().validateContract({ a: [{ b: 1 }, { b: 2 }] }, contract))
                .resolves.toBeUndefined();
        });

        it('reports the failing element with an indexed path', async () => {
            const contract = { a: { type: 'array', contract: { b: { type: 'number', keyRequired: true } } } };
            const details = await detailsOf({ a: [{}] }, contract);
            expect(details).toMatchObject({ fieldPath: 'a[].b', fieldProblem: 'required' });
        });
    });

    describe('nested objects', () => {
        it('recurses into an object contract and builds a dotted path', async () => {
            const contract = { a: { type: 'object', contract: { b: { type: 'string', keyRequired: true } } } };
            const details = await detailsOf({ a: {} }, contract);
            expect(details).toMatchObject({ fieldPath: 'a.b', fieldProblem: 'required' });
        });

        it('passes a valid nested object', async () => {
            const contract = { a: { type: 'object', contract: { b: { type: 'string', keyRequired: true } } } };
            await expect(validator().validateContract({ a: { b: 'hi' } }, contract)).resolves.toBeUndefined();
        });

        it('accepts an object with no nested contract', async () => {
            await expect(validator().validateContract({ a: { anything: 1 } }, { a: { type: 'object' } }))
                .resolves.toBeUndefined();
        });
    });

    // validateValue applies a descriptor to a value directly (rather than to a
    // named field), so a payload's top-level `data` can itself be an array or an
    // object of any depth.
    describe('validateValue (top-level descriptors)', () => {
        it('validates a bare array against an element contract', async () => {
            const params = { type: 'array', contract: { hour: { type: 'number', keyRequired: true } } };
            await expect(validator().validateValue([{ hour: 0 }, { hour: 1 }], params, 'data'))
                .resolves.toBeUndefined();
        });

        it('reports a failing array element with an indexed path from the root', async () => {
            const params = { type: 'array', contract: { hour: { type: 'number', keyRequired: true } } };
            const details = await detailsOfValue([{ hour: '0' }], params);
            expect(details).toMatchObject({ fieldPath: 'data[].hour', fieldProblem: 'type', fieldCorrection: 'number' });
        });

        it('throws when an array is expected but an object is given', async () => {
            const details = await detailsOfValue({ hour: 0 }, { type: 'array' });
            expect(details).toMatchObject({ fieldPath: 'data', fieldProblem: 'type', fieldCorrection: 'array' });
        });

        it('validates a bare object against a field contract', async () => {
            const params = { type: 'object', contract: { temp: { type: 'number', keyRequired: true } } };
            await expect(validator().validateValue({ temp: 21 }, params, 'data')).resolves.toBeUndefined();
        });

        it('validates an object of several sub-payloads, each object or array', async () => {
            const params = {
                type: 'object',
                contract: {
                    subdata1: { type: 'object', contract: { a: { type: 'number', keyRequired: true } } },
                    subdata2: { type: 'array', contract: { b: { type: 'string', keyRequired: true } } },
                },
            };
            await expect(validator().validateValue({ subdata1: { a: 1 }, subdata2: [{ b: 'x' }] }, params, 'data'))
                .resolves.toBeUndefined();
            const details = await detailsOfValue({ subdata1: { a: 1 }, subdata2: [{}] }, params);
            expect(details).toMatchObject({ fieldPath: 'data.subdata2[].b', fieldProblem: 'required' });
        });
    });
});
