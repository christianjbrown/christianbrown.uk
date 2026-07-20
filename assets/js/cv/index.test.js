import { describe, it, expect, beforeEach, vi } from 'vitest';

const { ctor, updateMock } = vi.hoisted(() => ({
    ctor: vi.fn(),
    updateMock: vi.fn(() => Promise.resolve()),
}));

vi.mock('./HomeTemperatureLink.js', () => ({
    default: class {
        constructor(...args) {
            ctor(...args);
        }
        update() {
            return updateMock();
        }
    },
}));

import { initHomeTemperatureLink, localiseHeadings, localiseHomepage, localiseDateRanges } from './index.js';
import DE_DE from '../i18n/messages.de-DE.js';

const SMART_THINGS_PROD_URL = 'https://cdn.christianbrown.uk/get-smartthings-climate';
const SMART_THINGS_DEV_URL = 'http://127.0.0.1:8080';

// Stand in for the inert JSON config block the Jekyll layout renders into the
// page (see apiConfig.js).
function injectApiConfig({ smartThingsUseLocal = false } = {}) {
    document.getElementById('api-config')?.remove();
    const el = document.createElement('script');
    el.type = 'application/json';
    el.id = 'api-config';
    el.textContent = JSON.stringify({
        smartThingsClimate: { urlProd: SMART_THINGS_PROD_URL, urlDev: SMART_THINGS_DEV_URL, useLocal: smartThingsUseLocal },
        metOfficeWeather: { urlProd: 'https://cdn.christianbrown.uk/get-met-office-weather', urlDev: 'http://127.0.0.1:8081', useLocal: false },
    });
    document.body.appendChild(el);
}

beforeEach(() => {
    ctor.mockClear();
    updateMock.mockClear();
    document.body.innerHTML = '';
});

describe('cv/index.js', () => {
    it('constructs the link with the prod url and updates it when the element exists', () => {
        document.body.innerHTML = '<a id="cv-home-temp" hidden></a>';
        injectApiConfig();

        initHomeTemperatureLink();

        expect(ctor).toHaveBeenCalledTimes(1);
        expect(ctor.mock.calls[0][0].id).toBe('cv-home-temp');
        expect(ctor.mock.calls[0][1]).toBe(SMART_THINGS_PROD_URL);
        expect(updateMock).toHaveBeenCalledTimes(1);
    });

    it('uses the dev url when the smart-things use-local flag is set', () => {
        document.body.innerHTML = '<a id="cv-home-temp" hidden></a>';
        injectApiConfig({ smartThingsUseLocal: true });

        initHomeTemperatureLink();

        expect(ctor.mock.calls[0][1]).toBe(SMART_THINGS_DEV_URL);
    });

    it('does nothing when the element is absent', () => {
        injectApiConfig();

        initHomeTemperatureLink();

        expect(ctor).not.toHaveBeenCalled();
        expect(updateMock).not.toHaveBeenCalled();
    });

    describe('localiseHeadings', () => {
        it('sets the CV headings, Download CV label/title/alt and location-pin alts', () => {
            document.body.innerHTML = `
                <h2 id="cv-heading-experience">Professional experience</h2>
                <h2 id="cv-heading-education">Education</h2>
                <a id="cv-menu-download" title="Download CV"><img alt="Download icon"><span id="nav-text-download">Download CV</span></a>
                <img class="cv-experience-company-metadata-location-icon" alt="Location icon">
                <img class="cv-experience-company-metadata-location-icon" alt="Location icon">`;

            localiseHeadings(DE_DE);

            expect(document.querySelector('#cv-heading-experience').textContent).toBe('Berufserfahrung');
            expect(document.querySelector('#cv-heading-education').textContent).toBe('Ausbildung');
            expect(document.querySelector('#nav-text-download').textContent).toBe('Lebenslauf herunterladen');
            expect(document.querySelector('#cv-menu-download').getAttribute('title')).toBe('Lebenslauf herunterladen');
            expect(document.querySelector('#cv-menu-download img').getAttribute('alt')).toBe('Download-Symbol');
            expect([...document.querySelectorAll('.cv-experience-company-metadata-location-icon')].map((el) => el.getAttribute('alt')))
                .toEqual(['Standort-Symbol', 'Standort-Symbol']);
        });

        it('does nothing when the headings are absent', () => {
            expect(() => localiseHeadings(DE_DE)).not.toThrow();
        });
    });

    describe('localiseDateRanges', () => {
        it('localises each date range from its data-start/data-end', () => {
            document.body.innerHTML = `
                <div class="cv-experience-job-metadata-dates" data-start="2022-08" data-end="2026-04">Aug 2022 – Apr 2026 (3 years 9 months)</div>
                <div class="cv-experience-job-metadata-dates" data-start="2001" data-end="2006">2001 – 2006 (6 years)</div>`;

            localiseDateRanges(DE_DE);

            const dates = [...document.querySelectorAll('.cv-experience-job-metadata-dates')].map((el) => el.textContent);
            expect(dates[0]).toContain('3 Jahre');
            expect(dates[0]).toContain('9 Monate');
            expect(dates[1]).toBe('2001 – 2006 (6 Jahre)');
        });

        it('does nothing when there are no date ranges', () => {
            document.body.innerHTML = '';
            expect(() => localiseDateRanges(DE_DE)).not.toThrow();
        });
    });

    describe('localiseHomepage', () => {
        it('resolves the locale, swaps the headings and inits the temperature link', () => {
            document.body.innerHTML = '<h2 id="cv-heading-experience">x</h2><h2 id="cv-heading-education">y</h2><a id="cv-home-temp" hidden></a>';
            injectApiConfig();

            localiseHomepage();

            // jsdom resolves to en-GB, so the headings read their English values.
            expect(document.querySelector('#cv-heading-experience').textContent).toBe('Professional experience');
            expect(document.querySelector('#cv-heading-education').textContent).toBe('Education');
            expect(document.documentElement.lang).toBe('en-GB');
            expect(ctor).toHaveBeenCalledTimes(1);
        });
    });
});
