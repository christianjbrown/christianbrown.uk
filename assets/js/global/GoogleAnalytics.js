'use strict';

export const GTAG_SCRIPT_ID = 'gtag-js';

/**
 * Google Analytics: queues the gtag commands and fetches gtag.js. Nothing is
 * requested from Google until `enable` is called, which only happens once the
 * visitor has consented.
 */
export default class GoogleAnalytics {
    #window;
    #document;
    #clock;
    #measurementId;

    /**
     * @param {Window}   window
     * @param {Document} document
     * @param {{now: function(): Number}} clock  supplies the timestamp of the `js` command
     * @param {String}   measurementId  the GA measurement id; empty switches the tag off
     */
    constructor(window, document, clock, measurementId) {
        this.#window = window;
        this.#document = document;
        this.#clock = clock;
        this.#measurementId = measurementId;
    }

    /**
     * Queues the init commands on dataLayer, then fetches the tag, which drains
     * the queue.
     */
    enable() {
        const dataLayer = this.#window.dataLayer = this.#window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date(this.#clock.now()));
        gtag('config', this.#measurementId);
        this.loadTag();
    }

    /**
     * Fetch gtag.js, once. Loaded here rather than from a <script> in the layout
     * so nothing is requested from Google until the visitor has actually
     * consented: the tag sets no cookies before `config`, but the request alone
     * would still hand Google their IP address on a page they had not agreed to
     * be measured on. A classic script, not a module: gtag.js reads
     * document.currentScript, which is null in a module.
     */
    loadTag() {
        if (!this.#measurementId) {
            return;
        }
        if (this.#document.getElementById(GTAG_SCRIPT_ID)) {
            return;
        }
        const script = this.#document.createElement('script');
        script.id = GTAG_SCRIPT_ID;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.#measurementId)}`;
        this.#document.head.appendChild(script);
    }
}
