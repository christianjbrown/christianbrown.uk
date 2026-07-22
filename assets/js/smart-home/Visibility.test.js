import { describe, it, expect } from 'vitest';
import Visibility from './Visibility.js';
import DE_DE from '../i18n/messages.de-DE.js';

const NBSP = String.fromCharCode(0xA0);
const stripNbsp = (text) => text.split(NBSP).join(String.fromCharCode(0x20));

describe('Visibility', () => {
    it('shows metres below a kilometre', () => {
        expect(stripNbsp(new Visibility(800).format())).toBe('800 m');
    });

    it('shows kilometres at exactly a kilometre', () => {
        expect(stripNbsp(new Visibility(1000).format())).toBe('1 km');
    });

    it('shows metres just below a kilometre', () => {
        expect(stripNbsp(new Visibility(999).format())).toBe('999 m');
    });

    it('rounds kilometres to one decimal place', () => {
        expect(stripNbsp(new Visibility(12500).format())).toBe('12.5 km');
    });

    it('drops a trailing zero on whole kilometres', () => {
        expect(stripNbsp(new Visibility(12000).format())).toBe('12 km');
    });

    it('couples the figure and unit with a non-breaking space', () => {
        expect(new Visibility(800).format()).toBe(`800${NBSP}m`);
    });

    it('uses the given locale decimal separator', () => {
        expect(stripNbsp(new Visibility(12500, DE_DE).format())).toBe('12,5 km');
    });
});
