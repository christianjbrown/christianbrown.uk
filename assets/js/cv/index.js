'use strict';

import HomeTemperatureLink from './HomeTemperatureLink.js';
import { smartThingsClimateUrl } from '../apiConfig.js';
import { applyLocale, setText, setAttr, setAttrAll } from '../Locale.js';
import { catalogueFor } from '../i18n/catalogue.js';
import EN_GB from '../i18n/messages.en-GB.js';

const HOME_TEMP_LINK_SELECTOR = '#cv-home-temp';
const EXPERIENCE_HEADING_SELECTOR = '#cv-heading-experience';
const EDUCATION_HEADING_SELECTOR = '#cv-heading-education';
const DOWNLOAD_CV_SELECTOR = '#nav-text-download';

/**
 * Resolves the locale once and applies it across the homepage: the CV section
 * headings, the "Download CV" nav label, and the live indoor-temperature link.
 * These ship in en-GB (the build-time default), so a swap only shows for the
 * other locales.
 */
export function localiseHomepage() {
    const catalogue = catalogueFor(applyLocale());
    localiseHeadings(catalogue);
    initHomeTemperatureLink(catalogue);
}

/**
 * Sets the CV section headings and the "Download CV" nav label from the
 * catalogue, when present.
 *
 * @param {Object} catalogue
 */
export function localiseHeadings(catalogue = EN_GB) {
    setText(EXPERIENCE_HEADING_SELECTOR, catalogue.cv.experienceHeading);
    setText(EDUCATION_HEADING_SELECTOR, catalogue.cv.educationHeading);
    setText(DOWNLOAD_CV_SELECTOR, catalogue.cv.downloadCv);
    setAttr('#cv-menu-download', 'title', catalogue.cv.downloadCv);
    setAttr('#cv-menu-download img', 'alt', catalogue.cv.downloadIconAlt);
    // The location-pin icon repeats down the experience list.
    setAttrAll('.cv-experience-company-metadata-location-icon', 'alt', catalogue.header.locationIconAlt);
}

/**
 * Reveals the live indoor-temperature link, if the page has one.
 *
 * @param {Object} catalogue
 */
export function initHomeTemperatureLink(catalogue = EN_GB) {
    const dom = document.querySelector(HOME_TEMP_LINK_SELECTOR);
    if (dom) {
        void (new HomeTemperatureLink(dom, smartThingsClimateUrl(), catalogue)).update();
    }
}

window.addEventListener('load', localiseHomepage);
