'use strict';

export default class FetchWrapper {
    #url;
    #table;
    #callback;

    /**
     * @param {String}           url
     * @param {Table}            table
     */
    constructor(url, table) {
        this.#url = url;
        this.#table = table;
    }

    /**
     * Fetches an update from the URL and parses the response.
     */
    update() {
        const that = this;
        fetch(this.#url)
            .then(
                function (response) {
                    that.#handleResponse(that.#table, that.#callback , response);
                }
            )
            .catch(
                function (err) {
                    if (err instanceof TypeError && err.message === 'Failed to fetch') {
                        err = new Error('Could not connect to API');
                    }
                    that.#table.addError(err);
                }
            );
    }

    /**
     * Handle successful fetch and try to JSON decode it.
     *
     * @param {Table}            table
     * @param {CallableFunction} callback
     * @param {Response}         response
     */
    #handleResponse(table, callback, response) {
        response.json()
            .catch(
                function (err) {
                    FetchWrapper.#handleBadResponse(err, response);
                }
            )
            .then(
                function (data) {
                    FetchWrapper.#handleJsonOk(table, data);
                }
            )
            .catch(
                function (err) {
                    table.addError.bind(table);
                    table.addError(err);
                }
            )
    }

    /**
     * Handle successful JSON decode.
     *
     * @param {Table}  table
     * @param {Object} data
     */
    static #handleJsonOk(table, data) {
        table.clearContents();
        if (data instanceof Object) {
            if (typeof data['error'] === 'string') {
                throw new Error(data['error']);
            }
            table.renderUpdate(data);
        } else {
            throw new Error('Fetched data okay, but your browser is being inconsistent on if it successfully parsed the JSON body');
        }
    }

    /**
     * Handle bad response.
     *
     * @param {Error}    err
     * @param {Response} response
     */
    static #handleBadResponse(err, response) {
        if (response.ok) {
            throw new Error('Fetched data okay, but the body was not JSON');
        } else {
            throw new Error('Fetching data, got '+response.status+' '+response.statusText+' from the server, and the body was not JSON');
        }
    }
}
