import { describe, it, expect, vi } from 'vitest';

import ConsoleBanner from './ConsoleBanner.js';

describe('ConsoleBanner', () => {
    it('logs each line with its style', () => {
        const fakeConsole = { log: vi.fn() };

        new ConsoleBanner(fakeConsole, [
            { text: 'one', style: 'color: red;' },
            { text: 'two', style: 'color: blue;' },
        ]).print();

        expect(fakeConsole.log.mock.calls).toEqual([
            ['%cone', 'color: red;'],
            ['%ctwo', 'color: blue;'],
        ]);
    });
});
