import { describe, it, expect } from 'vitest';

import ReadingFormatter from './ReadingFormatter.js';
import EN_GB from '../i18n/messages.en-GB.js';
import DE_DE from '../i18n/messages.de-DE.js';

// "Now" is fixed at 2023-11-20T12:00:00Z.
const NOW = Date.parse('2023-11-20T12:00:00Z');
const clock = { now: () => NOW };
const unix = (iso) => Math.floor(Date.parse(iso) / 1000);

describe('ReadingFormatter', () => {
    const formatter = new ReadingFormatter(EN_GB, clock);

    describe('timeAgo', () => {
        it('words the age of a Unix timestamp against the injected clock', () => {
            expect(formatter.timeAgo(unix('2023-11-20T11:58:00Z'))).toBe('2 mins ago');
        });
    });

    describe('timeAt', () => {
        it('wraps a Unix timestamp in a Time worded in the catalogue', () => {
            const time = new ReadingFormatter(DE_DE, clock).timeAt(unix('2023-11-20T11:58:00Z'));

            expect(time.formatTimeAgo()).toBe(DE_DE.time.relativeTime(2, 'minute'));
        });
    });

    describe('updatedLabel', () => {
        it('formats the envelope timestamp as an "Updated <time ago>" label', () => {
            expect(formatter.updatedLabel(unix('2023-11-20T11:58:00Z'))).toBe('Updated 2 mins ago');
        });

        it('returns null when there is no timestamp', () => {
            expect(formatter.updatedLabel(null)).toBeNull();
            expect(formatter.updatedLabel()).toBeNull();
        });
    });

    describe('temperature', () => {
        it('gives celsius and fahrenheit', () => {
            expect(formatter.temperature(21)).toEqual({ celsius: '21°C', fahrenheit: '69.8°F' });
        });
    });

    describe('humidity', () => {
        it('gives the percentage and its feel', () => {
            expect(formatter.humidity(50)).toEqual({ value: '50%', description: 'Pleasant' });
        });
    });
});
