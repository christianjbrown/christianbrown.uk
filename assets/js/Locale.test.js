import { describe, it, expect, beforeEach } from 'vitest';
import { matchLocale, resolveLocale, applyLocale, setText, setAttr, setAttrAll, LOCALE_COOKIE, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './Locale.js';
import Cookie from './Cookie.js';

function clearCookies() {
    document.cookie.split(';').forEach((cookie) => {
        const key = cookie.split('=')[0].trim();
        if (key) {
            document.cookie = `${key}=; max-age=0`;
        }
    });
}

describe('Locale', () => {
    beforeEach(() => {
        clearCookies();
        window.history.replaceState({}, '', '/');
    });

    describe('matchLocale', () => {
        it('returns null for an empty or missing tag', () => {
            expect(matchLocale(null)).toBeNull();
            expect(matchLocale(undefined)).toBeNull();
            expect(matchLocale('')).toBeNull();
        });

        it('matches a supported locale exactly, case-insensitively', () => {
            expect(matchLocale('de-DE')).toBe('de-DE');
            expect(matchLocale('DE-de')).toBe('de-DE');
            expect(matchLocale('fr-FR')).toBe('fr-FR');
            expect(matchLocale('en-GB')).toBe('en-GB');
        });

        it('matches by primary subtag when there is no exact match', () => {
            expect(matchLocale('de')).toBe('de-DE');
            expect(matchLocale('de-AT')).toBe('de-DE');
            expect(matchLocale('fr-CA')).toBe('fr-FR');
            expect(matchLocale('da')).toBe('da-DK');
            expect(matchLocale('da-DK')).toBe('da-DK');
        });

        it('maps any en-* regional variant to en-GB', () => {
            expect(matchLocale('en-US')).toBe('en-GB');
            expect(matchLocale('en-CA')).toBe('en-GB');
            expect(matchLocale('en-AU')).toBe('en-GB');
            expect(matchLocale('en')).toBe('en-GB');
        });

        it('returns null for an unsupported language', () => {
            expect(matchLocale('es')).toBeNull();
            expect(matchLocale('it-IT')).toBeNull();
        });
    });

    describe('resolveLocale', () => {
        it('lets a supported ?locale override the browser', () => {
            expect(resolveLocale('?locale=de-DE', ['en-US'])).toBe('de-DE');
            expect(resolveLocale('?locale=fr-FR', ['en-US'])).toBe('fr-FR');
            expect(resolveLocale('?locale=da-DK', ['en-US'])).toBe('da-DK');
            expect(resolveLocale('?locale=en-GB', ['de-DE'])).toBe('en-GB');
        });

        it('ignores an unsupported ?locale and falls through to the browser', () => {
            expect(resolveLocale('?locale=es', ['fr-FR'])).toBe('fr-FR');
        });

        it('uses the cookie locale when there is no ?locale, ahead of the browser', () => {
            expect(resolveLocale('', ['en-US'], 'da-DK')).toBe('da-DK');
        });

        it('lets a supported ?locale override the cookie', () => {
            expect(resolveLocale('?locale=de-DE', ['en-US'], 'fr-FR')).toBe('de-DE');
        });

        it('ignores an unsupported cookie locale and falls through to the browser', () => {
            expect(resolveLocale('', ['fr-CA'], 'xx-XX')).toBe('fr-FR');
        });

        it('matches the first supported accepted language by subtag', () => {
            expect(resolveLocale('', ['de-AT', 'en'])).toBe('de-DE');
            expect(resolveLocale('', ['es', 'fr-CA'])).toBe('fr-FR');
        });

        it('falls back to the default when nothing matches', () => {
            expect(resolveLocale('', ['es', 'it'])).toBe(DEFAULT_LOCALE);
        });

        it('falls back to navigator.language when the languages list is empty', () => {
            // jsdom's navigator.language is en-US, which resolves to en-GB.
            expect(resolveLocale('', [])).toBe('en-GB');
        });

        it('reads the page URL and browser by default', () => {
            expect(SUPPORTED_LOCALES).toContain(resolveLocale());
        });
    });

    describe('applyLocale', () => {
        it('records the resolved locale on <html lang> and returns it', () => {
            const locale = applyLocale();
            expect(SUPPORTED_LOCALES).toContain(locale);
            expect(document.documentElement.lang).toBe(locale);
        });

        it('persists an explicit ?locale choice to the locale cookie', () => {
            window.history.replaceState({}, '', '/?locale=de-DE');

            expect(applyLocale()).toBe('de-DE');
            expect(Cookie.get(LOCALE_COOKIE)).toBe('de-DE');
        });

        it('honours the persisted cookie on a later page with no ?locale', () => {
            Cookie.set(LOCALE_COOKIE, 'fr-FR', null);

            expect(applyLocale()).toBe('fr-FR');
            expect(document.documentElement.lang).toBe('fr-FR');
        });

        it('does not write a cookie when no ?locale is given', () => {
            applyLocale();
            expect(Cookie.get(LOCALE_COOKIE)).toBeNull();
        });
    });

    describe('setText', () => {
        it("sets a present element's text", () => {
            document.body.innerHTML = '<span id="target">old</span>';
            setText('#target', 'new');
            expect(document.querySelector('#target').textContent).toBe('new');
        });

        it('does nothing when the element is absent', () => {
            expect(() => setText('#missing', 'new')).not.toThrow();
        });
    });

    describe('setAttr', () => {
        it("sets a present element's attribute", () => {
            document.body.innerHTML = '<img id="target" alt="old">';
            setAttr('#target', 'alt', 'new');
            expect(document.querySelector('#target').getAttribute('alt')).toBe('new');
        });

        it('does nothing when the element is absent', () => {
            expect(() => setAttr('#missing', 'alt', 'new')).not.toThrow();
        });
    });

    describe('setAttrAll', () => {
        it('sets the attribute on every matching element', () => {
            document.body.innerHTML = '<img class="pin" alt="old"><img class="pin" alt="old">';
            setAttrAll('.pin', 'alt', 'new');
            expect([...document.querySelectorAll('.pin')].map((el) => el.getAttribute('alt'))).toEqual(['new', 'new']);
        });

        it('does nothing when nothing matches', () => {
            document.body.innerHTML = '';
            expect(() => setAttrAll('.pin', 'alt', 'new')).not.toThrow();
        });
    });
});
