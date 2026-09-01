import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import Country from './Country.js';

const TIMEZONES = {
    'Europe/London': { c: ['GB'] },
    'America/New_York': { c: ['US'] },
    'Europe/Zurich': { c: ['CH', 'DE'] },
    'Antarctica/Troll': {},
};

let fetchSpy;

beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({ json: async () => TIMEZONES });
    vi.stubGlobal('fetch', fetchSpy);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('Country', () => {
    it('maps an explicit timezone to its country codes', async () => {
        expect(await new Country().getCountryCodesFromTimezone('Europe/London')).toEqual(['GB']);
    });

    it('returns every country code for a timezone that spans more than one', async () => {
        expect(await new Country().getCountryCodesFromTimezone('Europe/Zurich')).toEqual(['CH', 'DE']);
    });

    it('falls back to the runtime timezone when none is given', async () => {
        vi.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
            resolvedOptions: () => ({ timeZone: 'America/New_York' }),
        });

        expect(await new Country().getCountryCodesFromTimezone()).toEqual(['US']);
    });

    it('returns an empty list for an unknown timezone', async () => {
        expect(await new Country().getCountryCodesFromTimezone('Mars/Olympus_Mons')).toEqual([]);
    });

    it('returns an empty list for a timezone with no country codes', async () => {
        expect(await new Country().getCountryCodesFromTimezone('Antarctica/Troll')).toEqual([]);
    });

    it('fetches the timezone table from the site root', async () => {
        await new Country().getCountryCodesFromTimezone('Europe/London');

        expect(fetchSpy).toHaveBeenCalledWith('/assets/data/timezones.json');
    });

    it('fetches the timezone table only once per instance', async () => {
        const country = new Country();
        await country.getCountryCodesFromTimezone('Europe/London');
        await country.getCountryCodesFromTimezone('America/New_York');

        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
});
