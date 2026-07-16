'use strict';

import DataFetcher from '../DataFetcher.js';
import Temperature from '../smart-home/Temperature.js';

// Only the average indoor temperature is needed for the header link.
const JSON_CONTRACT = {
    'averageTempDegrees': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
};

export default class HomeTemperatureLink {
    #dom;
    #dataFetcher;

    /**
     * @param {HTMLElement} dom
     * @param {String}      url
     */
    constructor(dom, url) {
        this.#dom = dom;
        this.#dataFetcher = new DataFetcher(url, JSON_CONTRACT);
    }

    /**
     * Fetches the indoor climate and, on success, fills in and reveals the
     * link. On any failure it does nothing: the link stays hidden, so there is
     * no fallback text and nothing on the page shifts.
     *
     * @return {Promise}
     */
    async update() {
        let data;
        try {
            data = await this.#dataFetcher.fetch();
        } catch {
            return;
        }

        const temperature = new Temperature(data.averageTempDegrees);
        this.#dom.textContent = `🏠 ${temperature.formatC()} at home`;
        this.#dom.hidden = false;
    }
}
