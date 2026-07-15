import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { tableUpdate, homeTableArgs, weatherTableArgs } = vi.hoisted(() => ({
    tableUpdate: vi.fn(() => Promise.resolve()),
    homeTableArgs: [],
    weatherTableArgs: [],
}));

vi.mock('./SmartHomeTemperatureTable.js', () => ({
    default: class {
        constructor(...args) {
            homeTableArgs.push(args);
        }
        update() {
            return tableUpdate('home');
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
    },
}));

import SmartHomePage from './SmartHomePage.js';

const SELECTORS = ['#clock', '#home', '#home-u', '#weather', '#weather-u'];

function setupDom() {
    document.body.innerHTML = `
        <span id="clock"></span>
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

            expect(homeTableArgs.at(-1)[2]).toBe('https://cdn.christianbrown.uk/get-smart-home-temps');
            expect(weatherTableArgs.at(-1)[2]).toBe('https://cdn.christianbrown.uk/get-met-office-temps');
        });
    });
});
