import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import SmartHomePage from './SmartHomePage.js';
import EN_GB from '../i18n/messages.en-GB.js';

const NOW = Date.parse('2023-11-20T12:00:00Z');
const clock = { now: () => NOW };

const tableUpdate = vi.fn(() => Promise.resolve());
const floorPlanRender = vi.fn();
const lastData = { home: null, weather: null };

function fakeTable(name) {
    return {
        update: () => tableUpdate(name),
        getLastData: () => lastData[name],
    };
}

function newPage() {
    const statusDom = document.querySelector('#status');
    return new SmartHomePage(statusDom, { render: floorPlanRender }, fakeTable('home'), fakeTable('weather'), EN_GB, clock);
}

beforeEach(() => {
    document.body.innerHTML = '<p id="status"></p>';
    tableUpdate.mockClear();
    floorPlanRender.mockClear();
    lastData.home = null;
    lastData.weather = null;
});

describe('SmartHomePage', () => {
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
            lastData.home = [];
            lastData.weather = { temp: 25 };

            await newPage().runAll();

            expect(floorPlanRender).toHaveBeenCalledWith(lastData.home, lastData.weather);
        });
    });

    describe('status line', () => {
        const statusText = () => document.querySelector('#status').textContent;

        // A single indoor device the front-end averages into the given readings.
        const homeWith = (temperatureValue, humidityValue) => ([{
            temperatureValue, temperatureStale: false, temperatureTimestamp: 1,
            ...(humidityValue === undefined ? {} : { humidityValue, humidityStale: false, humidityTimestamp: 1 }),
        }]);

        it('weaves the climate comparison into the time once both tables have loaded', async () => {
            lastData.home = homeWith(26.6, 52.8);
            lastData.weather = { temp: 25, humidity: 42.6 };

            await newPage().runAll();

            expect(statusText()).toMatch(/^It's currently .+ in my London home, where it's 1\.6°C warmer inside/);
            expect(statusText()).toContain("where it's 1.6°C warmer inside (26.6°C inside, 25°C outside), and 10.2% more humid (52.8% inside, 42.6% outside).");
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

            expect(statusText()).toMatch(/^It's currently .+ in my London home, where it's 1\.6°C warmer inside/);
            expect(statusText()).toContain("where it's 1.6°C warmer inside (26.6°C inside, 25°C outside).");
            expect(statusText()).not.toContain('humid');
        });

        it('falls back to just the time when the indoor data carries no usable readings', async () => {
            lastData.home = [];
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

    describe('clock', () => {
        it('shows the time the injected clock reports', async () => {
            // 12:00 UTC on 20 November is noon in London.
            await newPage().runAll();

            expect(document.querySelector('#status').textContent).toContain('noon');
            expect(document.querySelector('#status').textContent).toContain('Monday, 20th of November');
        });
    });
});
