'use strict';

/**
 * The view-source/console easter egg: two styled lines written to the console.
 */
export default class ConsoleBanner {
    #console;
    #lines;

    /**
     * @param {Console} console
     * @param {Array<{text: String, style: String}>} lines
     */
    constructor(console, lines) {
        this.#console = console;
        this.#lines = lines;
    }

    print() {
        this.#lines.forEach(({ text, style }) => this.#console.log('%c' + text, style));
    }
}
