'use strict';

import Time from './Time.js';
import ClimateSummary from './ClimateSummary.js';
import FloorPlan from './FloorPlan.js';
import { averageTemperature, averageHumidity } from './averageReadings.js';
import MetWeatherTable from './MetWeatherTable.js';
import SmartHomeTemperatureTable from './SmartHomeTemperatureTable.js';
import { smartThingsClimateUrl, metOfficeWeatherUrl } from '../apiConfig.js';
import EN_GB from '../i18n/messages.en-GB.js';

const MS_ONE_MIN = 60 * 1000;
const MS_FIVE_MINS = 5 * MS_ONE_MIN;

export default class SmartHomePage {
    #statusDom;
    #floorPlan;
    #homeTemperatureTableObj;
    #weatherTableObj;
    #catalogue;

    /**
     * @param {String}  statusDomSelector
     * @param {String}  roomsSectionDomSelector
     * @param {String}  homeTemperatureTableDomSelector
     * @param {String}  homeTemperatureTableUpdateDomSelector
     * @param {String}  weatherTableDomSelector
     * @param {String}  weatherTableUpdateDomSelector
     * @param {Object}  catalogue  message catalogue; defaults to en-GB.
     */
    constructor(statusDomSelector, roomsSectionDomSelector, homeTemperatureTableDomSelector, homeTemperatureTableUpdateDomSelector, weatherTableDomSelector, weatherTableUpdateDomSelector, catalogue = EN_GB) {
        this.#catalogue = catalogue;
        this.#statusDom = SmartHomePage.#find(statusDomSelector);
        this.#floorPlan = new FloorPlan(SmartHomePage.#find(roomsSectionDomSelector), undefined, undefined, undefined, catalogue);

        const homeTemperatureTableDom = SmartHomePage.#find(homeTemperatureTableDomSelector);
        const homeTemperatureTableUpdateDom = SmartHomePage.#find(homeTemperatureTableUpdateDomSelector);
        this.#homeTemperatureTableObj = new SmartHomeTemperatureTable(homeTemperatureTableDom, homeTemperatureTableUpdateDom, smartThingsClimateUrl(), catalogue);

        const weatherTableDom = SmartHomePage.#find(weatherTableDomSelector);
        const weatherTableUpdateDom = SmartHomePage.#find(weatherTableUpdateDomSelector);
        this.#weatherTableObj = new MetWeatherTable(weatherTableDom, weatherTableUpdateDom, metOfficeWeatherUrl(), catalogue);
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
        const now = new Time(Date.now(), undefined, this.#catalogue);
        const time = now.formatUserFriendlyHour(false, true);
        const date = now.formatUserFriendlyDate(true);

        const insideTemp = homeData ? averageTemperature(homeData) : null;
        if (!insideTemp || !weatherData) {
            this.#statusDom.textContent = this.#catalogue.statusLine(time, date, null);
            return;
        }

        const insideHumidity = averageHumidity(homeData);
        const summary = new ClimateSummary(
            insideTemp.value,
            insideHumidity ? insideHumidity.value : null,
            weatherData['temp'],
            weatherData['humidity'] ?? null,
            weatherData['dew_point'] ?? null,
            this.#catalogue
        );
        let statusLine = this.#catalogue.statusLine(time, date, summary.format());
        if (summary.shouldOpenWindow()) {
            statusLine += ' ' + this.#catalogue.windowAdvice;
        }
        this.#statusDom.textContent = statusLine;
    }
}
