'use strict';

import DataFetcher from '../DataFetcher.js';
import Temperature from './Temperature.js';
import Humidity from './Humidity.js';
import Time from './Time.js';

export default class UpdatingKeyValuePairTable {
    #domTable;
    #domUpdateTime;
    #dataFetcher;

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
                    that.#clearContents();
                    that._renderUpdate(data);
                }
            )
            .catch(
                (err) => {
                    that.#renderError(err);
                }
            );
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
        this._addTableRow(name, tempObj.formatC(), tempObj.formatF(), timeDiff, stale, important);
    }

    /**
     * Adds a row showing temperature and humidity side by side.
     *
     * Each metric keeps its own timestamp and stale state; a device that
     * reports no humidity shows a muted dash in the humidity column.
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
        const tempTimeDiff = tempTimestamp ? (new Time(tempTimestamp * 1000)).formatTimeAgo() : null;

        const hasHumidity = (humidityPercent !== null && humidityPercent !== undefined);
        const humidityValue = hasHumidity ? (new Humidity(humidityPercent)).formatPercent() : '—';
        const humidityTimeDiff = (hasHumidity && humidityTimestamp) ? (new Time(humidityTimestamp * 1000)).formatTimeAgo() : null;
        const humidityMuted = hasHumidity ? humidityStale : true;

        const row = this.#domTable.insertRow();

        const columnName = row.insertCell();
        columnName.append(UpdatingKeyValuePairTable.#getTableCellSpan(name, 'primary', tempStale, important));
        if (tempTimeDiff) {
            columnName.append(UpdatingKeyValuePairTable.#getTableCellSpan(tempTimeDiff, 'secondary', tempStale, false));
        }

        const columnTemp = row.insertCell();
        columnTemp.append(UpdatingKeyValuePairTable.#getTableCellSpan(tempObj.formatC(), 'primary', tempStale, important));
        columnTemp.append(UpdatingKeyValuePairTable.#getTableCellSpan(tempObj.formatF(), 'secondary', tempStale, false));

        const columnHumidity = row.insertCell();
        columnHumidity.append(UpdatingKeyValuePairTable.#getTableCellSpan(humidityValue, 'primary', humidityMuted, important));
        if (humidityTimeDiff) {
            columnHumidity.append(UpdatingKeyValuePairTable.#getTableCellSpan(humidityTimeDiff, 'secondary', humidityMuted, false));
        }
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
     */
    _addTableRow(primaryKey, primaryValue, secondaryValue = null, secondaryKey = null, muted = false, importantPrimary = false) {
        const row = this.#domTable.insertRow();

        const columnLeft = row.insertCell();
        columnLeft.append(UpdatingKeyValuePairTable.#getTableCellSpan(primaryKey, 'primary', muted, importantPrimary));
        if (secondaryKey) {
            columnLeft.append(UpdatingKeyValuePairTable.#getTableCellSpan(secondaryKey, 'secondary', muted, false));
        }

        const columnRight = row.insertCell();
        columnRight.append(UpdatingKeyValuePairTable.#getTableCellSpan(primaryValue, 'primary', muted, importantPrimary));
        if (secondaryValue) {
            columnRight.append(UpdatingKeyValuePairTable.#getTableCellSpan(secondaryValue, 'secondary', muted, false));
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
     * @param {String} text
     */
    _updateDateSpan(text) {
        this.#domUpdateTime.innerHTML = text;
        this.#domUpdateTime.style.display = 'inline';
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
        this.#clearContents();
        const errorSpan = document.createElement('span');
        errorSpan.setAttribute('class', 'error');
        errorSpan.append('Error: '+error.message+'. Try again later.');
        this.#domTable.insertRow().insertCell().append(errorSpan);
    }

    /**
     * @returns {Object}
     */
    _getContract() {
        return [];
    }
}
