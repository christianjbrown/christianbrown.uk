'use strict';

/**
 * The wall clock. Injected wherever "now" is needed so tests (and any other
 * caller) can substitute their own source of time.
 */
export default class SystemClock {
    /**
     * @returns {Number} milliseconds since the Unix epoch
     */
    now() {
        return Date.now();
    }
}
