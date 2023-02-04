'use strict';

import Table from './table.js';

test('Table.addError', () => {
    const tableDomObj = document.createElement('table');
    const tableObj = new Table(tableDomObj);

    tableObj.addTableRow('test-primary-key', 'test-primary-value', 'test-secondary-value', 'test-secondary-key', false, false);
    tableObj.addTableRow('test-primary-key', 'test-primary-value', 'test-secondary-value', 'test-secondary-key', false, false);
    expect(tableDomObj.rows).toHaveLength(2);

    tableObj.addError(new Error('test-error'));
    expect(tableDomObj.rows).toHaveLength(1);
    const row1 = tableDomObj.rows.item(0);
    expect(row1.innerHTML).toBe('<td><span class="error">Error: test-error. Try again later.</span></td>');
});

test('Table.addTableRow', () => {
    const tableDomObj = document.createElement('table');
    const tableObj = new Table(tableDomObj);

    tableObj.addTableRow('test-primary-key', 'test-primary-value', 'test-secondary-value', 'test-secondary-key', false, false);
    expect(tableDomObj.rows).toHaveLength(1);
    const row1 = tableDomObj.rows.item(0);
    expect(row1.innerHTML).toBe('<td><span class="primary">test-primary-key</span><span class="secondary">test-secondary-key</span></td><td><span class="primary">test-primary-value</span><span class="secondary">test-secondary-value</span></td>');

    tableObj.addTableRow('test-primary-key', 'test-primary-value', 'test-secondary-value', 'test-secondary-key', false, true);
    expect(tableDomObj.rows).toHaveLength(2);
    const row2 = tableDomObj.rows.item(1);
    expect(row2.innerHTML).toBe('<td><span class="primary important">test-primary-key</span><span class="secondary">test-secondary-key</span></td><td><span class="primary important">test-primary-value</span><span class="secondary">test-secondary-value</span></td>');

    tableObj.addTableRow('test-primary-key', 'test-primary-value', 'test-secondary-value', 'test-secondary-key', true, false);
    expect(tableDomObj.rows).toHaveLength(3);
    const row3 = tableDomObj.rows.item(2);
    expect(row3.innerHTML).toBe('<td><span class="primary muted">test-primary-key</span><span class="secondary muted">test-secondary-key</span></td><td><span class="primary muted">test-primary-value</span><span class="secondary muted">test-secondary-value</span></td>');
});


test('Table.addTempTableRow', () => {
    const tableDomObj = document.createElement('table');
    const tableObj = new Table(tableDomObj);

    const timestamp = (Date.now()/1000) - (2 * 24 * 60 * 60);
    tableObj.addTempTableRow('test-name', 42.194, timestamp, false, false);
    expect(tableDomObj.rows).toHaveLength(1);
    const row1 = tableDomObj.rows.item(0);
    expect(row1.innerHTML).toBe('<td><span class="primary">test-name</span><span class="secondary">2 day(s) ago</span></td><td><span class="primary">42.2°c</span><span class="secondary">107.9°f</span></td>');
});

test('Table.clearContents', () => {
    const tableDomObj = document.createElement('table');
    const tableObj = new Table(tableDomObj);

    tableObj.addTableRow('test-primary-key', 'test-primary-value', 'test-secondary-value', 'test-secondary-key', false, false);
    tableObj.addTableRow('test-primary-key', 'test-primary-value', 'test-secondary-value', 'test-secondary-key', false, false);
    expect(tableDomObj.rows).toHaveLength(2);

    tableObj.clearContents();
    expect(tableDomObj.rows).toHaveLength(0);
});

