import { describe, it, expect } from 'vitest';
import { degrees, tempAxisValues, tempSeriesValue } from './chartFormat.js';

describe('chartFormat', () => {
    describe('degrees', () => {
        it('formats a number in degrees Celsius', () => {
            expect(degrees(21.5)).toBe('21.5°C');
            expect(degrees(0)).toBe('0°C');
        });

        it('shows an em dash for a missing value', () => {
            expect(degrees(null)).toBe('—');
            expect(degrees(undefined)).toBe('—');
        });
    });

    it('labels each y-axis split in degrees', () => {
        expect(tempAxisValues({}, [10, 20, 30])).toEqual(['10°C', '20°C', '30°C']);
    });

    it('formats a series point for the legend', () => {
        expect(tempSeriesValue({}, 18)).toBe('18°C');
        expect(tempSeriesValue({}, null)).toBe('—');
    });
});
