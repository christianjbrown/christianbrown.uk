'use strict';

import HomeTemperatureLink from './HomeTemperatureLink.js';

const HOME_TEMP_LINK_SELECTOR = '#cv-home-temp';

const isLocal = window.location.host === '127.0.0.1:4000';

// Mirrors the smart-home page's smartthings endpoint (see SmartHomePage.js).
const API_SMART_HOME_TEMPS_URL_PROD = 'https://cdn.christianbrown.uk/get-smartthings-climate';
const API_SMART_HOME_TEMPS_URL_DEV = 'http://127.0.0.1:8080';
const API_SMART_HOME_TEMPS_URL = isLocal ? API_SMART_HOME_TEMPS_URL_DEV : API_SMART_HOME_TEMPS_URL_PROD;

/**
 * Reveals the live indoor-temperature link, if the page has one.
 */
export function initHomeTemperatureLink() {
    const dom = document.querySelector(HOME_TEMP_LINK_SELECTOR);
    if (dom) {
        void (new HomeTemperatureLink(dom, API_SMART_HOME_TEMPS_URL)).update();
    }
}

window.addEventListener('load', initHomeTemperatureLink);
