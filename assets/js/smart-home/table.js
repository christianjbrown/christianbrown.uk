'use strict';

import Temperature from './temperature.js';
import Time from './time.js';

export default class Table {
    #table;

    /**
     * @param {HTMLTableElement} table
     */
    constructor(table) {
        this.#table = table;
    }

    /**
     * Clears the table rows.
     */
    clearContents() {
        this.#table.querySelectorAll('tr').forEach(
            function (node) {
                node.remove();
            }
        );
    }

    /**
     * Adds a row with temperatures formatted.
     *
     * @param {String}  name
     * @param {Number}  degreesC
     * @param {Number}  timestamp
     * @param {Boolean} stale
     * @param {Boolean} important
     */
    addTempTableRow(name, degreesC, timestamp = null, stale = false, important = false) {
        const tempObj = new Temperature(degreesC);
        let timeDiff = null;
        if (timestamp) {
            const timeObj = new Time(timestamp * 1000);
            timeDiff = timeObj.formatTimeAgo();
        }
        this.addTableRow(name, tempObj.formatC(), tempObj.formatF(), timeDiff, stale, important);
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
    addTableRow(primaryKey, primaryValue, secondaryValue = null, secondaryKey = null, muted = false, importantPrimary = false) {
        const row = this.#table.insertRow();

        const columnLeft = row.insertCell();
        columnLeft.append(Table.#getTableCellSpan(primaryKey, 'primary', muted, importantPrimary));
        if (secondaryKey) {
            columnLeft.append(Table.#getTableCellSpan(secondaryKey, 'secondary', muted));
        }

        const columnRight = row.insertCell();
        columnRight.append(Table.#getTableCellSpan(primaryValue, 'primary', muted, importantPrimary));
        if (secondaryValue) {
            columnRight.append(Table.#getTableCellSpan(secondaryValue, 'secondary', muted));
        }
    }

    /**
     * Renders the update.
     *
     * @param {Object} data
     */
    renderUpdate(data) {

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
    static #getTableCellSpan(text, cssClass, muted = false, important = false) {
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
    addError(error) {
        this.clearContents();
        const errorSpan = document.createElement('span');
        errorSpan.setAttribute('class', 'error');
        errorSpan.append('Error: '+error.message+'. Try again later.');
        this.#table.insertRow().insertCell().append(errorSpan);
    }
}
