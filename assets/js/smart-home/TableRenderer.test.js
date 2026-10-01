import { describe, it, expect, beforeEach } from 'vitest';

import TableRenderer from './TableRenderer.js';

let table;
let updateSpan;
let renderer;

beforeEach(() => {
    document.body.innerHTML = '';
    table = document.createElement('table');
    updateSpan = document.createElement('span');
    document.body.append(table, updateSpan);
    renderer = new TableRenderer(document, table, updateSpan);
});

describe('TableRenderer', () => {
    it('clears every row', () => {
        table.insertRow();
        table.insertRow();

        renderer.clear();

        expect(table.querySelectorAll('tr')).toHaveLength(0);
    });

    describe('addHeaderRow', () => {
        it('puts a title span in the first cell and headings after it', () => {
            renderer.addHeaderRow(['Title', 'A', null]);

            const cells = table.querySelectorAll('th');
            expect(cells).toHaveLength(3);
            expect(cells[0].scope).toBe('col');
            expect(cells[0].querySelector('span.smart-home-table__value--title').textContent).toBe('Title');
            expect(cells[1].querySelector('span.smart-home-table__value--title')).toBeNull();
            expect(cells[2].querySelector('span')).toBeNull();
        });

        it('lets the title span several columns', () => {
            renderer.addHeaderRow(['Title'], 2);

            expect(table.querySelector('th').colSpan).toBe(2);
        });

        it('leaves the column span alone when it is 1', () => {
            renderer.addHeaderRow(['Title']);

            expect(table.querySelector('th').colSpan).toBe(1);
        });
    });

    describe('addClimateRow', () => {
        const cells = {
            name: 'Kitchen', timeAgo: '2 mins ago', celsius: '21°C', fahrenheit: '69.8°F', temperatureStale: false,
            humidityValue: '50%', humidityDescription: 'Pleasant', humidityMuted: false, important: false,
        };

        it('lays out name, temperature and humidity columns with their secondary lines', () => {
            renderer.addClimateRow(cells);

            const tds = table.querySelectorAll('td');
            expect(tds).toHaveLength(3);
            expect(tds[0].textContent).toBe('Kitchen2 mins ago');
            expect(tds[1].textContent).toBe('21°C69.8°F');
            expect(tds[2].textContent).toBe('50%Pleasant');
        });

        it('omits the time ago and the humidity description when there are none', () => {
            renderer.addClimateRow({ ...cells, timeAgo: null, humidityValue: '—', humidityDescription: null, humidityMuted: true });

            const tds = table.querySelectorAll('td');
            expect(tds[0].querySelectorAll('span')).toHaveLength(1);
            expect(tds[2].querySelectorAll('span')).toHaveLength(1);
        });
    });

    describe('createFreshnessElement', () => {
        it('wraps the label in a freshness span', () => {
            const span = renderer.createFreshnessElement('Updated now');

            expect(span.className).toBe('update-time__freshness');
            expect(span.textContent).toBe('Updated now');
        });
    });

    describe('createExternalLink', () => {
        it('builds an anchor that opens in a new tab', () => {
            const link = renderer.createExternalLink('https://example.com/', 'Example');

            expect(link.getAttribute('href')).toBe('https://example.com/');
            expect(link.target).toBe('_blank');
            expect(link.textContent).toBe('Example');
        });
    });
});
