import { describe, it, expect, beforeEach, vi } from 'vitest';

import SmartHomePageFactory from './SmartHomePageFactory.js';
import SmartHomePage from './SmartHomePage.js';
import SmartHomeTemperatureTable, { CLIMATE_CONTRACT } from './SmartHomeTemperatureTable.js';
import MetWeatherTable, { MET_WEATHER_CONTRACT } from './MetWeatherTable.js';
import EN_GB from '../i18n/messages.en-GB.js';

const CLIMATE_URL = 'https://cdn.example.com/climate';
const WEATHER_URL = 'https://cdn.example.com/weather';
const SELECTORS = ['#status', '#rooms', '#home', '#home-u', '#weather', '#weather-u'];
const clock = { now: () => Date.parse('2023-11-20T12:00:00Z') };

let tableFactory;
let factory;

beforeEach(() => {
    document.body.innerHTML = `
        <p id="status"></p>
        <div id="rooms"></div>
        <table id="home"></table>
        <span id="home-u"></span>
        <table id="weather"></table>
        <span id="weather-u"></span>`;
    tableFactory = { create: vi.fn(() => ({ update: () => Promise.resolve(), getLastData: () => null })) };
    factory = new SmartHomePageFactory(document, clock, tableFactory, CLIMATE_URL, WEATHER_URL);
});

describe('SmartHomePageFactory', () => {
    it('builds a page when every selector resolves', () => {
        expect(factory.create(...SELECTORS, EN_GB)).toBeInstanceOf(SmartHomePage);
    });

    it.each(SELECTORS)('throws when the selector %s matches no element', (selector) => {
        document.querySelector(selector).remove();

        expect(() => factory.create(...SELECTORS, EN_GB)).toThrow(`Found no DOM element matching selector "${selector}"`);
    });

    it('gives the climate table its element, URL and contract', () => {
        factory.create(...SELECTORS, EN_GB);

        expect(tableFactory.create).toHaveBeenCalledWith(
            SmartHomeTemperatureTable,
            document.querySelector('#home'),
            document.querySelector('#home-u'),
            CLIMATE_URL,
            CLIMATE_CONTRACT,
            EN_GB,
        );
    });

    it('gives the weather table its element, URL and contract', () => {
        factory.create(...SELECTORS, EN_GB);

        expect(tableFactory.create).toHaveBeenCalledWith(
            MetWeatherTable,
            document.querySelector('#weather'),
            document.querySelector('#weather-u'),
            WEATHER_URL,
            MET_WEATHER_CONTRACT,
            EN_GB,
        );
    });
});
