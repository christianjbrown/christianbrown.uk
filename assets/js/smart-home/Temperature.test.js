import { describe, it, expect } from 'vitest';
import Temperature from './Temperature.js';

describe('Temperature', () => {
    describe('formatC', () => {
        it('formats celsius to one decimal place, dropping a trailing .0', () => {
            expect(new Temperature(21).formatC()).toBe('21°C');
            expect(new Temperature(26.0).formatC()).toBe('26°C');
            expect(new Temperature(25.9).formatC()).toBe('25.9°C');
            expect(new Temperature(26.1).formatC()).toBe('26.1°C');
        });

        it('honours a custom number of decimal places', () => {
            expect(new Temperature(21.456).formatC(2)).toBe('21.46°C');
            expect(new Temperature(21.456).formatC(0)).toBe('21°C');
        });

        it('handles negative temperatures', () => {
            expect(new Temperature(-4.5).formatC()).toBe('-4.5°C');
        });
    });

    describe('formatF', () => {
        it('converts to fahrenheit with one decimal place by default', () => {
            // 21°C -> (21 * 1.8) + 32 = 69.8°F
            expect(new Temperature(21).formatF()).toBe('69.8°F');
        });

        it('honours a custom number of decimal places', () => {
            expect(new Temperature(21).formatF(0)).toBe('70°F');
        });

        it('converts 0°C to 32°F', () => {
            expect(new Temperature(0).formatF()).toBe('32.0°F');
        });
    });
});
