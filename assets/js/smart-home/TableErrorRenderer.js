'use strict';

const ERROR_LINK_URL = 'https://www.youtube.com/watch?v=Fdjf4lMmiiI';

/**
 * Adds a single cell with an error message under a table's (already rendered)
 * header. The header is left in place so the reader can still tell which table
 * failed; the error cell spans the header's columns.
 */
export default class TableErrorRenderer {
    #document;
    #domTable;

    /**
     * @param {Document}         document
     * @param {HTMLTableElement} domTable
     */
    constructor(document, domTable) {
        this.#document = document;
        this.#domTable = domTable;
    }

    /**
     * @param {{linkText: String, line1: String, awarePrefix: String, awareSuffix: String, line3: String}} errorMessages
     */
    render(errorMessages) {
        const errorSpan = this.#document.createElement('span');
        errorSpan.setAttribute('class', 'smart-home-table__error');
        errorSpan.append(
            errorMessages.line1,
            this.#document.createElement('br'),
            errorMessages.awarePrefix,
            this.#link(errorMessages.linkText),
            errorMessages.awareSuffix,
            this.#document.createElement('br'),
            errorMessages.line3
        );
        const errorCell = this.#domTable.insertRow().insertCell();
        errorCell.setAttribute('class', 'smart-home-table__error-cell');
        // Span the header's columns (counting a colspanned title cell) so the
        // error message sits under the full width of the table. rows[0] always
        // exists, since the error row was just inserted; with no header it is
        // the error row itself, whose single cell leaves the span alone.
        const columnCount = [...this.#domTable.rows[0].cells].reduce((total, cell) => total + cell.colSpan, 0);
        if (columnCount > 1) {
            errorCell.colSpan = columnCount;
        }
        errorCell.append(errorSpan);
    }

    /**
     * @param {String} text
     *
     * @returns {HTMLAnchorElement}
     */
    #link(text) {
        const link = this.#document.createElement('a');
        link.setAttribute('href', ERROR_LINK_URL);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.append(text);

        return link;
    }
}
