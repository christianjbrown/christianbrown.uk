import { describe, it, expect, vi } from 'vitest';

import TableFactory from './TableFactory.js';
import EN_GB from '../i18n/messages.en-GB.js';

describe('TableFactory', () => {
    it('builds a table wired to its element, injected clock and logger', async () => {
        const logger = { error: vi.fn() };
        const clock = { now: () => Date.parse('2023-11-20T12:00:00Z') };
        const domTable = document.createElement('table');
        const domUpdate = document.createElement('span');
        const received = [];
        class Probe {
            constructor(collaborators) {
                received.push(collaborators);
            }
        }

        const table = new TableFactory(document, clock, logger).create(Probe, domTable, domUpdate, 'https://example.com/api', { type: 'array' }, EN_GB);

        expect(table).toBeInstanceOf(Probe);
        const { renderer, errorRenderer, formatter, dataFetcher, logger: usedLogger, catalogue } = received[0];
        expect(usedLogger).toBe(logger);
        expect(catalogue).toBe(EN_GB);
        expect(dataFetcher.getGeneratedAtUnix()).toBeNull();
        renderer.addRow('k', 'v');
        expect(domTable.textContent).toBe('kv');
        errorRenderer.render(EN_GB.error);
        expect(domTable.querySelector('.smart-home-table__error')).not.toBeNull();
        expect(formatter.timeAgo(Date.parse('2023-11-20T11:58:00Z') / 1000)).toBe('2 mins ago');
    });
});
