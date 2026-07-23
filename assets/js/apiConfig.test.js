import { describe, it, expect, afterEach } from 'vitest';

import { smartThingsClimateUrl, metOfficeWeatherUrl, historicalClimateUrl } from './apiConfig.js';

const SMART_THINGS_PROD_URL = 'https://cdn.christianbrown.uk/get-smartthings-climate';
const SMART_THINGS_DEV_URL = 'http://127.0.0.1:8080';
const MET_OFFICE_PROD_URL = 'https://cdn.christianbrown.uk/get-met-office-weather';
const MET_OFFICE_DEV_URL = 'http://127.0.0.1:8081';
const HISTORICAL_PROD_URL = 'https://cdn.christianbrown.uk/get-historical-climate-data';
const HISTORICAL_DEV_URL = 'http://127.0.0.1:8082';

function injectApiConfig({ smartThingsUseLocal = false, metOfficeUseLocal = false, historicalUseLocal = false } = {}) {
    document.getElementById('api-config')?.remove();
    const el = document.createElement('script');
    el.type = 'application/json';
    el.id = 'api-config';
    el.textContent = JSON.stringify({
        smartThingsClimate: { urlProd: SMART_THINGS_PROD_URL, urlDev: SMART_THINGS_DEV_URL, useLocal: smartThingsUseLocal },
        metOfficeWeather: { urlProd: MET_OFFICE_PROD_URL, urlDev: MET_OFFICE_DEV_URL, useLocal: metOfficeUseLocal },
        historicalClimate: { urlProd: HISTORICAL_PROD_URL, urlDev: HISTORICAL_DEV_URL, useLocal: historicalUseLocal },
    });
    document.body.appendChild(el);
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('apiConfig', () => {
    it('returns the production urls when the use-local flags are off', () => {
        injectApiConfig();

        expect(smartThingsClimateUrl()).toBe(SMART_THINGS_PROD_URL);
        expect(metOfficeWeatherUrl()).toBe(MET_OFFICE_PROD_URL);
        expect(historicalClimateUrl()).toBe(HISTORICAL_PROD_URL);
    });

    it('returns the dev urls when the use-local flags are on', () => {
        injectApiConfig({ smartThingsUseLocal: true, metOfficeUseLocal: true, historicalUseLocal: true });

        expect(smartThingsClimateUrl()).toBe(SMART_THINGS_DEV_URL);
        expect(metOfficeWeatherUrl()).toBe(MET_OFFICE_DEV_URL);
        expect(historicalClimateUrl()).toBe(HISTORICAL_DEV_URL);
    });

    it('resolves each api independently of the other', () => {
        injectApiConfig({ smartThingsUseLocal: true, metOfficeUseLocal: false });

        expect(smartThingsClimateUrl()).toBe(SMART_THINGS_DEV_URL);
        expect(metOfficeWeatherUrl()).toBe(MET_OFFICE_PROD_URL);
    });

    it('throws a helpful error when the config block is missing', () => {
        expect(() => smartThingsClimateUrl()).toThrow('Missing API config');
    });
});
