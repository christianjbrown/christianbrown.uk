'use strict';

/**
 * Builds the DOM of a smart-home key/value table and its "updated" line. It
 * knows how things look and nothing about where the data came from or how a
 * number is worded.
 */
export default class TableRenderer {
    #document;
    #domTable;
    #domUpdateTime;

    /**
     * @param {Document}         document        creates the elements
     * @param {HTMLTableElement} domTable
     * @param {HTMLElement}      domUpdateTime
     */
    constructor(document, domTable, domUpdateTime) {
        this.#document = document;
        this.#domTable = domTable;
        this.#domUpdateTime = domUpdateTime;
    }

    /**
     * Clears the table rows.
     */
    clear() {
        this.#domTable.querySelectorAll('tr').forEach(
            (node) => {
                node.remove();
            }
        );
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
    addHeaderRow(labels, titleColSpan = 1) {
        const row = this.#domTable.insertRow();
        labels.forEach(
            (label, index) => {
                const th = this.#document.createElement('th');
                th.scope = 'col';
                if (index === 0 && titleColSpan > 1) {
                    th.colSpan = titleColSpan;
                }
                if (label !== null) {
                    th.append(this.#cellSpan(label, 'primary', false, false, index === 0));
                }
                row.appendChild(th);
            }
        );
    }

    /**
     * Adds a generic two-column row.
     *
     * @param {String}  primaryKey
     * @param {String}  primaryValue
     * @param {String}  secondaryValue
     * @param {String}  secondaryKey
     * @param {Boolean} muted
     * @param {Boolean} importantPrimary
     * @param {Boolean} secondaryMuted
     */
    addRow(primaryKey, primaryValue, secondaryValue = null, secondaryKey = null, muted = false, importantPrimary = false, secondaryMuted = muted) {
        const row = this.#domTable.insertRow();

        const columnLeft = row.insertCell();
        columnLeft.append(this.#cellSpan(primaryKey, 'primary', muted, importantPrimary, false));
        if (secondaryKey) {
            columnLeft.append(this.#cellSpan(secondaryKey, 'secondary', secondaryMuted, false));
        }

        const columnRight = row.insertCell();
        columnRight.append(this.#cellSpan(primaryValue, 'primary', muted, importantPrimary));
        if (secondaryValue) {
            columnRight.append(this.#cellSpan(secondaryValue, 'secondary', secondaryMuted, false));
        }
    }

    /**
     * Adds a three-column row: name (with an optional "time ago" under it),
     * temperature (Celsius over Fahrenheit) and humidity (value over an optional
     * description).
     *
     * @param {{name: String, timeAgo: (String|null), celsius: String, fahrenheit: String,
     *          temperatureStale: Boolean, humidityValue: String, humidityDescription: (String|null),
     *          humidityMuted: Boolean, important: Boolean}} cells
     */
    addClimateRow({ name, timeAgo, celsius, fahrenheit, temperatureStale, humidityValue, humidityDescription, humidityMuted, important }) {
        const row = this.#domTable.insertRow();

        const columnName = row.insertCell();
        columnName.append(this.#cellSpan(name, 'primary', temperatureStale, important, false));
        if (timeAgo) {
            columnName.append(this.#cellSpan(timeAgo, 'secondary', true, false));
        }

        const columnTemp = row.insertCell();
        columnTemp.append(this.#cellSpan(celsius, 'primary', temperatureStale, important));
        columnTemp.append(this.#cellSpan(fahrenheit, 'secondary', true, false));

        const columnHumidity = row.insertCell();
        columnHumidity.append(this.#cellSpan(humidityValue, 'primary', humidityMuted, important));
        if (humidityDescription !== null) {
            columnHumidity.append(this.#cellSpan(humidityDescription, 'secondary', true, false));
        }
    }

    /**
     * A small, muted `freshness` span holding the given label.
     *
     * @param {String} label
     *
     * @returns {HTMLSpanElement}
     */
    createFreshnessElement(label) {
        const span = this.#document.createElement('span');
        span.className = 'update-time__freshness';
        span.append(label);

        return span;
    }

    /**
     * An anchor that opens in a new tab.
     *
     * @param {String} href
     * @param {String} text
     *
     * @returns {HTMLAnchorElement}
     */
    createExternalLink(href, text) {
        const link = this.#document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.textContent = text;

        return link;
    }

    /**
     * Replaces the update-time element's contents with the given nodes and
     * reveals it. Accepts DOM nodes and/or strings (strings become inert text
     * nodes), so no markup is ever parsed from a string.
     *
     * @param {...(Node|String)} nodes
     */
    setUpdateContents(...nodes) {
        this.#domUpdateTime.replaceChildren(...nodes);
        this.#domUpdateTime.style.display = 'block';
    }

    /**
     * Creates a value span carrying its BEM modifier classes. The base is always
     * `smart-home-table__value`; `variant` picks --primary or --secondary, and
     * the flags layer on --title, --emphasis or --muted.
     *
     * @param {String}  text
     * @param {String}  variant   'primary' or 'secondary'
     * @param {Boolean} muted
     * @param {Boolean} important
     * @param {Boolean} title
     *
     * @returns {HTMLSpanElement}
     */
    #cellSpan(text, variant, muted, important, title = false) {
        const base = 'smart-home-table__value';
        const classes = [base, `${base}--${variant}`];
        if (title) {
            classes.push(`${base}--title`);
        }
        if (important) {
            classes.push(`${base}--emphasis`);
        } else if (muted) {
            classes.push(`${base}--muted`);
        }

        const span = this.#document.createElement('span');
        span.setAttribute('class', classes.join(' '));
        span.append(text);

        return span;
    }
}
