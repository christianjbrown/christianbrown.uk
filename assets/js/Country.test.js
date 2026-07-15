import { describe, it, expect, afterEach, vi } from 'vitest';
import Country from './Country.js';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Country', () => {
    it('returns the country codes for an explicit timezone', async () => {
        const codes = await new Country().getCountryCodesFromTimezone('Europe/London');
        expect(codes).toContain('GB');
    });

    it('returns an empty array for an unknown timezone', async () => {
        const codes = await new Country().getCountryCodesFromTimezone('Nowhere/Void');
        expect(codes).toEqual([]);
    });

    it('falls back to the resolved system timezone when none is given', async () => {
        vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
            resolvedOptions: () => ({ timeZone: 'Europe/London' }),
        }));
        const codes = await new Country().getCountryCodesFromTimezone();
        expect(codes).toContain('GB');
    });

    it('caches the timezone data across calls on the same instance', async () => {
        const country = new Country();
        const first = await country.getCountryCodesFromTimezone('Europe/London');
        const second = await country.getCountryCodesFromTimezone('Europe/London');
        expect(second).toEqual(first);
        expect(second).toContain('GB');
    });
});
