import { describe, it, expect } from 'vitest';
import {
    RESOLUTIONS,
    DEFAULT_INDEX,
    clampIndex,
    routeAt,
    isHourly,
    canZoomIn,
    canZoomOut,
} from './resolutions.js';

describe('resolutions', () => {
    it('orders the ladder from most zoomed-in to most zoomed-out', () => {
        expect(RESOLUTIONS).toEqual([
            'hourly-day',
            'hourly-1-month',
            'daily-1-month',
            'daily-3-month',
            'daily-6-month',
            'daily-12-month',
        ]);
    });

    it('defaults to a month of hourly readings', () => {
        expect(RESOLUTIONS[DEFAULT_INDEX]).toBe('hourly-1-month');
    });

    it('clamps an index into the ladder bounds', () => {
        expect(clampIndex(-3)).toBe(0);
        expect(clampIndex(0)).toBe(0);
        expect(clampIndex(2)).toBe(2);
        expect(clampIndex(99)).toBe(RESOLUTIONS.length - 1);
    });

    it('returns the route at a clamped position', () => {
        expect(routeAt(0)).toBe('hourly-day');
        expect(routeAt(99)).toBe('daily-12-month');
    });

    it('knows which ladder positions are hourly', () => {
        expect(isHourly(0)).toBe(true);
        expect(isHourly(1)).toBe(true);
        expect(isHourly(2)).toBe(false);
        expect(isHourly(RESOLUTIONS.length - 1)).toBe(false);
    });

    it('knows when it can zoom in (toward finer) and out (toward longer)', () => {
        expect(canZoomIn(0)).toBe(false);
        expect(canZoomIn(1)).toBe(true);
        expect(canZoomOut(RESOLUTIONS.length - 1)).toBe(false);
        expect(canZoomOut(RESOLUTIONS.length - 2)).toBe(true);
    });
});
