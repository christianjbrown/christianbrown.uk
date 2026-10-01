'use strict';

import FloorPlan from './FloorPlan.js';
import MetWeatherTable, { MET_WEATHER_CONTRACT } from './MetWeatherTable.js';
import SmartHomePage from './SmartHomePage.js';
import SmartHomeTemperatureTable, { CLIMATE_CONTRACT } from './SmartHomeTemperatureTable.js';

/**
 * Builds a SmartHomePage and its object graph: the one place the page's
 * collaborators are put together.
 */
export default class SmartHomePageFactory {
    #document;
    #clock;
    #tableFactory;
    #climateUrl;
    #weatherUrl;

    /**
     * @param {Document} document
     * @param {{now: function(): Number}} clock
     * @param {import('./TableFactory.js').default} tableFactory
     * @param {String}   climateUrl  the indoor climate API
     * @param {String}   weatherUrl  the outdoor weather API
     */
    constructor(document, clock, tableFactory, climateUrl, weatherUrl) {
        this.#document = document;
        this.#clock = clock;
        this.#tableFactory = tableFactory;
        this.#climateUrl = climateUrl;
        this.#weatherUrl = weatherUrl;
    }

    /**
     * @param {String} statusSelector
     * @param {String} roomsSelector
     * @param {String} climateTableSelector
     * @param {String} climateUpdateSelector
     * @param {String} weatherTableSelector
     * @param {String} weatherUpdateSelector
     * @param {Object} catalogue  message catalogue
     *
     * @returns {SmartHomePage}
     *
     * @throws {Error} when a selector matches no element
     */
    create(statusSelector, roomsSelector, climateTableSelector, climateUpdateSelector, weatherTableSelector, weatherUpdateSelector, catalogue) {
        const statusDom = this.#find(statusSelector);
        const floorPlan = new FloorPlan(this.#find(roomsSelector), undefined, undefined, undefined, catalogue);
        const climateTable = this.#table(SmartHomeTemperatureTable, climateTableSelector, climateUpdateSelector, this.#climateUrl, CLIMATE_CONTRACT, catalogue);
        const weatherTable = this.#table(MetWeatherTable, weatherTableSelector, weatherUpdateSelector, this.#weatherUrl, MET_WEATHER_CONTRACT, catalogue);

        return new SmartHomePage(statusDom, floorPlan, climateTable, weatherTable, catalogue, this.#clock);
    }

    #table(TableClass, tableSelector, updateSelector, url, contract, catalogue) {
        const domTable = this.#find(tableSelector);
        const domUpdateTime = this.#find(updateSelector);

        return this.#tableFactory.create(TableClass, domTable, domUpdateTime, url, contract, catalogue);
    }

    /**
     * @param {String} selector
     *
     * @return {HTMLElement}
     */
    #find(selector) {
        const found = this.#document.querySelector(selector);
        if (!(found instanceof HTMLElement)) {
            throw new Error('Found no DOM element matching selector "'+selector+'"')
        }

        return found;
    }
}
