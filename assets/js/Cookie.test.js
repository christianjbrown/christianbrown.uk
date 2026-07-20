import { describe, it, expect, beforeEach, vi } from 'vitest';

const { getCodes } = vi.hoisted(() => ({ getCodes: vi.fn() }));

vi.mock('./Country.js', () => ({
    default: class {
        getCountryCodesFromTimezone(...args) {
            return getCodes(...args);
        }
    },
}));

import Cookie from './Cookie.js';

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
    getCodes.mockReset();
});

describe('Cookie', () => {
    describe('needsConsent', () => {
        it('is true when the timezone maps to a consent-requiring country', async () => {
            getCodes.mockResolvedValue(['GB']);
            expect(await Cookie.needsConsent()).toBe(true);
        });

        it('is false when no country requires consent', async () => {
            getCodes.mockResolvedValue(['US']);
            expect(await Cookie.needsConsent()).toBe(false);
        });

        it('is false when the timezone maps to no country', async () => {
            getCodes.mockResolvedValue([]);
            expect(await Cookie.needsConsent()).toBe(false);
        });
    });

    describe('get / set', () => {
        it('round-trips a value, url-encoding it', () => {
            Cookie.set('greeting', 'hello world');
            expect(document.cookie).toContain('greeting=hello%20world');
            expect(Cookie.get('greeting')).toBe('hello world');
        });

        it('writes the cookie with hardening flags', () => {
            const written = [];
            const spy = vi.spyOn(document, 'cookie', 'set').mockImplementation((value) => {
                written.push(value);
            });

            try {
                Cookie.set('flagged', 'value');
            } finally {
                spy.mockRestore();
            }

            expect(written).toHaveLength(1);
            expect(written[0]).toContain('Path=/');
            expect(written[0]).toContain('SameSite=Lax');
            expect(written[0]).toContain('Secure');
        });

        it('accepts custom day and option arguments', () => {
            Cookie.set('token', 'abc', 10, { path: '/' });
            expect(Cookie.get('token')).toBe('abc');
        });

        it('writes a session cookie (no max-age) when days is null', () => {
            const written = [];
            const spy = vi.spyOn(document, 'cookie', 'set').mockImplementation((value) => {
                written.push(value);
            });

            try {
                Cookie.set('sess', 'v', null);
            } finally {
                spy.mockRestore();
            }

            expect(written[0]).toContain('sess=v');
            expect(written[0]).not.toContain('max-age');
            expect(written[0]).toContain('Path=/');
        });

        it('returns null for a missing cookie', () => {
            expect(Cookie.get('does-not-exist')).toBeNull();
        });
    });

    describe('consent', () => {
        it('reads an accepted consent cookie as true', () => {
            Cookie.setConsent(true);
            expect(Cookie.getConsent()).toBe(true);
        });

        it('reads a declined consent cookie as false', () => {
            Cookie.setConsent(false);
            expect(Cookie.getConsent()).toBe(false);
        });

        it('reads a missing consent cookie as null', () => {
            expect(Cookie.getConsent()).toBeNull();
        });
    });

    describe('delete', () => {
        it('removes a single cookie', () => {
            Cookie.set('temp', 'x');
            expect(Cookie.get('temp')).toBe('x');
            Cookie.delete('temp');
            expect(Cookie.get('temp')).toBeNull();
        });

        it('removes every cookie', () => {
            Cookie.set('a', '1');
            Cookie.set('b', '2');
            Cookie.deleteAll();
            expect(Cookie.get('a')).toBeNull();
            expect(Cookie.get('b')).toBeNull();
        });
    });
});
