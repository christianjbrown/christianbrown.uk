import { describe, it, expect, beforeEach, vi } from 'vitest';

import Cookie from './Cookie.js';

const cookie = new Cookie(document);

function clearCookies() {
    document.cookie.split(';').forEach((cookie) => {
        const key = cookie.split('=')[0].trim();
        if (key) {
            document.cookie = `${key}=; max-age=0`;
        }
    });
}

beforeEach(() => {
    clearCookies();
});

describe('Cookie', () => {
    describe('get / set', () => {
        it('round-trips a value, url-encoding it', () => {
            cookie.set('greeting', 'hello world');
            expect(document.cookie).toContain('greeting=hello%20world');
            expect(cookie.get('greeting')).toBe('hello world');
        });

        it('writes the cookie with hardening flags', () => {
            const written = [];
            const spy = vi.spyOn(document, 'cookie', 'set').mockImplementation((value) => {
                written.push(value);
            });

            try {
                cookie.set('flagged', 'value');
            } finally {
                spy.mockRestore();
            }

            expect(written).toHaveLength(1);
            expect(written[0]).toContain('Path=/');
            expect(written[0]).toContain('SameSite=Lax');
            expect(written[0]).toContain('Secure');
        });

        it('accepts custom day and option arguments', () => {
            cookie.set('token', 'abc', 10, { path: '/' });
            expect(cookie.get('token')).toBe('abc');
        });

        it('writes a session cookie (no max-age) when days is null', () => {
            const written = [];
            const spy = vi.spyOn(document, 'cookie', 'set').mockImplementation((value) => {
                written.push(value);
            });

            try {
                cookie.set('sess', 'v', null);
            } finally {
                spy.mockRestore();
            }

            expect(written[0]).toContain('sess=v');
            expect(written[0]).not.toContain('max-age');
            expect(written[0]).toContain('Path=/');
        });

        it('reads and writes through the document it was given, not the global one', () => {
            const fakeDocument = { cookie: 'a=1; b=2' };
            const injected = new Cookie(fakeDocument);

            expect(injected.get('b')).toBe('2');
            injected.set('c', '3');
            expect(fakeDocument.cookie).toContain('c=3');
        });

        it('returns null for a missing cookie', () => {
            expect(cookie.get('does-not-exist')).toBeNull();
        });
    });

    describe('consent', () => {
        it('reads an accepted consent cookie as true', () => {
            cookie.setConsent(true);
            expect(cookie.getConsent()).toBe(true);
        });

        it('reads a declined consent cookie as false', () => {
            cookie.setConsent(false);
            expect(cookie.getConsent()).toBe(false);
        });

        it('reads a missing consent cookie as null', () => {
            expect(cookie.getConsent()).toBeNull();
        });
    });

    describe('delete', () => {
        it('removes a single cookie', () => {
            cookie.set('temp', 'x');
            expect(cookie.get('temp')).toBe('x');
            cookie.delete('temp');
            expect(cookie.get('temp')).toBeNull();
        });

        it('removes every cookie', () => {
            cookie.set('a', '1');
            cookie.set('b', '2');
            cookie.deleteAll();
            expect(cookie.get('a')).toBeNull();
            expect(cookie.get('b')).toBeNull();
        });
    });
});
