'use strict';

import DataFetcher from '../DataFetcher.js';
import Temperature from '../smart-home/Temperature.js';
import { averageTemperature } from '../smart-home/averageReadings.js';

// The endpoint returns per-device readings under `devices`; the header link
// only needs to average their temperatures, so it validates just those fields.
const JSON_CONTRACT = {
    'devices': {
        'type': 'array',
        'cannotBeEmpty': true,
        'keyRequired': true,
        'contract': {
            'temperatureValue': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
            'temperatureTimestamp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
            'temperatureStale': {'type': 'boolean', 'keyRequired': true, 'cannotBeEmpty': true},
        },
    },
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
     * link with the average indoor temperature. On any failure — or if there
     * is no usable reading to average — it does nothing: the link stays hidden,
     * so there is no fallback text and nothing on the page shifts.
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

        const average = averageTemperature(data.devices);
        if (!average) {
            return;
        }

        const temperature = new Temperature(average.value);
        this.#dom.textContent = `🏠 ${temperature.formatC()} at home`;
        this.#dom.hidden = false;
    }
}
