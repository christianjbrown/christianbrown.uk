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

import { initHomeTemperatureLink } from './index.js';

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
});
