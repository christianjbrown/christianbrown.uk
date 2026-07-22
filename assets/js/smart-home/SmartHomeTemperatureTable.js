'use strict';

import UpdatingKeyValuePairTable from './UpdatingKeyValuePairTable.js';
import { averageTemperature, averageHumidity } from './averageReadings.js';

// Decorative row emoji live here, not in the message catalogues — they're the
// same in every locale and are rendered as theme-aware greyscale glyphs (see
// `.smart-home-table__value-icon`). ROOM_EMOJI is keyed by the raw SmartThings
// room name (the same key roomNames uses); a room with no entry simply gets no
// icon. The house-wide average row gets its own summary glyph.
const AVERAGE_EMOJI = '📊';
const ROOM_EMOJI = {
    'Bedroom': '🛏️',
    'Living room': '🛋️',
    'Hallway': '🚪',
    'Study': '📚',
};

const JSON_CONTRACT = {
    'devices': {
        'type': 'array',
        'cannotBeEmpty': true,
        'keyRequired': true,
        'contract': {
            'name': {'type': 'string', 'keyRequired': true, 'cannotBeEmpty': true},
            'roomName': {'type': 'string', 'cannotBeEmpty': true},
            'temperatureTimestamp': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
            'temperatureValue': {'type': 'number', 'keyRequired': true, 'cannotBeEmpty': true},
            'temperatureStale': {'type': 'boolean', 'keyRequired': true, 'cannotBeEmpty': true},
            'humidityValue': {'type': 'number', 'cannotBeEmpty': true},
            'humidityTimestamp': {'type': 'number', 'cannotBeEmpty': true},
            'humidityStale': {'type': 'boolean', 'cannotBeEmpty': true},
        },
    },
};

export default class SmartHomeTemperatureTable extends UpdatingKeyValuePairTable {

    /**
     * Title in the first cell, then the temperature and humidity column
     * headings.
     */
    _renderHeader() {
        this._addHeaderRow([this._catalogue.table.insideTitle, '🌡️', '💧']);
    }

    /**
     * @param {Object}      data
     * @param {Number|null} generatedAtUnix
     */
    _renderUpdate(data, generatedAtUnix = null) {
        const updated = this._updatedElement(generatedAtUnix);
        if (updated) {
            this._updateDateSpan(updated);
        }

        const temperature = averageTemperature(data['devices']);
        if (temperature) {
            const humidity = averageHumidity(data['devices']);
            this._addClimateTableRow(
                this._catalogue.table.average,
                temperature.value, temperature.timestamp, temperature.stale,
                humidity ? humidity.value : null, humidity ? humidity.timestamp : null, humidity ? humidity.stale : false,
                true, AVERAGE_EMOJI
            );
        }
        const that = this;
        const devices = [...data['devices']].sort(
            (a, b) => b['temperatureTimestamp'] - a['temperatureTimestamp']
        );
        devices.forEach(
             (dataPoint) => {
                const roomName = dataPoint['roomName'];
                // Map the raw SmartThings names to their display names, falling
                // back to the API value when there's no mapping for this locale.
                const device = this._catalogue.deviceNames[dataPoint['name']] ?? dataPoint['name'];
                const room = roomName ? (this._catalogue.roomNames[roomName] ?? roomName) : null;
                const label = room ? room + ' - ' + device : device;
                // Keyed by the raw (untranslated) room name; unmapped rooms get
                // no icon.
                const roomEmoji = roomName ? ROOM_EMOJI[roomName] : null;
                that._addClimateTableRow(
                    label,
                    dataPoint['temperatureValue'], dataPoint['temperatureTimestamp'], dataPoint['temperatureStale'],
                    dataPoint['humidityValue'] ?? null, dataPoint['humidityTimestamp'] ?? null, dataPoint['humidityStale'] ?? false,
                    false, roomEmoji
                );
            }
        );
    }

    /**
     * @returns {Object}
     */
    _getContract() {
        return JSON_CONTRACT;
    }
}
