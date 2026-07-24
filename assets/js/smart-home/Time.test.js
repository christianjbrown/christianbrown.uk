import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Time from './Time.js';
import ZH_TW from '../i18n/messages.zh-TW.js';

const utc = (y, mo, d, h, mi) => Date.UTC(y, mo, d, h, mi);

describe('Time', () => {
    describe('formatTimeAgo', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            // A fixed "now" so elapsed times are deterministic.
            vi.setSystemTime(new Date(utc(2023, 10, 20, 12, 0)));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        const ago = (seconds) => new Time(Date.now() - seconds * 1000).formatTimeAgo();

        it('reports seconds, pluralising when not exactly one', () => {
            expect(ago(0)).toBe('just now');
            expect(ago(1)).toBe('1 sec ago');
            expect(ago(30)).toBe('30 secs ago');
            expect(ago(59)).toBe('59 secs ago');
        });

        it('reports minutes, pluralising when not exactly one', () => {
            expect(ago(60)).toBe('1 min ago');
            expect(ago(60 * 5)).toBe('5 mins ago');
            expect(ago(3599)).toBe('59 mins ago');
        });

        it('reports hours, pluralising when not exactly one', () => {
            expect(ago(3600)).toBe('1 hr ago');
            expect(ago(3600 * 2)).toBe('2 hrs ago');
            expect(ago(86399)).toBe('23 hrs ago');
        });

        it('reports days, pluralising when not exactly one', () => {
            expect(ago(86400)).toBe('1 day ago');
            expect(ago(86400 * 3)).toBe('3 days ago');
        });
    });

    describe('formatUserFriendlyHour', () => {
        it('renders midnight and noon as words', () => {
            expect(new Time(utc(2023, 10, 20, 0, 0), 'UTC').formatUserFriendlyHour()).toBe('midnight');
            expect(new Time(utc(2023, 10, 20, 12, 0), 'UTC').formatUserFriendlyHour()).toBe('noon');
        });

        it('zero-pads morning hours and minutes without a pm suffix', () => {
            expect(new Time(utc(2023, 10, 20, 9, 5), 'UTC').formatUserFriendlyHour()).toBe('09:05');
        });

        it('adds a 12-hour pm suffix in the afternoon (with minutes)', () => {
            expect(new Time(utc(2023, 10, 20, 14, 30), 'UTC').formatUserFriendlyHour()).toBe('14:30 (2:30pm)');
        });

        it('omits the minutes from the pm suffix on the hour', () => {
            expect(new Time(utc(2023, 10, 20, 13, 0), 'UTC').formatUserFriendlyHour()).toBe('13:00 (1pm)');
        });

        it('does not add a pm suffix at midday past the hour', () => {
            expect(new Time(utc(2023, 10, 20, 12, 30), 'UTC').formatUserFriendlyHour()).toBe('12:30');
        });

        it('extracts a 24-hour numeric hour for locales that default to 12-hour (zh-TW)', () => {
            // Without hourCycle 'h23', zh-TW formats the hour as "上午12時" /
            // "下午1時", which parseInt reads as NaN → "NaN:30".
            expect(new Time(utc(2023, 10, 20, 14, 30), 'UTC', ZH_TW).formatUserFriendlyHour()).toBe('14:30');
            expect(new Time(utc(2023, 10, 20, 0, 39), 'UTC', ZH_TW).formatUserFriendlyHour()).toBe('00:39');
        });

        describe('includeTimezone', () => {
            it('appends the timezone abbreviation after the time', () => {
                // 09:05 UTC in winter is 09:05 GMT in London.
                expect(new Time(utc(2023, 10, 20, 9, 5), 'Europe/London').formatUserFriendlyHour(false, true))
                    .toBe('09:05 GMT');
                // 09:05 UTC in summer is 10:05 BST in London.
                expect(new Time(utc(2023, 5, 20, 9, 5), 'Europe/London').formatUserFriendlyHour(false, true))
                    .toBe('10:05 BST');
            });

            it('places the timezone between the time and the date', () => {
                expect(new Time(utc(2023, 10, 20, 9, 5), 'Europe/London').formatUserFriendlyHour(true, true))
                    .toBe('09:05 GMT on Mon 20th Nov');
            });
        });

        describe('formatUserFriendlyDate', () => {
            it('returns the short weekday, ordinal day of month and month by default', () => {
                expect(new Time(utc(2023, 10, 20, 9, 5), 'UTC').formatUserFriendlyDate()).toBe('Mon 20th Nov');
                expect(new Time(utc(2023, 0, 1, 10, 15), 'UTC').formatUserFriendlyDate()).toBe('Sun 1st Jan');
            });

            it('returns a long form when asked', () => {
                expect(new Time(utc(2023, 10, 20, 9, 5), 'UTC').formatUserFriendlyDate(true)).toBe('Monday, 20th of November');
                expect(new Time(utc(2023, 0, 1, 10, 15), 'UTC').formatUserFriendlyDate(true)).toBe('Sunday, 1st of January');
            });
        });

        describe('getTimezoneAbbreviation', () => {
            it('returns GMT in winter and BST in summer for London', () => {
                expect(new Time(utc(2023, 0, 15, 12, 0), 'Europe/London').getTimezoneAbbreviation()).toBe('GMT');
                expect(new Time(utc(2023, 6, 15, 12, 0), 'Europe/London').getTimezoneAbbreviation()).toBe('BST');
            });
        });

        describe('includeDate', () => {
            const withDate = (day) => new Time(utc(2023, 0, day, 10, 15), 'UTC').formatUserFriendlyHour(true);

            it('appends the weekday, day of month and month', () => {
                expect(new Time(utc(2023, 10, 20, 9, 5), 'UTC').formatUserFriendlyHour(true))
                    .toBe('09:05 on Mon 20th Nov');
            });

            it('uses "st" for 1 and 21 but not 11', () => {
                expect(withDate(1)).toBe('10:15 on Sun 1st Jan');
                expect(withDate(21)).toBe('10:15 on Sat 21st Jan');
                expect(withDate(11)).toBe('10:15 on Wed 11th Jan');
            });

            it('uses "nd" for 2 and 22 but not 12', () => {
                expect(withDate(2)).toBe('10:15 on Mon 2nd Jan');
                expect(withDate(22)).toBe('10:15 on Sun 22nd Jan');
                expect(withDate(12)).toBe('10:15 on Thu 12th Jan');
            });

            it('uses "rd" for 3 and 23 but not 13', () => {
                expect(withDate(3)).toBe('10:15 on Tue 3rd Jan');
                expect(withDate(23)).toBe('10:15 on Mon 23rd Jan');
                expect(withDate(13)).toBe('10:15 on Fri 13th Jan');
            });

            it('uses "th" for other days', () => {
                expect(withDate(4)).toBe('10:15 on Wed 4th Jan');
                expect(withDate(31)).toBe('10:15 on Tue 31st Jan');
            });
        });
    });

    describe('constructor defaults', () => {
        it('defaults the timestamp to now', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(utc(2023, 10, 20, 12, 0)));
            // No timestamp -> uses Date.now(); "now" formatted is "just now".
            expect(new Time().formatTimeAgo()).toBe('just now');
            vi.useRealTimers();
        });
    });
});
