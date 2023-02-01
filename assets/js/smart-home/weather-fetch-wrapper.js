'use strict';

import FetchWrapper from './fetch-wrapper.js';
import WeatherTable from './weather-table.js';

const URL_PROD = 'https://christianbrown.global.ssl.fastly.net/get-met-office-temps';
const URL_DEV = 'http://localhost:8080/';
const SELECTOR = '#weather-table';

export default class WeatherFetchWrapper extends FetchWrapper {
    /**
     * @param {Boolean} dev
     */
    constructor(dev = false) {
        super(dev ? URL_DEV : URL_PROD, new WeatherTable(document.querySelector(SELECTOR)));
    }
}
