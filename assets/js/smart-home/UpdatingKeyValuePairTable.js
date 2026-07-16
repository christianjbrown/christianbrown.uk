'use strict';

import DataFetcher from '../DataFetcher.js';
import Temperature from './Temperature.js';
import Humidity from './Humidity.js';
import Time from './Time.js';

export default class UpdatingKeyValuePairTable {
    #domTable;
    #domUpdateTime;
    #dataFetcher;
    #lastData = null;

    /**
     * @param {HTMLTableElement} domTable
     * @param {HTMLTableElement} domUpdateTime
     * @param {String}           url
     */
    constructor(domTable, domUpdateTime, url) {
        this.#domTable = domTable;
        this.#domUpdateTime = domUpdateTime;
        this.#dataFetcher = new DataFetcher(url, this._getContract());
    }

    /**
     * Fetches an update from the URL and parses the response.
     *
     * @return {Promise}
     */
    async update() {
        const that = this;

        return this.#dataFetcher.fetch()
            .then(
                (data) => {
                    that.#lastData = data;
                    that.#clearContents();
                    that._renderUpdate(data);
                }
            )
            .catch(
                (err) => {
                    that.#lastData = null;
                    that.#renderError(err);
                }
            );
    }

    /**
     * Returns the payload from the most recent successful fetch, or null if the
     * last fetch failed (or none has completed yet).
     *
     * @returns {Object|null}
     */
    getLastData() {
        return this.#lastData;
    }

    /**
     * Clears the table rows.
     */
    #clearContents() {
        this.#domTable.querySelectorAll('tr').forEach(
            (node) => {
                node.remove();
            }
        );
    }

    /**
     * Adds a row with temperatures formatted.
     *
     * @param {String}         name
     * @param {Number|String}  degreesC
     * @param {Number}         timestamp
     * @param {Boolean}        stale
     * @param {Boolean}        important
     */
    _addTempTableRow(name, degreesC, timestamp = null, stale = false, important = false) {
        const tempObj = new Temperature(degreesC);
        let timeDiff = null;
        if (timestamp) {
            const timeObj = new Time(timestamp * 1000);
            timeDiff = timeObj.formatTimeAgo();
        }
        this._addTableRow(name, tempObj.formatC(), tempObj.formatF(), timeDiff, stale, important, true);
    }

    /**
     * Adds a header row of empty cells, used to line a key/value table up with
     * the taller climate table that carries column headings.
     *
     * @param {Number} cellCount
     */
    _addBlankHeaderRow(cellCount = 2) {
        const row = this.#domTable.insertRow();
        for (let i = 0; i < cellCount; i++) {
            const th = document.createElement('th');
            th.scope = 'col';
            row.appendChild(th);
        }
    }

    /**
     * Adds a header row for the climate table, labelling the temperature
     * and humidity columns.
     *
     * @param {String} tempLabel
     * @param {String} humidityLabel
     */
    _addClimateHeaderRow(tempLabel, humidityLabel) {
        const row = this.#domTable.insertRow();
        for (const label of [null, tempLabel, humidityLabel]) {
            const th = document.createElement('th');
            th.scope = 'col';
            if (label !== null) {
                th.append(UpdatingKeyValuePairTable.#getTableCellSpan(label, 'primary', false, false));
            }
            row.appendChild(th);
        }
    }

    /**
     * Adds a row showing temperature and humidity side by side.
     *
     * A single "time ago" is shown under the name, based on the oldest
     * (least recent) of the temperature and humidity readings. A device
     * that reports no humidity shows a muted dash in the humidity column.
     *
     * @param {String}         name
     * @param {Number|String}  degreesC
     * @param {Number}         tempTimestamp
     * @param {Boolean}        tempStale
     * @param {Number|null}    humidityPercent
     * @param {Number|null}    humidityTimestamp
     * @param {Boolean}        humidityStale
     * @param {Boolean}        important
     */
    _addClimateTableRow(name, degreesC, tempTimestamp = null, tempStale = false, humidityPercent = null, humidityTimestamp = null, humidityStale = false, important = false) {
        const tempObj = new Temperature(degreesC);

        const hasHumidity = (humidityPercent !== null && humidityPercent !== undefined);
        const humidityValue = hasHumidity ? (new Humidity(humidityPercent)).formatPercent() : '—';
        const humidityMuted = hasHumidity ? humidityStale : true;

        let oldestTimestamp = tempTimestamp;
        if (hasHumidity && humidityTimestamp && (!oldestTimestamp || humidityTimestamp < oldestTimestamp)) {
            oldestTimestamp = humidityTimestamp;
        }
        const timeDiff = oldestTimestamp ? (new Time(oldestTimestamp * 1000)).formatTimeAgo() : null;

        const row = this.#domTable.insertRow();

        const columnName = row.insertCell();
        columnName.append(UpdatingKeyValuePairTable.#getTableCellSpan(name, 'primary', tempStale, important));
        if (timeDiff) {
            columnName.append(UpdatingKeyValuePairTable.#getTableCellSpan(timeDiff, 'secondary', true, false));
        }

        const columnTemp = row.insertCell();
        columnTemp.append(UpdatingKeyValuePairTable.#getTableCellSpan(tempObj.formatC(), 'primary', tempStale, important));
        columnTemp.append(UpdatingKeyValuePairTable.#getTableCellSpan(tempObj.formatF(), 'secondary', true, false));

        const columnHumidity = row.insertCell();
        columnHumidity.append(UpdatingKeyValuePairTable.#getTableCellSpan(humidityValue, 'primary', humidityMuted, important));
    }

    /**
     * Adds a generic row to the table (not temperature specific).
     *
     * @param {String}  primaryKey
     * @param {String}  primaryValue
     * @param {String}  secondaryValue
     * @param {String}  secondaryKey
     * @param {Boolean} muted
     * @param {Boolean} importantPrimary
     * @param {Boolean} secondaryMuted
     */
    _addTableRow(primaryKey, primaryValue, secondaryValue = null, secondaryKey = null, muted = false, importantPrimary = false, secondaryMuted = muted) {
        const row = this.#domTable.insertRow();

        const columnLeft = row.insertCell();
        columnLeft.append(UpdatingKeyValuePairTable.#getTableCellSpan(primaryKey, 'primary', muted, importantPrimary));
        if (secondaryKey) {
            columnLeft.append(UpdatingKeyValuePairTable.#getTableCellSpan(secondaryKey, 'secondary', secondaryMuted, false));
        }

        const columnRight = row.insertCell();
        columnRight.append(UpdatingKeyValuePairTable.#getTableCellSpan(primaryValue, 'primary', muted, importantPrimary));
        if (secondaryValue) {
            columnRight.append(UpdatingKeyValuePairTable.#getTableCellSpan(secondaryValue, 'secondary', secondaryMuted, false));
        }
    }

    /**
     * Renders the update.
     *
     * @param {Object} data
     */
    _renderUpdate(data) {

    }

    /**
     * Replaces the update-time element's contents with the given nodes and
     * reveals it. Accepts DOM nodes and/or strings (strings become inert text
     * nodes), so no markup is ever parsed from a string.
     *
     * @param {...(Node|String)} nodes
     */
    _updateDateSpan(...nodes) {
        this.#domUpdateTime.replaceChildren(...nodes);
        this.#domUpdateTime.style.display = 'block';
    }

    /**
     * Creates and returns a Span element with desired formatting.
     *
     * @param {String}  text
     * @param {String}  cssClass
     * @param {Boolean} muted
     * @param {Boolean} important
     *
     * @returns {HTMLSpanElement}
     */
    static #getTableCellSpan(text, cssClass, muted, important) {
        const span = document.createElement('span');
        if (important) {
            cssClass += ' important';
        } else if (muted) {
            cssClass += ' muted';
        }
        span.setAttribute('class', cssClass);
        span.append(text);

        return span;
    }

    /**
     * Clears the table and adds a single cell with an error message.
     *
     * @param {Error} error
     */
    #renderError(error) {
        console.error(error);
        this.#clearContents();
        const errorSpan = document.createElement('span');
        errorSpan.setAttribute('class', 'error');
        const link = document.createElement('a');
        link.setAttribute('href', 'https://www.youtube.com/watch?v=Fdjf4lMmiiI');
        link.setAttribute('target', '_blank');
        link.append('top men');
        errorSpan.append(
            "⚠️ I'm having trouble loading this data right now.",
            document.createElement('br'),
            "I'm aware - ",
            link,
            ' are working on it.',
            document.createElement('br'),
            'Please try again later.'
        );
        const errorCell = this.#domTable.insertRow().insertCell();
        errorCell.setAttribute('class', 'error-cell');
        errorCell.append(errorSpan);
    }

    /**
     * @returns {Object}
     */
    _getContract() {
        return [];
    }
}
