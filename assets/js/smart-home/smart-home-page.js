'use strict';

import Time from './time.js';
import WeatherTable from './weather-table.js';
import HomeTemperatureTable from './home-temperature-table.js';

const WEATHER_API_URL_PROD = 'https://cdn.christianbrown.uk/get-met-office-temps';
const HOME_TEMP_API_URL_PROD = 'https://cdn.christianbrown.uk/get-smart-home-temps';

const MS_ONE_MIN = 60 * 1000;
const MS_FIVE_MINS = 5 * MS_ONE_MIN;

export default class SmartHomePage {
    #clockDom;
    #weatherTableObj;
    #homeTemperatureTableObj;

    /**
     * @param {String}  clockDomSelector
     * @param {String}  weatherTableDomSelector
     * @param {String}  homeTemperatureTableDomSelector
     */
    constructor(clockDomSelector, weatherTableDomSelector, homeTemperatureTableDomSelector) {
        this.#clockDom = SmartHomePage.#find(clockDomSelector);

        const weatherTableDom =  SmartHomePage.#find(weatherTableDomSelector);
        this.#weatherTableObj = new WeatherTable(weatherTableDom,WEATHER_API_URL_PROD);

        const homeTemperatureTableDom =  SmartHomePage.#find(homeTemperatureTableDomSelector);
        this.#homeTemperatureTableObj = new HomeTemperatureTable(homeTemperatureTableDom, HOME_TEMP_API_URL_PROD);
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
        this.#clockDom.textContent = (new Time()).formatHour();
    }
}
