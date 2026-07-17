import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Theme, {
    THEME_STORAGE_KEY,
    THEME_AUTO,
    THEME_LIGHT,
    THEME_DARK,
    THEMES,
} from './Theme.js';

describe('Theme', () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('get', () => {
        it('defaults to auto when nothing is stored', () => {
            expect(Theme.get()).toBe(THEME_AUTO);
        });

        it('returns a stored, recognised theme', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
            expect(Theme.get()).toBe(THEME_DARK);
        });

        it('falls back to auto for an unrecognised stored value', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse');
            expect(Theme.get()).toBe(THEME_AUTO);
        });

        it('falls back to auto when localStorage throws', () => {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('denied');
            });
            expect(Theme.get()).toBe(THEME_AUTO);
        });
    });

    describe('set', () => {
        it('stores and applies a forced theme', () => {
            expect(Theme.set(THEME_DARK)).toBe(THEME_DARK);
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_DARK);
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_DARK);
        });

        it('coerces an unrecognised theme to auto', () => {
            expect(Theme.set('chartreuse')).toBe(THEME_AUTO);
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_AUTO);
            expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
        });

        it('still applies the theme when localStorage throws', () => {
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('quota');
            });
            expect(Theme.set(THEME_LIGHT)).toBe(THEME_LIGHT);
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_LIGHT);
        });
    });

    describe('apply', () => {
        it('sets data-theme for a forced light theme', () => {
            Theme.apply(THEME_LIGHT);
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_LIGHT);
        });

        it('sets data-theme for a forced dark theme', () => {
            Theme.apply(THEME_DARK);
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_DARK);
        });

        it('removes data-theme for auto', () => {
            document.documentElement.setAttribute('data-theme', THEME_DARK);
            Theme.apply(THEME_AUTO);
            expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
        });
    });

    describe('next', () => {
        it('cycles auto -> light -> dark -> auto', () => {
            expect(Theme.next(THEME_AUTO)).toBe(THEME_LIGHT);
            expect(Theme.next(THEME_LIGHT)).toBe(THEME_DARK);
            expect(Theme.next(THEME_DARK)).toBe(THEME_AUTO);
        });

        it('treats an unknown theme as before auto', () => {
            expect(Theme.next('chartreuse')).toBe(THEME_AUTO);
        });
    });

    describe('label and glyph', () => {
        it('gives a label for each theme', () => {
            expect(THEMES.map((t) => Theme.label(t))).toEqual(['Auto', 'Light', 'Dark']);
        });

        it('gives a glyph for each theme', () => {
            expect(THEMES.map((t) => Theme.glyph(t))).toEqual(['◐', '☀', '☾']);
        });

        it('falls back to the auto label and glyph for an unknown theme', () => {
            expect(Theme.label('chartreuse')).toBe('Auto');
            expect(Theme.glyph('chartreuse')).toBe('◐');
        });
    });

    describe('bindToggle', () => {
        it('does nothing when there is no button', () => {
            expect(() => Theme.bindToggle(null)).not.toThrow();
        });

        it('renders the current theme and reveals the button', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
            const button = document.createElement('button');
            button.hidden = true;

            Theme.bindToggle(button);

            expect(button.hidden).toBe(false);
            expect(button.textContent).toBe('☾ Dark');
            expect(button.getAttribute('aria-label')).toContain('Dark');
        });

        it('cycles the theme, storage and label on click', () => {
            // Starts at auto (nothing stored).
            const button = document.createElement('button');
            Theme.bindToggle(button);
            expect(button.textContent).toBe('◐ Auto');

            button.dispatchEvent(new Event('click'));
            expect(button.textContent).toBe('☀ Light');
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_LIGHT);
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_LIGHT);

            button.dispatchEvent(new Event('click'));
            expect(button.textContent).toBe('☾ Dark');
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_DARK);

            button.dispatchEvent(new Event('click'));
            expect(button.textContent).toBe('◐ Auto');
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_AUTO);
            expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
        });
    });
});
