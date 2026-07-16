import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { tableUpdate, homeTableArgs, weatherTableArgs, lastData } = vi.hoisted(() => ({
    tableUpdate: vi.fn(() => Promise.resolve()),
    homeTableArgs: [],
    weatherTableArgs: [],
    lastData: { home: null, weather: null },
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

const SELECTORS = ['#clock', '#summary', '#home', '#home-u', '#weather', '#weather-u'];

function setupDom() {
    document.body.innerHTML = `
        <span id="clock"></span>
        <p id="summary"></p>
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
    homeTableArgs.length = 0;
    weatherTableArgs.length = 0;
    lastData.home = null;
    lastData.weather = null;
});

describe('SmartHomePage', () => {
    describe('constructor', () => {
        it('throws when a selector matches no element', () => {
            document.body.innerHTML = '';
            expect(() => newPage()).toThrow('Found no DOM element matching selector "#clock"');
        });

        it('constructs when every selector resolves', () => {
            expect(() => newPage()).not.toThrow();
        });
    });

    describe('runAll', () => {
        it('updates the clock and both tables', async () => {
            const page = newPage();
            await page.runAll();

            expect(document.querySelector('#clock').textContent).not.toBe('');
            expect(tableUpdate).toHaveBeenCalledWith('home');
            expect(tableUpdate).toHaveBeenCalledWith('weather');
            expect(tableUpdate).toHaveBeenCalledTimes(2);
        });
    });

    describe('climate summary', () => {
        it('shows a comparison once both tables have loaded', async () => {
            lastData.home = { averageTempDegrees: 26.6, averageHumidity: 52.8 };
            lastData.weather = { temp: 25, humidity: 42.6 };

            const page = newPage();
            await page.runAll();

            const summary = document.querySelector('#summary');
            expect(summary.style.display).toBe('block');
            expect(summary.textContent).toBe("It's 1.6°c warmer inside (26.6°c inside, 25.0°c outside), and 10.2% more humid (52.8% inside, 42.6% outside).");
        });

        it('stays hidden when the weather fetch failed', async () => {
            lastData.home = { averageTempDegrees: 26.6, averageHumidity: 52.8 };
            lastData.weather = null;

            const page = newPage();
            await page.runAll();

            const summary = document.querySelector('#summary');
            expect(summary.style.display).toBe('none');
            expect(summary.textContent).toBe('');
        });

        it('stays hidden when the inside fetch failed', async () => {
            lastData.home = null;
            lastData.weather = { temp: 25, humidity: 42.6 };

            const page = newPage();
            await page.runAll();

            expect(document.querySelector('#summary').style.display).toBe('none');
        });

        it('compares temperature only when either humidity is missing', async () => {
            lastData.home = { averageTempDegrees: 26.6 };
            lastData.weather = { temp: 25 };

            const page = newPage();
            await page.runAll();

            const summary = document.querySelector('#summary');
            expect(summary.style.display).toBe('block');
            expect(summary.textContent).toBe("It's 1.6°c warmer inside (26.6°c inside, 25.0°c outside).");
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
