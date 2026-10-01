'use strict';

import DataFetcher from '../DataFetcher.js';
import ReadingFormatter from './ReadingFormatter.js';
import TableErrorRenderer from './TableErrorRenderer.js';
import TableRenderer from './TableRenderer.js';

/**
 * Assembles an updating key/value table with its fetcher, renderers and
 * formatter: the one place those collaborators are put together.
 */
export default class TableFactory {
    #document;
    #clock;
    #logger;

    /**
     * @param {Document} document
     * @param {{now: function(): Number}} clock
     * @param {{error: function(*): void}} logger  where fetch failures are reported
     */
    constructor(document, clock, logger) {
        this.#document = document;
        this.#clock = clock;
        this.#logger = logger;
    }

    /**
     * @param {Function}         TableClass       an UpdatingKeyValuePairTable subclass
     * @param {HTMLTableElement} domTable
     * @param {HTMLElement}      domUpdateTime
     * @param {String}           url              the API the table shows
     * @param {Object}           contract         the contract the API's `data` must meet
     * @param {Object}           catalogue        message catalogue
     *
     * @returns {import('./UpdatingKeyValuePairTable.js').default}
     */
    create(TableClass, domTable, domUpdateTime, url, contract, catalogue) {
        return new TableClass({
            dataFetcher: new DataFetcher(url, contract),
            renderer: new TableRenderer(this.#document, domTable, domUpdateTime),
            errorRenderer: new TableErrorRenderer(this.#document, domTable),
            formatter: new ReadingFormatter(catalogue, this.#clock),
            logger: this.#logger,
            catalogue,
        });
    }
}
