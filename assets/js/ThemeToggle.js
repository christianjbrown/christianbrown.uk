'use strict';

import { THEME_AUTO, THEME_LIGHT, THEME_DARK } from './Theme.js';

const LABELS = {
    [THEME_AUTO]: 'Auto',
    [THEME_LIGHT]: 'Light',
    [THEME_DARK]: 'Dark',
};

// The default (en-GB) toggle strings. `bind` takes an optional replacement (a
// catalogue's `theme` object) so the labels and accessible name localise; the
// shape is the three theme labels plus an aria-label template with a {label}
// hole. Keeping it here means this module needs no import from the i18n layer.
const DEFAULT_THEME_STRINGS = {
    [THEME_AUTO]: LABELS[THEME_AUTO],
    [THEME_LIGHT]: LABELS[THEME_LIGHT],
    [THEME_DARK]: LABELS[THEME_DARK],
    ariaLabelTemplate: 'Colour theme: {label}. Activate to change it.',
};

// Kept as text glyphs so the toggle needs no extra icon assets: a half-filled
// circle for auto, a sun for light, a moon for dark.
const GLYPHS = {
    [THEME_AUTO]: '◐',
    [THEME_LIGHT]: '☀',
    [THEME_DARK]: '☾',
};

export default class ThemeToggle {
    #theme;

    /**
     * @param {import('./Theme.js').default} theme  the theme the toggle drives
     */
    constructor(theme) {
        this.#theme = theme;
    }

    /**
     * @param {String} theme
     *
     * @returns {String}
     */
    label(theme) {
        return LABELS[theme] || LABELS[THEME_AUTO];
    }

    /**
     * @param {String} theme
     *
     * @returns {String}
     */
    glyph(theme) {
        return GLYPHS[theme] || GLYPHS[THEME_AUTO];
    }

    /**
     * Wires the toggle button to cycle the theme on click, keeping its glyph,
     * label and accessible name in sync, and reveals it (it ships hidden so it
     * never appears as a dead control when JavaScript is unavailable). A missing
     * button, as pages may not render one, is a no-op.
     *
     * @param {HTMLButtonElement|null} button
     * @param {Object}                 strings  localised toggle strings; defaults
     *                                          to en-GB.
     */
    bind(button, strings = DEFAULT_THEME_STRINGS) {
        if (!button) {
            return;
        }

        const render = (theme) => {
            const label = strings[theme];
            button.textContent = `${this.glyph(theme)} ${label}`;
            button.setAttribute('aria-label', strings.ariaLabelTemplate.replace('{label}', label));
        };

        render(this.#theme.get());
        button.hidden = false;
        button.addEventListener('click', () => {
            render(this.#theme.set(this.#theme.next(this.#theme.get())));
        });
    }
}
