import { describe, it, expect } from 'vitest';
import formatDateRange from './DateRange.js';
import EN_GB from '../i18n/messages.en-GB.js';
import DE_DE from '../i18n/messages.de-DE.js';
import ES_ES from '../i18n/messages.es-ES.js';

describe('formatDateRange', () => {
    describe('en-GB', () => {
        it('formats a month-known range with years and months (short units)', () => {
            expect(formatDateRange(EN_GB, '2022-08', '2026-04')).toBe('Aug 2022 – Apr 2026 (3 yrs 9 mths)');
        });

        it('formats a year-only range (whole years, inclusive)', () => {
            expect(formatDateRange(EN_GB, '2001', '2006')).toBe('2001 – 2006 (6 yrs)');
        });

        it('drops the months when the duration is whole years', () => {
            expect(formatDateRange(EN_GB, '2002-01', '2004-12')).toBe('Jan 2002 – Dec 2004 (3 yrs)');
        });

        it('shows only months for a sub-year range', () => {
            expect(formatDateRange(EN_GB, '2020-11', '2021-07')).toBe('Nov 2020 – Jul 2021 (9 mths)');
        });

        it('uses singular units for exactly one year / one month', () => {
            expect(formatDateRange(EN_GB, '2021-08', '2022-07')).toBe('Aug 2021 – Jul 2022 (1 yr)');
            expect(formatDateRange(EN_GB, '2006-07', '2007-08')).toBe('Jul 2006 – Aug 2007 (1 yr 2 mths)');
        });

        it('renders an ongoing role (empty end) as "now" with a live duration', () => {
            // Fixed "now" so the count is deterministic: Jul 2026.
            const now = new Date(Date.UTC(2026, 6, 15));
            expect(formatDateRange(EN_GB, '2022-08', '', now)).toBe('Aug 2022 – now (4 yrs)');
        });
    });

    describe('other locales', () => {
        it('localises months and duration for de-DE', () => {
            const out = formatDateRange(DE_DE, '2022-08', '2026-04');
            expect(out).toContain('2022');
            expect(out).toContain('2026');
            expect(out).toContain('(3 J, 9 Mon.)');
        });

        it('uses the locale month rendering (Spanish "de") and duration', () => {
            const out = formatDateRange(ES_ES, '2022-08', '2026-04');
            expect(out).toContain('(3 a 9 m.)');
        });

        it('uses the localised "now" word for an ongoing role', () => {
            const now = new Date(Date.UTC(2026, 6, 15));
            expect(formatDateRange(DE_DE, '2022-08', '', now)).toContain('heute');
            expect(formatDateRange(ES_ES, '2022-08', '', now)).toContain('actualidad');
        });
    });
});
