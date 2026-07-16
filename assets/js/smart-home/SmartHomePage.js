'use strict';

import Time from './Time.js';
import ClimateSummary from './ClimateSummary.js';
import FloorPlan from './FloorPlan.js';
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
    #floorPlan;
    #homeTemperatureTableObj;
    #weatherTableObj;

    /**
     * @param {String}  statusDomSelector
     * @param {String}  roomsSectionDomSelector
     * @param {String}  homeTemperatureTableDomSelector
     * @param {String}  homeTemperatureTableUpdateDomSelector
     * @param {String}  weatherTableDomSelector
     * @param {String}  weatherTableUpdateDomSelector
     */
    constructor(statusDomSelector, roomsSectionDomSelector, homeTemperatureTableDomSelector, homeTemperatureTableUpdateDomSelector, weatherTableDomSelector, weatherTableUpdateDomSelector) {
        this.#statusDom = SmartHomePage.#find(statusDomSelector);
        this.#floorPlan = new FloorPlan(SmartHomePage.#find(roomsSectionDomSelector));

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
        // Show the time straight away, then re-render as each table resolves
        // (rather than only once both have) so the Rooms section can appear as
        // soon as the indoor data lands, with the outside reading following
        // when the weather arrives.
        this.#render();

        return Promise.all(
            [
                this.#homeTemperatureTableObj.update().then(() => this.#render()),
                this.#weatherTableObj.update().then(() => this.#render()),
            ]
        );
    }

    /**
     * @return {Promise}
     */
    async #update5min() {
        const result = await this.#weatherTableObj.update();
        this.#render();

        return result;
    }

    /**
     * @return {Promise}
     */
    async #update1min() {
        const result = await this.#homeTemperatureTableObj.update();
        this.#render();

        return result;
    }

    /**
     * Re-renders everything that depends on the latest data: the status line
     * and the floor-plan labels.
     */
    #render() {
        const homeData = this.#homeTemperatureTableObj.getLastData();
        const weatherData = this.#weatherTableObj.getLastData();

        this.#renderStatusLine(homeData, weatherData);
        this.#floorPlan.render(homeData, weatherData);
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
    #renderStatusLine(homeData, weatherData) {
        const now = new Time();
        const when = `It's currently ${now.formatUserFriendlyHour(false, true)} on ${now.formatUserFriendlyDate(true)} in my London home`;

        if (!homeData || !weatherData) {
            this.#statusDom.textContent = `${when}.`;
            return;
        }

        const climate = (new ClimateSummary(
            homeData['averageTempDegrees'],
            homeData['averageHumidity'] ?? null,
            weatherData['temp'],
            weatherData['humidity'] ?? null
        )).format();
        this.#statusDom.textContent = `${when}, where ${SmartHomePage.#lowercaseFirst(climate)}`;
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
