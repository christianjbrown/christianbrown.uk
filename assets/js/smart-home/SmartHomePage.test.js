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

function setupDom() {
    document.body.innerHTML = `
        <p id="status"></p>
        <div id="rooms"></div>
        <table id="home"></table>
        <span id="home-u"></span>
        <table id="weather"></table>
        <span id="weather-u"></span>`;
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
        afterEach(() => {
            vi.unstubAllGlobals();
            vi.resetModules();
        });

        async function constructOn(host) {
            vi.stubGlobal('location', { host });
            vi.resetModules();
            const { default: FreshSmartHomePage } = await import('./SmartHomePage.js');
            setupDom();
            new FreshSmartHomePage(...SELECTORS);
        }

        it('uses the dev API urls on the local jekyll host', async () => {
            await constructOn('127.0.0.1:4000');

            expect(homeTableArgs.at(-1)[2]).toBe('http://127.0.0.1:8080');
            expect(weatherTableArgs.at(-1)[2]).toBe('http://127.0.0.1:8081');
        });

        it('uses the prod cdn urls on any other host', async () => {
            await constructOn('christianbrown.uk');

            expect(homeTableArgs.at(-1)[2]).toBe('https://cdn.christianbrown.uk/get-smartthings-climate');
            expect(weatherTableArgs.at(-1)[2]).toBe('https://cdn.christianbrown.uk/get-met-office-weather');
        });
    });
});
