'use strict';

// Everything in the dialog that can take focus. Both buttons are always
// present, so there is no case where the trap has nothing to cycle between.
const FOCUSABLE_SELECTOR = 'a[href], button';

/**
 * The consent dialog's behaviour: showing and hiding it, handing focus in and
 * back out, and the keyboard rules. What an answer does is the decisions
 * object's business (see `bind`).
 */
export default class CookieConsentDialog {
    #document;
    #dialog;
    #backdrop;
    #acceptButton;
    #declineButton;
    // Where focus was before the dialog took it, so it can be handed back rather
    // than dropped to the top of the document when the dialog closes.
    #focusedBefore = null;

    /**
     * @param {Document}    document
     * @param {{dialog: HTMLElement, backdrop: HTMLElement, acceptButton: HTMLElement, declineButton: HTMLElement}} elements
     */
    constructor(document, { dialog, backdrop, acceptButton, declineButton }) {
        this.#document = document;
        this.#dialog = dialog;
        this.#backdrop = backdrop;
        this.#acceptButton = acceptButton;
        this.#declineButton = declineButton;
    }

    /**
     * Routes the visitor's answers to the decisions object.
     *
     * @param {{accept: function(): void, decline: function(): void}} decisions
     */
    bind(decisions) {
        this.#acceptButton.addEventListener('click', () => decisions.accept());
        this.#declineButton.addEventListener('click', () => decisions.decline());
        this.#dialog.addEventListener('keydown', (event) => this.#handleKey(event, decisions));
    }

    /**
     * Show the dialog and move focus into it.
     *
     * Focus lands on decline rather than accept: it is the answer that does the
     * least, so it is the safe thing to hit with a stray Return.
     */
    open() {
        this.#focusedBefore = this.#document.activeElement;
        this.#backdrop.hidden = false;
        this.#dialog.hidden = false;
        this.#declineButton.focus();
    }

    /**
     * Hide the dialog and give focus back to whatever had it.
     */
    close() {
        this.#dialog.hidden = true;
        this.#backdrop.hidden = true;
        if (this.#focusedBefore) {
            this.#focusedBefore.focus();
            this.#focusedBefore = null;
        }
    }

    /**
     * Keyboard handling for the open dialog.
     *
     * Escape closes it as a refusal. Treating it as "ask me again later" would
     * mean the dialog reappeared on every page, which is worse for the visitor
     * than taking their dismissal at face value, and refusing is the answer that
     * leaves them un-measured.
     *
     * Tab is trapped, because a modal that lets you tab out into a page you
     * cannot see or click is a modal in name only.
     *
     * @param {KeyboardEvent} event
     * @param {{decline: function(): void}} decisions
     */
    #handleKey(event, decisions) {
        if (event.key === 'Escape') {
            decisions.decline();

            return;
        }
        if (event.key !== 'Tab') {
            return;
        }

        const focusable = [...this.#dialog.querySelectorAll(FOCUSABLE_SELECTOR)];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && this.#document.activeElement === first) {
            event.preventDefault();
            last.focus();

            return;
        }
        if (!event.shiftKey && this.#document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
}
