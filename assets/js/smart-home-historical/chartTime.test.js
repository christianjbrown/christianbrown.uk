import { describe, it, expect } from 'vitest';
import { formatAxisTick, formatPoint, makeAxisValues, makePointValue, DAY_INCRS } from './chartTime.js';

const MIDNIGHT = Date.UTC(2026, 6, 20) / 1000; // 2026-07-20 00:00 UTC
const AFTERNOON = Date.UTC(2026, 6, 20, 14, 0) / 1000; // 14:00 UTC
const DAY = 86400;

describe('chartTime', () => {
    it('formats a date tick in the locale (day before month, never American), in UTC', () => {
        expect(formatAxisTick('en-GB', MIDNIGHT, false)).toBe('20 Jul');
        expect(formatAxisTick('en-GB', MIDNIGHT, false)).not.toMatch(/^\d+\//);
    });

    it('formats a time tick in 24-hour UTC for en-GB', () => {
        expect(formatAxisTick('en-GB', AFTERNOON, true)).toBe('14:00');
    });

    it('respects a non-English locale', () => {
        expect(formatAxisTick('de-DE', MIDNIGHT, false)).not.toBe(formatAxisTick('en-GB', MIDNIGHT, false));
    });

    it('formats the full point readout for the legend', () => {
        const readout = formatPoint('en-GB', AFTERNOON);
        expect(readout).toContain('20 Jul 2026');
        expect(readout).toContain('14:00');
    });

    it('shows time within a day only on the hourly view', () => {
        // Hourly, sub-day tick spacing → time.
        expect(makeAxisValues('en-GB', true)(null, [AFTERNOON], 0, 0, 3600)).toEqual(['14:00']);
        // Hourly, day-spaced ticks → date.
        expect(makeAxisValues('en-GB', true)(null, [MIDNIGHT], 0, 0, DAY)).toEqual(['20 Jul']);
        // Daily → always a date, even when uPlot offers a sub-day increment.
        expect(makeAxisValues('en-GB', false)(null, [AFTERNOON], 0, 0, 3600)).toEqual(['20 Jul']);
    });

    it('builds a point-value callback that blanks a null cursor', () => {
        const value = makePointValue('en-GB');
        expect(value(null, AFTERNOON)).toContain('14:00');
        expect(value(null, null)).toBe('');
    });

    it('restricts daily ticks to day-or-longer spacings', () => {
        expect(DAY_INCRS[0]).toBe(DAY);
        expect(DAY_INCRS.every((incr) => incr >= DAY)).toBe(true);
    });
});
