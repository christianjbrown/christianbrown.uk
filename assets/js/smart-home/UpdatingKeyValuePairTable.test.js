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

        getGeneratedAtUnix() {
            return null;
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

/** A subclass that renders a multi-column title header, like the real tables. */
class HeaderedTestTable extends TestTable {
    _renderHeader() {
        this._addHeaderRow(['🏠 Title', '🌡️', '💧']);
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
            expect(subject.getLastData()).toEqual({ hello: 'world' });
        });

        it('renders an error message when the fetch rejects', async () => {
            const { table, updateSpan } = makeDom();
            table.insertRow();
            const subject = new TestTable(table, updateSpan, 'url');
            fetchMock.mockRejectedValue(new Error('nope'));

            await subject.update();

            expect(subject.getLastData()).toBeNull();
            expect(table.textContent).toBe("⚠️ I'm having trouble loading this data right now.I'm aware - top men are working on it.Please try again later.");
            expect(table.querySelectorAll('span.error br')).toHaveLength(2);
            const link = table.querySelector('span.error a');
            expect(link).not.toBeNull();
            expect(link.getAttribute('href')).toBe('https://www.youtube.com/watch?v=Fdjf4lMmiiI');
            expect(link.getAttribute('target')).toBe('_blank');
            expect(table.querySelector('span.error')).not.toBeNull();
            expect(table.querySelector('td.error-cell')).not.toBeNull();
        });

        it('keeps the title header and spans the error across its columns on failure', async () => {
            const { table, updateSpan } = makeDom();
            const subject = new HeaderedTestTable(table, updateSpan, 'url');
            fetchMock.mockRejectedValue(new Error('nope'));

            await subject.update();

            // Header (title + column headings) stays so the reader can tell which
            // table failed, and the error cell spans its three columns.
            expect(table.textContent).toContain('🏠 Title');
            expect(table.querySelector('th span.title')).not.toBeNull();
            expect(table.querySelector('td.error-cell').colSpan).toBe(3);
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

        describe('_updatedLabel', () => {
            it('formats the envelope timestamp as an "Updated <time ago>" label', () => {
                // System time is fixed at 2023-11-20T12:00:00Z; two minutes earlier.
                const twoMinsAgo = Math.floor(Date.parse('2023-11-20T11:58:00Z') / 1000);
                expect(subject._updatedLabel(twoMinsAgo)).toBe('Updated 2 mins ago');
            });

            it('returns null when there is no timestamp', () => {
                expect(subject._updatedLabel(null)).toBeNull();
                expect(subject._updatedLabel()).toBeNull();
            });
        });

        describe('_updatedElement', () => {
            it('wraps the label in a muted freshness span', () => {
                const twoMinsAgo = Math.floor(Date.parse('2023-11-20T11:58:00Z') / 1000);
                const element = subject._updatedElement(twoMinsAgo);
                expect(element.tagName).toBe('SPAN');
                expect(element.className).toBe('freshness');
                expect(element.textContent).toBe('Updated 2 mins ago');
            });

            it('returns null when there is no timestamp', () => {
                expect(subject._updatedElement(null)).toBeNull();
                expect(subject._updatedElement()).toBeNull();
            });
        });

        it('_updateDateSpan appends the given nodes and reveals the element', () => {
            const link = document.createElement('a');
            link.textContent = 'Met Office';
            subject._updateDateSpan(link, ' and text');

            expect(updateSpan.querySelector('a').textContent).toBe('Met Office');
            expect(updateSpan.textContent).toBe('Met Office and text');
            expect(updateSpan.style.display).toBe('block');
        });

        it('_updateDateSpan replaces any existing children', () => {
            updateSpan.append(document.createElement('span'));
            subject._updateDateSpan('fresh');

            expect(updateSpan.querySelectorAll('span')).toHaveLength(0);
            expect(updateSpan.textContent).toBe('fresh');
        });

        it('_updateDateSpan renders a hostile string as inert text, not HTML', () => {
            subject._updateDateSpan('<img src=x onerror=alert(1)>');

            expect(updateSpan.querySelector('img')).toBeNull();
            expect(updateSpan.textContent).toBe('<img src=x onerror=alert(1)>');
        });

        describe('_addTempTableRow', () => {
            it('renders celsius and fahrenheit without a timestamp, muting the fahrenheit', () => {
                subject._addTempTableRow('Temperature', 21);
                expect(table.textContent).toContain('21°c');
                expect(table.textContent).toContain('69.8°f');
                expect(table.textContent).not.toContain('ago');
                expect(table.querySelector('span.secondary.muted').textContent).toBe('69.8°f');
            });

            it('renders a "time ago" and important styling when given a timestamp', () => {
                subject._addTempTableRow('Temperature', 21, 1_700_000_000, false, true);
                expect(table.textContent).toContain('ago');
                expect(table.querySelector('span.important')).not.toBeNull();
            });
        });

        describe('_addHeaderRow', () => {
            it('puts the title in the first cell and column headings after it', () => {
                subject._addHeaderRow(['🏠 Inside climate', '🌡️', '💧']);
                const cells = table.querySelectorAll('th');
                expect(cells).toHaveLength(3);
                expect(cells[0].textContent).toBe('🏠 Inside climate');
                expect(cells[0].querySelector('span.title')).not.toBeNull();
                expect(cells[0].scope).toBe('col');
                expect(cells[1].textContent).toBe('🌡️');
                expect(cells[2].textContent).toBe('💧');
            });

            it('leaves a null-labelled cell empty (no span)', () => {
                subject._addHeaderRow(['🌤 Outside weather forecast', null]);
                const cells = table.querySelectorAll('th');
                expect(cells).toHaveLength(2);
                expect(cells[0].textContent).toBe('🌤 Outside weather forecast');
                expect(cells[1].textContent).toBe('');
                expect(cells[1].querySelector('span')).toBeNull();
            });
        });

        describe('_renderHeader', () => {
            it('is a no-op by default', () => {
                subject._renderHeader();
                expect(table.querySelectorAll('tr')).toHaveLength(0);
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

            it('shows a muted humidity "feel" description under the value', () => {
                subject._addClimateTableRow('Average', 20, ts, false, 50, olderTs, false, false);
                const humidityCell = table.querySelector('tr td:last-child');
                const description = humidityCell.querySelector('span.secondary.muted');
                expect(description).not.toBeNull();
                // 50% reads as "Pleasant".
                expect(description.textContent).toBe('Pleasant');
            });

            it('shows a muted dash and no description when there is no humidity', () => {
                subject._addClimateTableRow('Sensor', 20, ts, false, null, null, false, false);
                expect(table.textContent).toContain('—');
                const humidityCell = table.querySelector('tr td:last-child');
                expect(humidityCell.querySelector('span.secondary')).toBeNull();
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

            it('mutes the secondary independently when secondaryMuted is set', () => {
                subject._addTableRow('Wind', '24.1km/h', '15mph', null, false, false, true);
                const secondary = table.querySelector('span.secondary');
                expect(secondary.textContent).toBe('15mph');
                expect(secondary.classList.contains('muted')).toBe(true);
                // The primary value stays unmuted.
                expect(table.querySelector('span.primary').classList.contains('muted')).toBe(false);
            });
        });
    });
});
