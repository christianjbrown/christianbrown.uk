'use strict';

import Table from './table.js';

export default class SmartHomeTable extends Table {
    /**
     * Renders the weather update from the MET office.
     *
     * @param {Object} data
     */
    renderUpdate(data) {
        const that = this;
        if (data['devices'] instanceof Array) {
            if (typeof data['averageTempDegrees'] === 'number' && typeof data['averageTempTimestamp'] === 'number') {
                this.addTempTableRow('Average', data['averageTempDegrees'], data['averageTempTimestamp'], false, true);
            }
            data['devices'].forEach(
                function (dataPoint) {
                    if (typeof dataPoint['name'] == 'string' && typeof dataPoint['timestamp'] == 'number' && typeof dataPoint['temp'] == 'number' && typeof dataPoint['stale'] == 'boolean') {
                        that.addTempTableRow(dataPoint['name'], dataPoint['temp'], dataPoint['timestamp'], dataPoint['stale']);
                    } else {
                        throw new Error('Fetched data okay, and the body was JSON but not what we expected');
                    }
                }
            );
        }
    }
}
