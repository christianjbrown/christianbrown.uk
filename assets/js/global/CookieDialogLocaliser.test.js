import { describe, it, expect, beforeEach } from 'vitest';

import CookieDialogLocaliser from './CookieDialogLocaliser.js';
import EN_GB from '../i18n/messages.en-GB.js';
import DE_DE from '../i18n/messages.de-DE.js';

let elements;
let localiser;

beforeEach(() => {
    document.body.innerHTML = `
        <p id="cookies-text">Are you okay if this site uses cookies to <a id="cookies-link-analytics" href="https://support.google.com/analytics/answer/11397207">measure traffic</a> and <a id="cookies-link-sentry" href="https://sentry.io/">catch errors</a>?</p>
        <button id="cookies-decline">No</button>
        <button id="cookies-accept">Yes</button>`;
    elements = {
        text: document.getElementById('cookies-text'),
        analyticsLink: document.getElementById('cookies-link-analytics'),
        sentryLink: document.getElementById('cookies-link-sentry'),
        acceptButton: document.getElementById('cookies-accept'),
        declineButton: document.getElementById('cookies-decline'),
    };
    localiser = new CookieDialogLocaliser(elements);
});

describe('CookieDialogLocaliser', () => {
    it('rebuilds the question, the link labels and the buttons from the catalogue', () => {
        localiser.localise(DE_DE);

        expect(elements.text.textContent).toBe(
            'Ist es in Ordnung, wenn diese Website Cookies verwendet, um Zugriffe zu messen und Fehler zu erfassen?',
        );
        expect(elements.analyticsLink.textContent).toBe('Zugriffe zu messen');
        expect(elements.sentryLink.textContent).toBe('Fehler zu erfassen');
        expect(elements.declineButton.textContent).toBe(DE_DE.cookies.decline);
        expect(elements.acceptButton.textContent).toBe(DE_DE.cookies.accept);
    });

    // The anchors are moved, not recreated, so nothing a translation says can
    // change where they point or strip their rel.
    it('keeps the original anchors, with their hrefs intact', () => {
        localiser.localise(DE_DE);

        expect(document.getElementById('cookies-link-analytics')).toBe(elements.analyticsLink);
        expect(document.getElementById('cookies-link-sentry')).toBe(elements.sentryLink);
        expect(elements.analyticsLink.getAttribute('href')).toBe('https://support.google.com/analytics/answer/11397207');
        expect(elements.sentryLink.getAttribute('href')).toBe('https://sentry.io/');
    });

    it('treats a catalogue string as text, never as markup', () => {
        localiser.localise({
            ...EN_GB,
            cookies: { ...EN_GB.cookies, question: '<img src=x onerror=alert(1)> {traffic} {errors}' },
        });

        expect(elements.text.querySelector('img')).toBeNull();
        expect(elements.text.textContent).toContain('<img src=x onerror=alert(1)>');
    });

    it('places the links wherever the template puts the holes', () => {
        localiser.localise({
            ...EN_GB,
            cookies: { ...EN_GB.cookies, question: 'A {errors} B {traffic} C' },
        });

        expect(elements.text.textContent).toBe('A catch errors B measure traffic C');
        expect(elements.text.firstChild.textContent).toBe('A ');
    });

    it('leaves the dialog alone when the catalogue has no cookie strings', () => {
        const before = elements.text.textContent;

        localiser.localise({ ...EN_GB, cookies: undefined });

        expect(elements.text.textContent).toBe(before);
    });

    it.each(['text', 'analyticsLink', 'sentryLink'])('does nothing when the dialog markup lacks %s', (missing) => {
        const before = document.body.innerHTML;
        const partial = new CookieDialogLocaliser({ ...elements, [missing]: null });

        expect(() => partial.localise(DE_DE)).not.toThrow();
        expect(document.body.innerHTML).toBe(before);
    });
});
