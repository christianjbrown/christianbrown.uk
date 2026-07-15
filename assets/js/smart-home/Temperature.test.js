import { describe, it, expect } from 'vitest';
import Temperature from './Temperature.js';

describe('Temperature', () => {
    describe('formatC', () => {
        it('formats celsius with one decimal place by default', () => {
            expect(new Temperature(21).formatC()).toBe('21.0°c');
        });

        it('honours a custom number of decimal places', () => {
            expect(new Temperature(21.456).formatC(2)).toBe('21.46°c');
            expect(new Temperature(21.456).formatC(0)).toBe('21°c');
        });

        it('handles negative temperatures', () => {
            expect(new Temperature(-4.5).formatC()).toBe('-4.5°c');
        });
    });

    describe('formatF', () => {
        it('converts to fahrenheit with one decimal place by default', () => {
            // 21°c -> (21 * 1.8) + 32 = 69.8°f
            expect(new Temperature(21).formatF()).toBe('69.8°f');
        });

        it('honours a custom number of decimal places', () => {
            expect(new Temperature(21).formatF(0)).toBe('70°f');
        });

        it('converts 0°c to 32°f', () => {
            expect(new Temperature(0).formatF()).toBe('32.0°f');
        });
    });
});
