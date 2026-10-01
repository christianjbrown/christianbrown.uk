'use strict';

// The visitor's colour-theme preference, persisted in localStorage.
//
//  - 'auto'  follow the operating system (the default; no override)
//  - 'light' force the light theme
//  - 'dark'  force the dark theme
//
// A forced theme is applied by setting `data-theme` on <html>; 'auto' clears it
// so the prefers-color-scheme media query takes back over. The stylesheet reads
// both (see the theme token blocks in global.scss). The same key is read by the
// tiny classic theme-init.js in the page <head>, which applies the saved theme
// before first paint to avoid a flash of the wrong one.

export const THEME_STORAGE_KEY = 'theme';
export const THEME_AUTO = 'auto';
export const THEME_LIGHT = 'light';
export const THEME_DARK = 'dark';

// The recognised themes (used to validate stored/incoming values). The toggle
// cycle order is decided at tap time by Theme#next, not by this array.
export const THEMES = [THEME_AUTO, THEME_LIGHT, THEME_DARK];

export default class Theme {
    #window;

    /**
     * @param {Window} window  supplies localStorage, matchMedia and the document
     *                         element the theme is applied to
     */
    constructor(window) {
        this.#window = window;
    }

    /**
     * The saved preference, defaulting to 'auto' when nothing valid is stored
     * (including when localStorage is unavailable, e.g. private browsing).
     *
     * @returns {String}
     */
    get() {
        let stored;
        try {
            stored = this.#window.localStorage.getItem(THEME_STORAGE_KEY);
        } catch (e) {
            stored = null;
        }

        return THEMES.includes(stored) ? stored : THEME_AUTO;
    }

    /**
     * Persists and applies a theme, coercing anything unrecognised to 'auto'.
     * Storage failures are ignored: the theme still applies for this visit.
     *
     * @param {String} theme
     *
     * @returns {String} the theme actually applied
     */
    set(theme) {
        const value = THEMES.includes(theme) ? theme : THEME_AUTO;
        try {
            this.#window.localStorage.setItem(THEME_STORAGE_KEY, value);
        } catch (e) {
            // Ignore: a forced theme that can't be saved still applies below.
        }
        this.apply(value);

        return value;
    }

    /**
     * Reflects a theme onto <html>: a forced theme sets `data-theme`, 'auto'
     * removes it so the OS preference governs again.
     *
     * @param {String} theme
     */
    apply(theme) {
        const root = this.#window.document.documentElement;
        if (theme === THEME_LIGHT || theme === THEME_DARK) {
            root.setAttribute('data-theme', theme);
        } else {
            root.removeAttribute('data-theme');
        }
    }

    /**
     * Whether the operating system currently prefers a dark colour scheme.
     *
     * @returns {Boolean}
     */
    prefersDark() {
        return typeof this.#window.matchMedia === 'function'
            && this.#window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /**
     * The next theme in the toggle cycle. From Auto the first tap always goes
     * to the theme opposite what the OS is currently showing (so it's a visible
     * change), then to the theme matching the OS, then back to Auto:
     *
     *   OS light:  Auto -> Dark -> Light -> Auto
     *   OS dark:   Auto -> Light -> Dark -> Auto
     *
     * @param {String} theme
     *
     * @returns {String}
     */
    next(theme) {
        const dark = this.prefersDark();
        const opposite = dark ? THEME_LIGHT : THEME_DARK;
        const matching = dark ? THEME_DARK : THEME_LIGHT;

        if (theme === THEME_AUTO) {
            return opposite;
        }
        if (theme === opposite) {
            return matching;
        }

        return THEME_AUTO;
    }
}
