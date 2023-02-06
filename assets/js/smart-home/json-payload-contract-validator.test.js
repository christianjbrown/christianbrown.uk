'use strict';

import JsonPayloadContractValidator from './json-payload-contract-validator.js';

test.each([
    ['boolean', true, 42],
    ['string', 'test-string', 42],
    ['number', 42, true],
    ['array', ['test-sub-value'], 42],
    ['object', {'test-sub-key': 'test-sub-value'}, 42],
])('JsonPayloadContractValidator.validateContract',
    /**
     * @param {String} type
     * @param {any}    valuePopulated
     * @param {any}    valueWrongType
     */
    async (type, valuePopulated, valueWrongType) => {
        const contractValidator = new JsonPayloadContractValidator();

        const dataPopulated = {'test-key': valuePopulated};
        const dataKeyMissing = {'test-other-key': 'test-other-key-value'};
        const dataEmpty = {'test-key': null};
        const dataWrongType = {'test-key': valueWrongType};

        const dataInObjectPopulated = {'test-key-parent': dataPopulated};
        const dataInObjectKeyMissing = {'test-key-parent': dataKeyMissing};
        const dataInObjectEmpty = {'test-key-parent': dataEmpty};
        const dataInObjectWrongType = {'test-key-parent': dataWrongType};

        const dataInArrayPopulated = {'test-key-parent': [dataPopulated]};
        const dataInArrayKeyMissing = {'test-key-parent': [dataKeyMissing]};
        const dataInArrayEmpty = {'test-key-parent': [dataEmpty]};
        const dataInArrayWrongType = {'test-key-parent': [dataWrongType]};

        const contractTCK = {'test-key': {'type': type, 'cannotBeEmpty': true, 'keyRequired': true}};
        await expect(await contractValidator.validateContract(dataPopulated, contractTCK));
        await expect(contractValidator.validateContract(dataKeyMissing, contractTCK)).rejects.toThrowError('Data at path "test-key" is required');
        await expect(contractValidator.validateContract(dataEmpty, contractTCK)).rejects.toThrowError('Data at path "test-key" must not be empty');
        await expect(contractValidator.validateContract(dataWrongType, contractTCK)).rejects.toThrowError('Data at path "test-key" must be of type "'+type+'", not "'+typeof valueWrongType+'"');

        const contractTCKinObject = {'test-key-parent': {'type': 'object', 'cannotBeEmpty': true, 'keyRequired': true, 'contract': contractTCK}};
        await expect(await contractValidator.validateContract(dataInObjectPopulated, contractTCKinObject));
        await expect(contractValidator.validateContract(dataInObjectKeyMissing, contractTCKinObject)).rejects.toThrowError('Data at path "test-key-parent.test-key" is required');
        await expect(contractValidator.validateContract(dataInObjectEmpty, contractTCKinObject)).rejects.toThrowError('Data at path "test-key-parent.test-key" must not be empty');
        await expect(contractValidator.validateContract(dataInObjectWrongType, contractTCKinObject)).rejects.toThrowError('Data at path "test-key-parent.test-key" must be of type "'+type+'", not "'+typeof valueWrongType+'"');

        const contractTCKinArray = {'test-key-parent': {'type': 'array', 'cannotBeEmpty': true, 'keyRequired': true, 'contract': contractTCK}};
        await expect(await contractValidator.validateContract(dataInArrayPopulated, contractTCKinArray));
        await expect(contractValidator.validateContract(dataInArrayKeyMissing, contractTCKinArray)).rejects.toThrowError('Data at path "test-key-parent[].test-key" is required');
        await expect(contractValidator.validateContract(dataInArrayEmpty, contractTCKinArray)).rejects.toThrowError('Data at path "test-key-parent[].test-key" must not be empty');
        await expect(contractValidator.validateContract(dataInArrayWrongType, contractTCKinArray)).rejects.toThrowError('Data at path "test-key-parent[].test-key" must be of type "'+type+'", not "'+typeof valueWrongType+'"');

        const contractT = {'test-key': {'type': type}};
        await expect(await contractValidator.validateContract(dataPopulated, contractT));
        await expect(await contractValidator.validateContract(dataKeyMissing, contractT));
        await expect(await contractValidator.validateContract(dataEmpty, contractT));
        await expect(contractValidator.validateContract(dataWrongType, contractT)).rejects.toThrowError('Data at path "test-key" must be of type "'+type+'", not "'+typeof valueWrongType+'"');

        const contractC = {'test-key': {'cannotBeEmpty': true}};
        await expect(await contractValidator.validateContract(dataPopulated, contractC));
        await expect(await contractValidator.validateContract(dataKeyMissing, contractC));
        await expect(contractValidator.validateContract(dataEmpty, contractC)).rejects.toThrowError('Data at path "test-key" must not be empty');
        await expect(await contractValidator.validateContract(dataWrongType, contractC));

        const contractK = {'test-key': {'keyRequired': true}};
        await expect(await contractValidator.validateContract(dataPopulated, contractK));
        await expect(contractValidator.validateContract(dataKeyMissing, contractK)).rejects.toThrowError('Data at path "test-key" is required');
        await expect(await contractValidator.validateContract(dataEmpty, contractK));
        await expect(await contractValidator.validateContract(dataWrongType, contractK));

        const contractTC = {'test-key': {'type': type, 'cannotBeEmpty': true}};
        await expect(await contractValidator.validateContract(dataPopulated, contractTC));
        await expect(await contractValidator.validateContract(dataKeyMissing, contractTC));
        await expect(contractValidator.validateContract(dataEmpty, contractTC)).rejects.toThrowError('Data at path "test-key" must not be empty');
        await expect(contractValidator.validateContract(dataWrongType, contractTC)).rejects.toThrowError('Data at path "test-key" must be of type "'+type+'", not "'+typeof valueWrongType+'"');

        const contractCK = {'test-key': {'cannotBeEmpty': true, 'keyRequired': true}};
        await expect(await contractValidator.validateContract(dataPopulated, contractCK));
        await expect(contractValidator.validateContract(dataKeyMissing, contractCK)).rejects.toThrowError('Data at path "test-key" is required');
        await expect(contractValidator.validateContract(dataEmpty, contractCK)).rejects.toThrowError('Data at path "test-key" must not be empty');
        await expect(await contractValidator.validateContract(dataWrongType, contractCK));

        const contractTK = {'test-key': {'type': type, 'keyRequired': true}};
        await expect(await contractValidator.validateContract(dataPopulated, contractTK));
        await expect(contractValidator.validateContract(dataKeyMissing, contractTK)).rejects.toThrowError('Data at path "test-key" is required');
        await expect(await contractValidator.validateContract(dataEmpty, contractTK));
        await expect(contractValidator.validateContract(dataWrongType, contractTK)).rejects.toThrowError('Data at path "test-key" must be of type "'+type+'", not "'+typeof valueWrongType+'"');
    }
);
