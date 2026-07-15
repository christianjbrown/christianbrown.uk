import { describe, it, expect } from 'vitest';
import Humidity from './Humidity.js';

describe('Humidity', () => {
    it('formats a percentage with no decimal places by default', () => {
        expect(new Humidity(55).formatPercent()).toBe('55%');
    });

    it('rounds to whole percentages by default', () => {
        expect(new Humidity(55.6).formatPercent()).toBe('56%');
    });

    it('honours a custom number of decimal places', () => {
        expect(new Humidity(12.34).formatPercent(1)).toBe('12.3%');
    });
});
