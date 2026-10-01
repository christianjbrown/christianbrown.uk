'use strict';

/**
 * Decides whether the page is running on a local development host, so local
 * dev telemetry never reaches production.
 */
export default class LocalHostPolicy {
    #window;

    /**
     * @param {Window} window  its `location` is read each time it is asked, so
     *                         the answer follows the page
     */
    constructor(window) {
        this.#window = window;
    }

    /**
     * True for local development hosts: the localhost variants and the
     * IPv4/IPv6 loopback addresses.
     *
     * @returns {Boolean}
     */
    isLocal() {
        const host = this.#window.location.hostname;

        return host === 'localhost'
            || host.endsWith('.localhost')
            || host === '0.0.0.0'
            || host === '[::1]' // location.hostname brackets IPv6 loopback (never bare ::1)
            || /^127(?:\.\d{1,3}){3}$/.test(host);
    }
}
