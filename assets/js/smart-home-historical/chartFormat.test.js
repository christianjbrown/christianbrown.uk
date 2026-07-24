import { describe, it, expect } from 'vitest';
import { degrees, tempAxisValues, tempSeriesValue, percent, humidityAxisValues, humiditySeriesValue } from './chartFormat.js';

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

    describe('percent', () => {
        it('formats a number in whole percent', () => {
            expect(percent(56)).toBe('56%');
            expect(percent(0)).toBe('0%');
        });

        it('shows an em dash for a missing value', () => {
            expect(percent(null)).toBe('—');
            expect(percent(undefined)).toBe('—');
        });
    });

    it('labels each y-axis split in percent', () => {
        expect(humidityAxisValues({}, [20, 40, 60])).toEqual(['20%', '40%', '60%']);
    });

    it('formats a humidity series point for the legend', () => {
        expect(humiditySeriesValue({}, 47)).toBe('47%');
        expect(humiditySeriesValue({}, null)).toBe('—');
    });
});
