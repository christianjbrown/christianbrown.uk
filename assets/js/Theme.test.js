import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Theme, {
    THEME_STORAGE_KEY,
    THEME_AUTO,
    THEME_LIGHT,
    THEME_DARK,
} from './Theme.js';

describe('Theme', () => {
    const theme = new Theme(window);

    beforeEach(() => {
        window.localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        // matchMedia is stubbed directly (jsdom doesn't provide it), so clear it
        // between tests rather than relying on vi.restoreAllMocks.
        delete window.matchMedia;
    });

    // jsdom has no matchMedia; stub the OS colour-scheme preference.
    const stubOS = (dark) => {
        window.matchMedia = (query) => ({ matches: dark && query.includes('dark') });
    };

    describe('get', () => {
        it('defaults to auto when nothing is stored', () => {
            expect(theme.get()).toBe(THEME_AUTO);
        });

        it('returns a stored, recognised theme', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
            expect(theme.get()).toBe(THEME_DARK);
        });

        it('falls back to auto for an unrecognised stored value', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse');
            expect(theme.get()).toBe(THEME_AUTO);
        });

        it('falls back to auto when localStorage throws', () => {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('denied');
            });
            expect(theme.get()).toBe(THEME_AUTO);
        });
    });

    describe('set', () => {
        it('stores and applies a forced theme', () => {
            expect(theme.set(THEME_DARK)).toBe(THEME_DARK);
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_DARK);
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_DARK);
        });

        it('coerces an unrecognised theme to auto', () => {
            expect(theme.set('chartreuse')).toBe(THEME_AUTO);
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_AUTO);
            expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
        });

        it('still applies the theme when localStorage throws', () => {
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('quota');
            });
            expect(theme.set(THEME_LIGHT)).toBe(THEME_LIGHT);
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_LIGHT);
        });
    });

    describe('apply', () => {
        it('sets data-theme for a forced light theme', () => {
            theme.apply(THEME_LIGHT);
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_LIGHT);
        });

        it('sets data-theme for a forced dark theme', () => {
            theme.apply(THEME_DARK);
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_DARK);
        });

        it('removes data-theme for auto', () => {
            document.documentElement.setAttribute('data-theme', THEME_DARK);
            theme.apply(THEME_AUTO);
            expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
        });
    });

    describe('injected window', () => {
        it('reads, writes and applies through the window it was given', () => {
            const store = {};
            const root = { setAttribute: vi.fn(), removeAttribute: vi.fn() };
            const fakeWindow = {
                localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; } },
                document: { documentElement: root },
            };
            const injected = new Theme(fakeWindow);

            expect(injected.set(THEME_DARK)).toBe(THEME_DARK);
            expect(injected.get()).toBe(THEME_DARK);
            expect(root.setAttribute).toHaveBeenCalledWith('data-theme', THEME_DARK);
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
        });
    });

    describe('prefersDark', () => {
        it('is true when the OS prefers dark', () => {
            stubOS(true);
            expect(theme.prefersDark()).toBe(true);
        });

        it('is false when the OS prefers light', () => {
            stubOS(false);
            expect(theme.prefersDark()).toBe(false);
        });

        it('is false when matchMedia is unavailable', () => {
            expect(theme.prefersDark()).toBe(false);
        });
    });

    describe('next', () => {
        // First tap from auto goes to the opposite of what the OS shows.
        it('cycles auto -> dark -> light -> auto when the OS is light', () => {
            stubOS(false);
            expect(theme.next(THEME_AUTO)).toBe(THEME_DARK);
            expect(theme.next(THEME_DARK)).toBe(THEME_LIGHT);
            expect(theme.next(THEME_LIGHT)).toBe(THEME_AUTO);
        });

        it('cycles auto -> light -> dark -> auto when the OS is dark', () => {
            stubOS(true);
            expect(theme.next(THEME_AUTO)).toBe(THEME_LIGHT);
            expect(theme.next(THEME_LIGHT)).toBe(THEME_DARK);
            expect(theme.next(THEME_DARK)).toBe(THEME_AUTO);
        });

        it('defaults to the OS-light order when matchMedia is unavailable', () => {
            expect(theme.next(THEME_AUTO)).toBe(THEME_DARK);
        });

        it('returns to auto for an unknown theme', () => {
            stubOS(false);
            expect(theme.next('chartreuse')).toBe(THEME_AUTO);
        });
    });
});
