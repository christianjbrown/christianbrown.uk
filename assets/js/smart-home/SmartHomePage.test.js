import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { tableUpdate, homeTableArgs, weatherTableArgs, lastData, floorPlanRender } = vi.hoisted(() => ({
    tableUpdate: vi.fn(() => Promise.resolve()),
    homeTableArgs: [],
    weatherTableArgs: [],
    lastData: { home: null, weather: null },
    floorPlanRender: vi.fn(),
}));

vi.mock('./FloorPlan.js', () => ({
    default: class {
        render(...args) {
            floorPlanRender(...args);
        }
    },
}));

vi.mock('./SmartHomeTemperatureTable.js', () => ({
    default: class {
        constructor(...args) {
            homeTableArgs.push(args);
        }
        update() {
            return tableUpdate('home');
        }
        getLastData() {
            return lastData.home;
        }
    },
}));

vi.mock('./MetWeatherTable.js', () => ({
    default: class {
        constructor(...args) {
            weatherTableArgs.push(args);
        }
        update() {
            return tableUpdate('weather');
        }
        getLastData() {
            return lastData.weather;
        }
    },
}));

import SmartHomePage from './SmartHomePage.js';

const SELECTORS = ['#status', '#rooms', '#home', '#home-u', '#weather', '#weather-u'];

const SMART_THINGS_PROD_URL = 'https://cdn.christianbrown.uk/get-smartthings-climate';
const SMART_THINGS_DEV_URL = 'http://127.0.0.1:8080';
const MET_OFFICE_PROD_URL = 'https://cdn.christianbrown.uk/get-met-office-weather';
const MET_OFFICE_DEV_URL = 'http://127.0.0.1:8081';

// Stand in for the inert JSON config block the Jekyll layout renders into the
// page (see apiConfig.js). Replaces any existing block so a test can flip a
// per-api `useLocal` flag.
function injectApiConfig({ smartThingsUseLocal = false, metOfficeUseLocal = false } = {}) {
    document.getElementById('api-config')?.remove();
    const el = document.createElement('script');
    el.type = 'application/json';
    el.id = 'api-config';
    el.textContent = JSON.stringify({
        smartThingsClimate: { urlProd: SMART_THINGS_PROD_URL, urlDev: SMART_THINGS_DEV_URL, useLocal: smartThingsUseLocal },
        metOfficeWeather: { urlProd: MET_OFFICE_PROD_URL, urlDev: MET_OFFICE_DEV_URL, useLocal: metOfficeUseLocal },
    });
    document.body.appendChild(el);
}

function setupDom() {
    document.body.innerHTML = `
        <p id="status"></p>
        <div id="rooms"></div>
        <table id="home"></table>
        <span id="home-u"></span>
        <table id="weather"></table>
        <span id="weather-u"></span>`;
    injectApiConfig();
}

function newPage() {
    return new SmartHomePage(...SELECTORS);
}

beforeEach(() => {
    setupDom();
    tableUpdate.mockClear();
    floorPlanRender.mockClear();
    homeTableArgs.length = 0;
    weatherTableArgs.length = 0;
    lastData.home = null;
    lastData.weather = null;
});

describe('SmartHomePage', () => {
    describe('constructor', () => {
        it('throws when a selector matches no element', () => {
            document.body.innerHTML = '';
            expect(() => newPage()).toThrow('Found no DOM element matching selector "#status"');
        });

        it('constructs when every selector resolves', () => {
            expect(() => newPage()).not.toThrow();
        });
    });

    describe('runAll', () => {
        it('renders the status line and updates both tables', async () => {
            const page = newPage();
            await page.runAll();

            expect(document.querySelector('#status').textContent).not.toBe('');
            expect(tableUpdate).toHaveBeenCalledWith('home');
            expect(tableUpdate).toHaveBeenCalledWith('weather');
            expect(tableUpdate).toHaveBeenCalledTimes(2);
        });

        it('renders the floor plan with the latest data', async () => {
            lastData.home = { averageTempDegrees: 26.6, devices: [] };
            lastData.weather = { temp: 25 };

            await newPage().runAll();

            expect(floorPlanRender).toHaveBeenCalledWith(lastData.home, lastData.weather);
        });
    });

    describe('status line', () => {
        const statusText = () => document.querySelector('#status').textContent;

        // A single indoor device the front-end averages into the given readings.
        const homeWith = (temperatureValue, humidityValue) => ({
            devices: [{
                temperatureValue, temperatureStale: false, temperatureTimestamp: 1,
                ...(humidityValue === undefined ? {} : { humidityValue, humidityStale: false, humidityTimestamp: 1 }),
            }],
        });

        it('weaves the climate comparison into the time once both tables have loaded', async () => {
            lastData.home = homeWith(26.6, 52.8);
            lastData.weather = { temp: 25, humidity: 42.6 };

            await newPage().runAll();

            expect(statusText()).toMatch(/^It's currently .+ in my London home, where it's 1\.6°c warmer inside/);
            expect(statusText()).toContain("where it's 1.6°c warmer inside (26.6°c inside, 25°c outside), and 10.2% more humid (52.8% inside, 42.6% outside).");
        });

        it('appends the open-a-window advice when the climate favours it', async () => {
            // Warm and humid inside (dew point ~17°C), markedly drier air outside
            // and mild -> the muggy-inside rule fires.
            lastData.home = homeWith(24, 65);
            lastData.weather = { temp: 20, humidity: 50, dew_point: 14 };

            await newPage().runAll();

            expect(statusText()).toContain('Probably best to open a window.');
        });

        it('adds no advice when the outdoor air is no drier than inside', async () => {
            lastData.home = homeWith(24, 65);
            lastData.weather = { temp: 20, humidity: 50, dew_point: 17 };

            await newPage().runAll();

            expect(statusText()).not.toContain('open a window');
        });

        it('falls back to just the time when the weather fetch failed', async () => {
            lastData.home = homeWith(26.6, 52.8);
            lastData.weather = null;

            await newPage().runAll();

            expect(statusText()).toMatch(/^It's currently .+ in my London home\.$/);
            expect(statusText()).not.toContain('humid');
        });

        it('falls back to just the time when the inside fetch failed', async () => {
            lastData.home = null;
            lastData.weather = { temp: 25, humidity: 42.6 };

            await newPage().runAll();

            expect(statusText()).toMatch(/^It's currently .+ in my London home\.$/);
        });

        it('compares temperature only when either humidity is missing', async () => {
            lastData.home = homeWith(26.6);
            lastData.weather = { temp: 25 };

            await newPage().runAll();

            expect(statusText()).toMatch(/^It's currently .+ in my London home, where it's 1\.6°c warmer inside/);
            expect(statusText()).toContain("where it's 1.6°c warmer inside (26.6°c inside, 25°c outside).");
            expect(statusText()).not.toContain('humid');
        });

        it('falls back to just the time when the indoor data carries no usable readings', async () => {
            lastData.home = {};
            lastData.weather = { temp: 25, humidity: 42.6 };

            await newPage().runAll();

            expect(statusText()).toMatch(/^It's currently .+ in my London home\.$/);
        });
    });

    describe('setupSchedule', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('refreshes the home table every minute and the weather every five', async () => {
            const page = newPage();
            page.setupSchedule();

            await vi.advanceTimersByTimeAsync(60 * 1000);
            expect(tableUpdate).toHaveBeenCalledWith('home');
            expect(tableUpdate).not.toHaveBeenCalledWith('weather');

            await vi.advanceTimersByTimeAsync(4 * 60 * 1000);
            expect(tableUpdate).toHaveBeenCalledWith('weather');
        });
    });

    describe('API URL selection', () => {
        it('uses the prod cdn urls by default', () => {
            // setupDom (beforeEach) injects the default config: both flags off.
            newPage();

            expect(homeTableArgs.at(-1)[2]).toBe(SMART_THINGS_PROD_URL);
            expect(weatherTableArgs.at(-1)[2]).toBe(MET_OFFICE_PROD_URL);
        });

        it('uses each api\'s dev url when its use-local flag is set', () => {
            injectApiConfig({ smartThingsUseLocal: true, metOfficeUseLocal: true });
            newPage();

            expect(homeTableArgs.at(-1)[2]).toBe(SMART_THINGS_DEV_URL);
            expect(weatherTableArgs.at(-1)[2]).toBe(MET_OFFICE_DEV_URL);
        });

        it('switches each api independently', () => {
            injectApiConfig({ smartThingsUseLocal: true, metOfficeUseLocal: false });
            newPage();

            expect(homeTableArgs.at(-1)[2]).toBe(SMART_THINGS_DEV_URL);
            expect(weatherTableArgs.at(-1)[2]).toBe(MET_OFFICE_PROD_URL);
        });
    });
});
