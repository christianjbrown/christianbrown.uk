import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Theme, { THEME_STORAGE_KEY, THEME_AUTO, THEME_LIGHT, THEME_DARK, THEMES } from './Theme.js';
import ThemeToggle from './ThemeToggle.js';

describe('ThemeToggle', () => {
    const theme = new Theme(window);
    const toggle = new ThemeToggle(theme);

    beforeEach(() => {
        window.localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    afterEach(() => {
        delete window.matchMedia;
    });

    const stubOS = (dark) => {
        window.matchMedia = (query) => ({ matches: dark && query.includes('dark') });
    };

    describe('label and glyph', () => {
        it('gives a label for each theme', () => {
            expect(THEMES.map((t) => toggle.label(t))).toEqual(['Auto', 'Light', 'Dark']);
        });

        it('gives a glyph for each theme', () => {
            expect(THEMES.map((t) => toggle.glyph(t))).toEqual(['◐', '☀', '☾']);
        });

        it('falls back to the auto label and glyph for an unknown theme', () => {
            expect(toggle.label('chartreuse')).toBe('Auto');
            expect(toggle.glyph('chartreuse')).toBe('◐');
        });
    });

    describe('bind', () => {
        it('does nothing when there is no button', () => {
            expect(() => toggle.bind(null)).not.toThrow();
        });

        it('renders the current theme and reveals the button', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
            const button = document.createElement('button');
            button.hidden = true;

            toggle.bind(button);

            expect(button.hidden).toBe(false);
            expect(button.textContent).toBe('☾ Dark');
            expect(button.getAttribute('aria-label')).toContain('Dark');
        });

        it('uses localised strings when given them', () => {
            window.localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
            const button = document.createElement('button');
            const strings = {
                [THEME_AUTO]: 'Auto',
                [THEME_LIGHT]: 'Hell',
                [THEME_DARK]: 'Dunkel',
                ariaLabelTemplate: 'Farbschema: {label}. Zum Ändern aktivieren.',
            };

            toggle.bind(button, strings);

            expect(button.textContent).toBe('☾ Dunkel');
            expect(button.getAttribute('aria-label')).toBe('Farbschema: Dunkel. Zum Ändern aktivieren.');
        });

        it('cycles the theme, storage and label on click (OS light)', () => {
            stubOS(false);
            // Starts at auto (nothing stored); first tap goes to the opposite
            // of the OS (dark), then to light, then back to auto.
            const button = document.createElement('button');
            toggle.bind(button);
            expect(button.textContent).toBe('◐ Auto');

            button.dispatchEvent(new Event('click'));
            expect(button.textContent).toBe('☾ Dark');
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_DARK);
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_DARK);

            button.dispatchEvent(new Event('click'));
            expect(button.textContent).toBe('☀ Light');
            expect(document.documentElement.getAttribute('data-theme')).toBe(THEME_LIGHT);

            button.dispatchEvent(new Event('click'));
            expect(button.textContent).toBe('◐ Auto');
            expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME_AUTO);
            expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
        });
    });
});
