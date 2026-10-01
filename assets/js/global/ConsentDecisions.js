'use strict';

/**
 * What accepting and declining the consent question each do.
 */
export default class ConsentDecisions {
    #dialog;
    #cookie;
    #telemetry;

    /**
     * @param {{close: function(): void}} dialog
     * @param {{setConsent: function(Boolean): void, deleteAll: function(): void}} cookie
     * @param {{enable: function(): void}} telemetry
     */
    constructor(dialog, cookie, telemetry) {
        this.#dialog = dialog;
        this.#cookie = cookie;
        this.#telemetry = telemetry;
    }

    /**
     * Record consent and turn the telemetry on.
     */
    accept() {
        this.#dialog.close();
        this.#cookie.setConsent(true);
        this.#telemetry.enable();
    }

    /**
     * Record the refusal, after clearing anything already set.
     */
    decline() {
        this.#dialog.close();
        this.#cookie.deleteAll();
        this.#cookie.setConsent(false);
    }
}
