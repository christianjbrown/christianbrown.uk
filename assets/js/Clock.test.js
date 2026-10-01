import { describe, it, expect, afterEach, vi } from 'vitest';

import SystemClock from './Clock.js';

afterEach(() => {
    vi.useRealTimers();
});

describe('SystemClock', () => {
    it('reports the current time in milliseconds', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2023-11-20T12:00:00Z'));

        expect(new SystemClock().now()).toBe(Date.parse('2023-11-20T12:00:00Z'));
    });
});
