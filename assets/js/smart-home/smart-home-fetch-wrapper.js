'use strict';

import FetchWrapper from './fetch-wrapper.js';
import SmartHomeTable from './smart-home-table.js';

const URL_PROD = 'https://christianbrown.global.ssl.fastly.net/get-smart-home-temps';
const URL_DEV = 'http://localhost:8080/';
const SELECTOR = '#smart-home-temperature-table';

export default class SmartHomeFetchWrapper extends FetchWrapper {
    /**
     * @param {Boolean} dev
     */
    constructor(dev = false) {
        super(dev ? URL_DEV : URL_PROD, new SmartHomeTable(document.querySelector(SELECTOR)));
    }
}
