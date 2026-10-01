'use strict';

/**
 * Rewrites the consent dialog into the resolved locale.
 *
 * The question is a template with two holes, `{traffic}` and `{errors}`, which
 * the two links go into. It is assembled out of text nodes and the dialog's own
 * two anchors, moved into place, never innerHTML, so a catalogue string can
 * only ever become text, and the anchors keep their hrefs, their rel and their
 * event behaviour whatever a translation does to the sentence around them. A
 * language that wants the links in the other order just moves the holes.
 */
export default class CookieDialogLocaliser {
    #elements;

    /**
     * @param {{text: HTMLElement|null, analyticsLink: HTMLElement|null, sentryLink: HTMLElement|null, acceptButton: HTMLElement, declineButton: HTMLElement}} elements
     */
    constructor(elements) {
        this.#elements = elements;
    }

    /**
     * @param {Object} catalogue
     */
    localise(catalogue) {
        const { text, analyticsLink, sentryLink, acceptButton, declineButton } = this.#elements;
        const strings = catalogue.cookies;
        if (!strings || !text || !analyticsLink || !sentryLink) {
            return;
        }

        analyticsLink.textContent = strings.measureTraffic;
        sentryLink.textContent = strings.catchErrors;

        const holes = { '{traffic}': analyticsLink, '{errors}': sentryLink };
        const assembled = strings.question
            .split(/(\{traffic\}|\{errors\})/)
            .filter((part) => part !== '')
            .map((part) => holes[part] ?? part);
        text.replaceChildren(...assembled);

        acceptButton.textContent = strings.accept;
        declineButton.textContent = strings.decline;
    }
}
