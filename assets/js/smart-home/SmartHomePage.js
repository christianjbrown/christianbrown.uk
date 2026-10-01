'use strict';

import Time from './Time.js';
import ClimateSummary from './ClimateSummary.js';
import { averageTemperature, averageHumidity } from './averageReadings.js';

const MS_ONE_MIN = 60 * 1000;
const MS_FIVE_MINS = 5 * MS_ONE_MIN;

export default class SmartHomePage {
    #statusDom;
    #floorPlan;
    #homeTemperatureTableObj;
    #weatherTableObj;
    #catalogue;
    #clock;

    /**
     * @param {HTMLElement} statusDom
     * @param {{render: function(*, *): void}} floorPlan
     * @param {{update: function(): Promise, getLastData: function(): *}} homeTemperatureTable
     * @param {{update: function(): Promise, getLastData: function(): *}} weatherTable
     * @param {Object}      catalogue  message catalogue
     * @param {{now: function(): Number}} clock  supplies the time shown in the status line
     */
    constructor(statusDom, floorPlan, homeTemperatureTable, weatherTable, catalogue, clock) {
        this.#statusDom = statusDom;
        this.#floorPlan = floorPlan;
        this.#homeTemperatureTableObj = homeTemperatureTable;
        this.#weatherTableObj = weatherTable;
        this.#catalogue = catalogue;
        this.#clock = clock;
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
     * Renders the status line: the current London time, and — once both APIs
     * have returned successfully — a comparison of the inside and outside
     * climate woven into the same sentence. If either API failed (or has yet to
     * load) it falls back to the time on its own, so the line never empties.
     */
    #renderStatusLine(homeData, weatherData) {
        const now = new Time(this.#clock.now(), this.#clock, undefined, this.#catalogue);
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
