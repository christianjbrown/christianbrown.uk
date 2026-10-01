'use strict';

/**
 * Turns on the consented telemetry: Google Analytics and Sentry. Skipped
 * entirely on local dev hosts so a `jekyll serve` session never pollutes the
 * production Analytics property or Sentry project, even with consent granted.
 */
export default class Telemetry {
    #localHostPolicy;
    #analytics;
    #errorReporter;

    /**
     * @param {{isLocal: function(): Boolean}} localHostPolicy
     * @param {{enable: function(): void}}    analytics
     * @param {{enable: function(): Promise<void>}} errorReporter
     */
    constructor(localHostPolicy, analytics, errorReporter) {
        this.#localHostPolicy = localHostPolicy;
        this.#analytics = analytics;
        this.#errorReporter = errorReporter;
    }

    enable() {
        if (this.#localHostPolicy.isLocal()) {
            return;
        }
        this.#analytics.enable();
        void this.#errorReporter.enable();
    }
}
