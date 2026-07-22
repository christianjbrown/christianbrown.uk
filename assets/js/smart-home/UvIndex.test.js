import { describe, it, expect } from 'vitest';
import UvIndex from './UvIndex.js';
import DE_DE from '../i18n/messages.de-DE.js';

describe('UvIndex', () => {
    it('formats the index as a whole number', () => {
        expect(new UvIndex(7).format()).toBe('7');
    });

    it('rounds a fractional index to a whole number', () => {
        expect(new UvIndex(6.6).format()).toBe('7');
    });

    describe('describe', () => {
        it.each([
            [0, 'Low'],
            [2, 'Low'],
            [3, 'Moderate'],
            [5, 'Moderate'],
            [6, 'High'],
            [7, 'High'],
            [8, 'Very high'],
            [10, 'Very high'],
            [11, 'Extreme'],
            [12, 'Extreme'],
        ])('describes an index of %i as "%s"', (uvIndex, label) => {
            expect(new UvIndex(uvIndex).describe()).toBe(label);
        });

        it('localises the band via the given catalogue', () => {
            expect(new UvIndex(7, DE_DE).describe()).toBe(DE_DE.uvDescriptions.HIGH);
        });
    });
});
