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
                    that._renderHeader();
                    that._renderUpdate(data, that.#dataFetcher.getGeneratedAtUnix());
                }
            )
            .catch(
                (err) => {
                    that.#lastData = null;
                    that.#clearContents();
                    that._renderHeader();
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
     * Renders the table's header row. The default is a no-op; subclasses
     * override it to add their title (and any column headings). It is called on
     * every render — success or failure — so the table's title stays visible
     * even when its API fails, telling the user which one is down.
     */
    _renderHeader() {

    }

    /**
     * Adds a header row. The first cell carries the table's title; the rest
     * carry optional column headings (a null entry leaves that cell empty). The
     * title sits in the first cell of both tables so their header rows are the
     * same height and their first separator lines align. A table with no column
     * headings can let its title span every column (titleColSpan) so it does not
     * force the first column wider than its data needs.
     *
     * @param {Array<String|null>} labels
     * @param {Number}             titleColSpan
     */
    _addHeaderRow(labels, titleColSpan = 1) {
        const row = this.#domTable.insertRow();
        labels.forEach(
            (label, index) => {
                const th = document.createElement('th');
                th.scope = 'col';
                if (index === 0 && titleColSpan > 1) {
                    th.colSpan = titleColSpan;
                }
                if (label !== null) {
                    const cssClass = index === 0 ? 'primary title' : 'primary';
                    th.append(UpdatingKeyValuePairTable.#getTableCellSpan(label, cssClass, false, false));
                }
                row.appendChild(th);
            }
        );
    }

    /**
     * Adds a row showing temperature and humidity side by side.
     *
     * A single "time ago" is shown under the name, based on the oldest
     * (least recent) of the temperature and humidity readings. A device
     * that reports no humidity shows a muted dash in the humidity column;
     * one that does gets a muted "feel" description under the value.
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
        const humidityObj = hasHumidity ? new Humidity(humidityPercent) : null;
        const humidityValue = hasHumidity ? humidityObj.formatPercent() : '—';
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
        if (hasHumidity) {
            columnHumidity.append(UpdatingKeyValuePairTable.#getTableCellSpan(humidityObj.describe(), 'secondary', true, false));
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
     * @param {Object}      data
     * @param {Number|null} generatedAtUnix
     */
    _renderUpdate(data, generatedAtUnix = null) {

    }

    /**
     * A short "Updated <time ago>" label describing when the origin generated
     * the payload (the envelope timestamp), or null when it is unknown.
     * Surfacing this keeps freshness honest even when the edge serves a
     * stale-while-revalidate copy of an older response.
     *
     * @param {Number|null} generatedAtUnix
     *
     * @returns {String|null}
     */
    _updatedLabel(generatedAtUnix = null) {
        if (!generatedAtUnix) {
            return null;
        }

        return `Updated ${(new Time(generatedAtUnix * 1000)).formatTimeAgo()}`;
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
     * Adds a single cell with an error message under the (already rendered)
     * header. The header is left in place so the reader can still tell which
     * table failed; the error cell spans the header's columns.
     *
     * @param {Error} error
     */
    #renderError(error) {
        console.error(error);
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
        // Span the header's columns (counting a colspanned title cell) so the
        // error message sits under the full width of the table.
        const headerRow = this.#domTable.rows[0];
        if (headerRow) {
            const columnCount = [...headerRow.cells].reduce((total, cell) => total + cell.colSpan, 0);
            if (columnCount > 1) {
                errorCell.colSpan = columnCount;
            }
        }
        errorCell.append(errorSpan);
    }

    /**
     * @returns {Object}
     */
    _getContract() {
        return [];
    }
}
