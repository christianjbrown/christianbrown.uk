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

    describe('describe', () => {
        it.each([
            [0, 'Dry'],
            [49.9, 'Dry'],
            [50, 'Pleasant'],
            [55, 'Pleasant'],
            [56, 'Comfortable'],
            [60, 'Comfortable'],
            [61, 'Sticky'],
            [65, 'Sticky'],
            [66, 'Uncomfortable'],
            [70, 'Uncomfortable'],
            [71, 'Oppressive'],
            [75, 'Oppressive'],
            [76, 'Miserable'],
            [100, 'Miserable'],
        ])('describes %i%% as "%s"', (percent, label) => {
            expect(new Humidity(percent).describe()).toBe(label);
        });
    });
});
