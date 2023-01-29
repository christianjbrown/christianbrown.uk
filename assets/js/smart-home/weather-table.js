'use strict';

import Table from './table.js';

export default class WeatherTable extends Table {
    /**
     * Renders the weather update from the MET office.
     *
     * @param {Object} data
     */
    renderUpdate(data) {
        if (typeof data['data']['temp'] === 'number') {
            this.addTempTableRow('Temperature', data['data']['temp'], null, false, true);
        }
        if (typeof data['data']['temp_feels_like'] === 'number' && data['data']['temp'] !== data['data']['temp_feels_like']) {
            this.addTempTableRow('Temperature feels like', data['data']['temp_feels_like']);
        }
        if (typeof data['data']['humidity'] === 'number') {
            this.addTableRow('Humidity', data['data']['humidity']+'%');
        }
        if (typeof data['data']['precipitation'] === 'number') {
            this.addTableRow('Chance of precipitation', data['data']['precipitation']+'%');
        }
    }
}
