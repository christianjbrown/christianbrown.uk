import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

vi.mock('../DataFetcher.js', () => ({
    default: class {
        constructor(url, contract) {
            this.url = url;
            this.contract = contract;
        }

        fetch() {
            return fetchMock();
        }
    },
}));

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';

/** A concrete subclass so update()'s _renderUpdate hook is observable. */
class TestTable extends UpdatingKeyValuePairTable {
    constructor(...args) {
        super(...args);
        this.rendered = null;
    }

    _renderUpdate(data) {
        this.rendered = data;
        this._addTableRow('rendered', 'yes');
    }

    _getContract() {
        return { some: 'contract' };
    }
}

function makeDom() {
    const table = document.createElement('table');
    const updateSpan = document.createElement('span');
    document.body.append(table, updateSpan);
    return { table, updateSpan };
}

beforeEach(() => {
    document.body.innerHTML = '';
    fetchMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-11-20T12:00:00Z'));
});

afterEach(() => {
    vi.useRealTimers();
});

describe('UpdatingKeyValuePairTable', () => {
    describe('update', () => {
        it('clears existing rows and renders the fetched data on success', async () => {
            const { table, updateSpan } = makeDom();
            table.insertRow(); // stale row that must be cleared
            const subject = new TestTable(table, updateSpan, 'url');
            fetchMock.mockResolvedValue({ hello: 'world' });

            await subject.update();

            expect(subject.rendered).toEqual({ hello: 'world' });
            expect(table.querySelectorAll('tr')).toHaveLength(1);
            expect(table.textContent).toContain('rendered');
            expect(table.textContent).toContain('yes');
        });

        it('renders an error message when the fetch rejects', async () => {
            const { table, updateSpan } = makeDom();
            table.insertRow();
            const subject = new TestTable(table, updateSpan, 'url');
            fetchMock.mockRejectedValue(new Error('nope'));

            await subject.update();

            expect(table.textContent).toBe('Error: nope. Try again later.');
            expect(table.querySelector('span.error')).not.toBeNull();
        });
    });

    describe('protected rendering helpers (base class)', () => {
        let table;
        let updateSpan;
        let subject;

        beforeEach(() => {
            ({ table, updateSpan } = makeDom());
            subject = new UpdatingKeyValuePairTable(table, updateSpan, 'url');
        });

        it('base _renderUpdate is a no-op', () => {
            expect(subject._renderUpdate({ anything: true })).toBeUndefined();
            expect(table.querySelectorAll('tr')).toHaveLength(0);
        });

        it('base _getContract returns an empty array', () => {
            expect(subject._getContract()).toEqual([]);
        });

        it('_updateDateSpan sets the html and reveals the element', () => {
            subject._updateDateSpan('<b>hi</b>');
            expect(updateSpan.innerHTML).toBe('<b>hi</b>');
            expect(updateSpan.style.display).toBe('inline');
        });

        describe('_addTempTableRow', () => {
            it('renders celsius and fahrenheit without a timestamp', () => {
                subject._addTempTableRow('Temperature', 21);
                expect(table.textContent).toContain('21.0°c');
                expect(table.textContent).toContain('69.8°f');
                expect(table.textContent).not.toContain('ago');
            });

            it('renders a "time ago" and important styling when given a timestamp', () => {
                subject._addTempTableRow('Temperature', 21, 1_700_000_000, false, true);
                expect(table.textContent).toContain('ago');
                expect(table.querySelector('span.important')).not.toBeNull();
            });
        });

        describe('_addClimateHeaderRow', () => {
            it('adds a header row with two labelled columns', () => {
                subject._addClimateHeaderRow('🌡️', '💧');
                const cells = table.querySelectorAll('td');
                expect(cells).toHaveLength(3);
                expect(cells[1].textContent).toBe('🌡️');
                expect(cells[2].textContent).toBe('💧');
            });
        });

        describe('_addClimateTableRow', () => {
            const ts = Math.floor(new Date('2023-11-20T11:00:00Z').getTime() / 1000);
            const olderTs = ts - 3600;
            const newerTs = ts + 3600;

            it('shows humidity and uses the older reading for "time ago" (important, stale)', () => {
                subject._addClimateTableRow('Average', 20, ts, false, 50, olderTs, true, true);
                expect(table.textContent).toContain('50%');
                expect(table.textContent).toContain('ago');
                expect(table.querySelector('span.important')).not.toBeNull();
            });

            it('falls back to the humidity timestamp when the temperature has none', () => {
                subject._addClimateTableRow('Average', 20, null, false, 50, olderTs, false, false);
                expect(table.textContent).toContain('50%');
                expect(table.textContent).toContain('ago');
            });

            it('keeps the temperature timestamp when humidity is newer', () => {
                subject._addClimateTableRow('Average', 20, ts, false, 50, newerTs, false, false);
                expect(table.textContent).toContain('ago');
            });

            it('handles humidity with no timestamp', () => {
                subject._addClimateTableRow('Average', 20, ts, false, 50, null, false, false);
                expect(table.textContent).toContain('50%');
            });

            it('shows a muted dash when there is no humidity', () => {
                subject._addClimateTableRow('Sensor', 20, ts, false, null, null, false, false);
                expect(table.textContent).toContain('—');
            });

            it('omits the "time ago" when there is no timestamp at all', () => {
                subject._addClimateTableRow('Sensor', 20, null, false, null, null, false, false);
                expect(table.textContent).not.toContain('ago');
                expect(table.textContent).toContain('—');
            });
        });

        describe('_addTableRow', () => {
            it('adds primary key/value only', () => {
                subject._addTableRow('Humidity', '55%');
                expect(table.querySelectorAll('td')).toHaveLength(2);
                expect(table.textContent).toContain('Humidity');
                expect(table.textContent).toContain('55%');
                expect(table.querySelector('span.secondary')).toBeNull();
            });

            it('adds secondary key/value with muted and important styling', () => {
                subject._addTableRow('Temp', '21°c', '69.8°f', 'about', true, true);
                expect(table.querySelector('span.important')).not.toBeNull();
                expect(table.querySelectorAll('span.secondary')).toHaveLength(2);
                expect(table.textContent).toContain('about');
                expect(table.textContent).toContain('69.8°f');
            });
        });
    });
});
