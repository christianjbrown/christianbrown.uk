'use strict';

import Time from './Time.js';
import ClimateSummary from './ClimateSummary.js';
import MetWeatherTable from './MetWeatherTable.js';
import SmartHomeTemperatureTable from './SmartHomeTemperatureTable.js';

const isLocal = window.location.host === '127.0.0.1:4000';

const API_SMART_HOME_TEMPS_URL_PROD = 'https://cdn.christianbrown.uk/get-smartthings-climate';
const API_SMART_HOME_TEMPS_URL_DEV = 'http://127.0.0.1:8080';
const API_SMART_HOME_TEMPS_URL = isLocal ? API_SMART_HOME_TEMPS_URL_DEV: API_SMART_HOME_TEMPS_URL_PROD;

const API_MET_OFFICE_URL_PROD = 'https://cdn.christianbrown.uk/get-met-office-weather';
const API_MET_OFFICE_URL_DEV = 'http://127.0.0.1:8081';
const API_MET_OFFICE_URL = isLocal ? API_MET_OFFICE_URL_DEV: API_MET_OFFICE_URL_PROD;

const MS_ONE_MIN = 60 * 1000;
const MS_FIVE_MINS = 5 * MS_ONE_MIN;

export default class SmartHomePage {
    #statusDom;
    #homeTemperatureTableObj;
    #weatherTableObj;

    /**
     * @param {String}  statusDomSelector
     * @param {String}  homeTemperatureTableDomSelector
     * @param {String}  homeTemperatureTableUpdateDomSelector
     * @param {String}  weatherTableDomSelector
     * @param {String}  weatherTableUpdateDomSelector
     */
    constructor(statusDomSelector, homeTemperatureTableDomSelector, homeTemperatureTableUpdateDomSelector, weatherTableDomSelector, weatherTableUpdateDomSelector) {
        this.#statusDom = SmartHomePage.#find(statusDomSelector);

        const homeTemperatureTableDom = SmartHomePage.#find(homeTemperatureTableDomSelector);
        const homeTemperatureTableUpdateDom = SmartHomePage.#find(homeTemperatureTableUpdateDomSelector);
        this.#homeTemperatureTableObj = new SmartHomeTemperatureTable(homeTemperatureTableDom, homeTemperatureTableUpdateDom, API_SMART_HOME_TEMPS_URL);

        const weatherTableDom = SmartHomePage.#find(weatherTableDomSelector);
        const weatherTableUpdateDom = SmartHomePage.#find(weatherTableUpdateDomSelector);
        this.#weatherTableObj = new MetWeatherTable(weatherTableDom, weatherTableUpdateDom, API_MET_OFFICE_URL);
    }

    /**
     * setupSchedule.
     */
    setupSchedule() {
        setInterval(() => this.#update1min(), MS_ONE_MIN);
        setInterval(() => this.#update5min(), MS_FIVE_MINS);
    }

    /**
     * @return {Promise}
     */
    async runAll() {
        // Show the time straight away, then re-render once the tables have
        // loaded so the climate comparison can be woven in.
        this.#renderStatusLine();
        const result = await Promise.all(
            [
                this.#homeTemperatureTableObj.update(),
                this.#weatherTableObj.update(),
            ]
        );
        this.#renderStatusLine();

        return result;
    }

    /**
     * @return {Promise}
     */
    async #update5min() {
        const result = await this.#weatherTableObj.update();
        this.#renderStatusLine();

        return result;
    }

    /**
     * @return {Promise}
     */
    async #update1min() {
        const result = await this.#homeTemperatureTableObj.update();
        this.#renderStatusLine();

        return result;
    }

    /**
     * @param {String} selector
     *
     * @return {HTMLElement}
     */
    static #find(selector) {
        const found = document.querySelector(selector);
        if (!(found instanceof HTMLElement)) {
            throw new Error('Found no DOM element matching selector "'+selector+'"')
        }

        return found;
    }

    /**
     * Renders the status line: the current London time, and — once both APIs
     * have returned successfully — a comparison of the inside and outside
     * climate woven into the same sentence. If either API failed (or has yet to
     * load) it falls back to the time on its own, so the line never empties.
     */
    #renderStatusLine() {
        const time = (new Time()).formatUserFriendlyHour(true, true);
        const homeData = this.#homeTemperatureTableObj.getLastData();
        const weatherData = this.#weatherTableObj.getLastData();

        if (!homeData || !weatherData) {
            this.#statusDom.textContent = `🕐 It's ${time} in London.`;
            return;
        }

        const climate = (new ClimateSummary(
            homeData['averageTempDegrees'],
            homeData['averageHumidity'] ?? null,
            weatherData['temp'],
            weatherData['humidity'] ?? null
        )).format();
        this.#statusDom.textContent = `🕐 At ${time} in London, ${SmartHomePage.#lowercaseFirst(climate)}`;
    }

    /**
     * @param {String} text
     *
     * @return {String}
     */
    static #lowercaseFirst(text) {
        return text.charAt(0).toLowerCase() + text.slice(1);
    }
}
