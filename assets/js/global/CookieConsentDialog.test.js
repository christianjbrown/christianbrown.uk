import { describe, it, expect, beforeEach, vi } from 'vitest';

import CookieConsentDialog from './CookieConsentDialog.js';

let dialogDom;
let backdrop;
let acceptButton;
let declineButton;
let decisions;
let dialog;

beforeEach(() => {
    document.body.innerHTML = `
        <button id="opener">open</button>
        <div id="cookies-backdrop" hidden></div>
        <div id="cookies" role="dialog" aria-modal="true" hidden>
            <p><a id="analytics" href="https://example.com/a">measure</a> <a href="https://example.com/b">errors</a></p>
            <button id="cookies-decline">No</button>
            <button id="cookies-accept">Yes</button>
        </div>`;
    dialogDom = document.getElementById('cookies');
    backdrop = document.getElementById('cookies-backdrop');
    acceptButton = document.getElementById('cookies-accept');
    declineButton = document.getElementById('cookies-decline');
    decisions = { accept: vi.fn(), decline: vi.fn() };
    dialog = new CookieConsentDialog(document, { dialog: dialogDom, backdrop, acceptButton, declineButton });
    dialog.bind(decisions);
});

const key = (init) => new window.KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });

describe('CookieConsentDialog', () => {
    describe('buttons', () => {
        it('routes the accept button to the decisions', () => {
            acceptButton.dispatchEvent(new Event('click'));

            expect(decisions.accept).toHaveBeenCalledTimes(1);
            expect(decisions.decline).not.toHaveBeenCalled();
        });

        it('routes the decline button to the decisions', () => {
            declineButton.dispatchEvent(new Event('click'));

            expect(decisions.decline).toHaveBeenCalledTimes(1);
            expect(decisions.accept).not.toHaveBeenCalled();
        });
    });

    describe('open and close', () => {
        it('shows the dialog and backdrop, opening onto decline', () => {
            dialog.open();

            expect(dialogDom.hidden).toBe(false);
            expect(backdrop.hidden).toBe(false);
            expect(document.activeElement).toBe(declineButton);
        });

        it('hides both on close and returns focus to the opener', () => {
            const opener = document.getElementById('opener');
            opener.focus();

            dialog.open();
            dialog.close();

            expect(dialogDom.hidden).toBe(true);
            expect(backdrop.hidden).toBe(true);
            expect(document.activeElement).toBe(opener);
        });

        it('closes cleanly when it was never opened', () => {
            expect(() => dialog.close()).not.toThrow();
            expect(dialogDom.hidden).toBe(true);
        });
    });

    describe('keyboard handling', () => {
        it('treats Escape as declining', () => {
            dialog.open();

            dialogDom.dispatchEvent(key({ key: 'Escape' }));

            expect(decisions.decline).toHaveBeenCalledTimes(1);
        });

        it('wraps Tab from the last control back to the first', () => {
            dialog.open();
            acceptButton.focus();

            dialogDom.dispatchEvent(key({ key: 'Tab' }));

            expect(document.activeElement).toBe(dialogDom.querySelector('a[href]'));
        });

        it('wraps Shift+Tab from the first control back to the last', () => {
            dialog.open();
            dialogDom.querySelector('a[href]').focus();

            dialogDom.dispatchEvent(key({ key: 'Tab', shiftKey: true }));

            expect(document.activeElement).toBe(acceptButton);
        });

        it('ignores any other key', () => {
            dialog.open();
            acceptButton.focus();

            dialogDom.dispatchEvent(key({ key: 'a' }));

            expect(dialogDom.hidden).toBe(false);
            expect(document.activeElement).toBe(acceptButton);
            expect(decisions.decline).not.toHaveBeenCalled();
        });

        it('leaves a Tab that is not at either end to the browser', () => {
            dialog.open();
            declineButton.focus();

            const event = key({ key: 'Tab' });
            dialogDom.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(false);
            expect(document.activeElement).toBe(declineButton);
        });

        it('leaves Shift+Tab that is not at the first control to the browser', () => {
            dialog.open();
            declineButton.focus();

            const event = key({ key: 'Tab', shiftKey: true });
            dialogDom.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(false);
        });
    });
});
