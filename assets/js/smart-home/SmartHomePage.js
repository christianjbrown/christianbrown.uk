'use strict';

import Time from './Time.js';
import MetWeatherTable from './MetWeatherTable.js';
import SmartHomeTemperatureTable from './SmartHomeTemperatureTable.js';

const isLocal = window.location.host === '127.0.0.1:4000';

const API_SMART_HOME_TEMPS_URL_PROD = 'https://cdn.christianbrown.uk/get-smartthings-climate';
const API_SMART_HOME_TEMPS_URL_DEV = 'http://127.0.0.1:8080';
const API_SMART_HOME_TEMPS_URL = isLocal ? API_SMART_HOME_TEMPS_URL_DEV: API_SMART_HOME_TEMPS_URL_PROD;

const API_MET_OFFICE_URL_PROD = 'https://cdn.christianbrown.uk/get-met-office-temps';
const API_MET_OFFICE_URL_DEV = 'http://127.0.0.1:8081';
const API_MET_OFFICE_URL = isLocal ? API_MET_OFFICE_URL_DEV: API_MET_OFFICE_URL_PROD;

const MS_ONE_MIN = 60 * 1000;
const MS_FIVE_MINS = 5 * MS_ONE_MIN;

export default class SmartHomePage {
    #clockDom;
    #homeTemperatureTableObj;
    #weatherTableObj;

    /**
     * @param {String}  clockDomSelector
     * @param {String}  homeTemperatureTableDomSelector
     * @param {String}  homeTemperatureTableUpdateDomSelector
     * @param {String}  weatherTableDomSelector
     * @param {String}  weatherTableUpdateDomSelector
     */
    constructor(clockDomSelector, homeTemperatureTableDomSelector, homeTemperatureTableUpdateDomSelector, weatherTableDomSelector, weatherTableUpdateDomSelector) {
        this.#clockDom = SmartHomePage.#find(clockDomSelector);

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
        return Promise.all(
            [
                this.#updateClock(),
                this.#homeTemperatureTableObj.update(),
                this.#weatherTableObj.update(),
            ]
        );
    }

    /**
     * @return {Promise}
     */
    async #update5min() {
        return this.#weatherTableObj.update();
    }

    /**
     * @return {Promise}
     */
    async #update1min() {
        return Promise.all(
            [
                this.#updateClock(),
                this.#homeTemperatureTableObj.update(),
            ]
        );
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

    async #updateClock() {
        this.#clockDom.textContent = (new Time()).formatUserFriendlyHour(true);
    }
}
