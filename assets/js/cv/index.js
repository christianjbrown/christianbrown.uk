'use strict';

import HomeTemperatureLink from './HomeTemperatureLink.js';
import formatDateRange from './DateRange.js';
import { smartThingsClimateUrl } from '../apiConfig.js';
import { applyLocale, setText, setAttr, setAttrAll } from '../Locale.js';
import { catalogueFor } from '../i18n/catalogue.js';
import { formatLocations } from '../i18n/locations.js';
import EN_GB from '../i18n/messages.en-GB.js';

const HOME_TEMP_LINK_SELECTOR = '#cv-home-temp';
const EXPERIENCE_HEADING_SELECTOR = '#cv-heading-experience';
const EDUCATION_HEADING_SELECTOR = '#cv-heading-education';
const DOWNLOAD_CV_SELECTOR = '#nav-text-download';
const DATE_RANGE_SELECTOR = '.cv-experience-job-metadata-dates[data-start]';
const LOCATION_SELECTOR = '.cv-experience-company-metadata-location-text[data-locations]';

/**
 * Resolves the locale once and applies it across the homepage: the CV section
 * headings, the "Download CV" nav label, and the live indoor-temperature link.
 * These ship in en-GB (the build-time default), so a swap only shows for the
 * other locales.
 */
export function localiseHomepage() {
    const catalogue = catalogueFor(applyLocale());
    localiseHeadings(catalogue);
    localiseDateRanges(catalogue);
    localiseLocations(catalogue);
    initHomeTemperatureLink(catalogue);
}

/**
 * Localises each experience/education location from its data-locations (a
 * pipe-delimited list of raw values), translating each place and joining with
 * the locale's conjunction. If this never runs, the server-rendered en text
 * stands.
 *
 * @param {Object} catalogue
 */
export function localiseLocations(catalogue = EN_GB) {
    document.querySelectorAll(LOCATION_SELECTOR).forEach((dom) => {
        dom.textContent = formatLocations(catalogue, dom.getAttribute('data-locations'));
    });
}

/**
 * Localises each experience/education date range from its data-start/data-end,
 * replacing the server-rendered en default with the resolved locale's month
 * names and duration (and, for ongoing roles, the live duration). If this never
 * runs, the server-rendered text stands.
 *
 * @param {Object} catalogue
 */
export function localiseDateRanges(catalogue = EN_GB) {
    document.querySelectorAll(DATE_RANGE_SELECTOR).forEach((dom) => {
        dom.textContent = formatDateRange(catalogue, dom.getAttribute('data-start'), dom.getAttribute('data-end'));
    });
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
