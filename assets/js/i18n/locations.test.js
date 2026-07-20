import { describe, it, expect } from 'vitest';
import { formatLocations } from './locations.js';
import EN_GB from './messages.en-GB.js';
import DE_DE from './messages.de-DE.js';

describe('formatLocations', () => {
    it('returns a single location unchanged in en-GB (empty map falls back)', () => {
        expect(formatLocations(EN_GB, 'London, UK')).toBe('London, UK');
    });

    it('joins multiple locations with the en conjunction', () => {
        expect(formatLocations(EN_GB, 'Singapore|London, UK')).toBe('Singapore and London, UK');
    });

    it('translates each location and joins with the locale conjunction', () => {
        expect(formatLocations(DE_DE, 'Singapore|London, UK')).toBe('Singapur und London, Vereinigtes Königreich');
    });

    it('translates a single mapped location', () => {
        expect(formatLocations(DE_DE, 'Perth, Australia')).toBe('Perth, Australien');
    });

    it('falls back to the raw value for an unmapped location', () => {
        expect(formatLocations(DE_DE, 'Berlin, Germany')).toBe('Berlin, Germany');
    });
});
