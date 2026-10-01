'use strict';

import { setText, setAttr, setAttrAll } from '../Locale.js';
import { formatLocations } from '../i18n/locations.js';

/**
 * Localises the shared header chrome: the job title, location, and the
 * hover/accessibility text (title and alt) the build renders in English, plus
 * the colour-theme toggle. A no-op for en-GB and for elements a given page
 * lacks.
 */
export default class HeaderLocaliser {
    #document;
    #themeToggle;
    #themeToggleId;

    /**
     * @param {Document} document
     * @param {{bind: function(HTMLElement|null, Object): void}} themeToggle
     * @param {String}   themeToggleId  the id of the toggle button
     */
    constructor(document, themeToggle, themeToggleId) {
        this.#document = document;
        this.#themeToggle = themeToggle;
        this.#themeToggleId = themeToggleId;
    }

    /**
     * @param {Object} catalogue
     */
    localise(catalogue) {
        const header = catalogue.header;
        setText('#header-job-title', header.jobTitle);
        const headerLocation = this.#document.getElementById('header-location');
        if (headerLocation) {
            headerLocation.textContent = formatLocations(catalogue, headerLocation.getAttribute('data-location'));
        }
        setAttrAll('.header-home-link', 'title', header.homeLinkTitle);
        setAttr('.header-avatar img', 'alt', header.avatarAlt);
        setAttr('.location-icon', 'alt', header.locationIconAlt);
        setAttr('#cv-home-temp', 'title', header.smartHomeLinkTitle);
        setAttr('#' + this.#themeToggleId, 'title', catalogue.theme.switchTitle);

        // Header colour-theme toggle (Auto, Light, Dark). Present on every page;
        // the saved choice was already applied pre-paint by theme-init.js in the
        // <head>. Pass the locale's toggle strings so its label and accessible
        // name localise.
        this.#themeToggle.bind(this.#document.getElementById(this.#themeToggleId), catalogue.theme);
    }
}
