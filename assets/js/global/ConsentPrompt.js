'use strict';

/**
 * Acts on the stored consent once the page has loaded.
 *
 * The dialog is shown to everyone who has not answered it, rather than only to
 * visitors whose browser timezone mapped to a country in an EU/UK list. That
 * guess was wrong for anyone travelling or on a VPN, and being wrong meant
 * measuring them without asking. It also cost a 47KB timezones.json fetch on
 * every single page view to make.
 */
export default class ConsentPrompt {
    #cookie;
    #dialog;
    #dialogLocaliser;
    #telemetry;
    #cataloguePromise;

    /**
     * @param {{getConsent: function(): (Boolean|null)}} cookie
     * @param {{open: function(): void}} dialog
     * @param {{localise: function(Object): void}} dialogLocaliser
     * @param {{enable: function(): void}} telemetry
     * @param {Promise<Object>} cataloguePromise  the page's resolved message catalogue
     */
    constructor(cookie, dialog, dialogLocaliser, telemetry, cataloguePromise) {
        this.#cookie = cookie;
        this.#dialog = dialog;
        this.#dialogLocaliser = dialogLocaliser;
        this.#telemetry = telemetry;
        this.#cataloguePromise = cataloguePromise;
    }

    async run() {
        const consent = this.#cookie.getConsent();
        if (consent === null) {
            // Localise before showing it rather than after: a consent question
            // that appears in English and then rewrites itself into the reader's
            // language is worse than one that appears a moment later already in
            // it.
            this.#dialogLocaliser.localise(await this.#cataloguePromise);
            this.#dialog.open();

            return;
        }
        if (consent === true) {
            this.#telemetry.enable();
        }
    }
}
