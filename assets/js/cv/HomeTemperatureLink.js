'use strict';

import DataFetcher from '../DataFetcher.js';
import Temperature from '../smart-home/Temperature.js';
import { averageTemperature } from '../smart-home/averageReadings.js';
import EN_GB from '../i18n/messages.en-GB.js';

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
    #catalogue;

    /**
     * @param {HTMLElement} dom
     * @param {String}      url
     * @param {Object}      catalogue  message catalogue; defaults to en-GB.
     */
    constructor(dom, url, catalogue = EN_GB) {
        this.#dom = dom;
        this.#dataFetcher = new DataFetcher(url, JSON_CONTRACT);
        this.#catalogue = catalogue;
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

        const temperature = new Temperature(average.value, this.#catalogue);
        this.#dom.textContent = this.#catalogue.cv.homeTempLink(temperature.formatC());
        this.#dom.hidden = false;
    }
}
