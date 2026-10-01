import { describe, it, expect, beforeEach } from 'vitest';

import TableErrorRenderer from './TableErrorRenderer.js';
import EN_GB from '../i18n/messages.en-GB.js';

let table;
let renderer;

beforeEach(() => {
    document.body.innerHTML = '';
    table = document.createElement('table');
    document.body.append(table);
    renderer = new TableErrorRenderer(document, table);
});

describe('TableErrorRenderer', () => {
    it('adds one error cell holding the message and a safe external link', () => {
        renderer.render(EN_GB.error);

        expect(table.querySelectorAll('tr')).toHaveLength(1);
        expect(table.querySelector('td.smart-home-table__error-cell span.smart-home-table__error')).not.toBeNull();
        expect(table.querySelectorAll('span.smart-home-table__error br')).toHaveLength(2);
        const link = table.querySelector('span.smart-home-table__error a');
        expect(link.getAttribute('href')).toBe('https://www.youtube.com/watch?v=Fdjf4lMmiiI');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        expect(link.textContent).toBe(EN_GB.error.linkText);
    });

    it('leaves the column span alone when there is no wider header', () => {
        renderer.render(EN_GB.error);

        expect(table.querySelector('td').colSpan).toBe(1);
    });

    it('spans the header columns, counting a colspanned title cell', () => {
        const headerCell = table.insertRow().appendChild(document.createElement('th'));
        headerCell.colSpan = 2;
        table.rows[0].appendChild(document.createElement('th'));

        renderer.render(EN_GB.error);

        expect(table.querySelector('td.smart-home-table__error-cell').colSpan).toBe(3);
    });
});
