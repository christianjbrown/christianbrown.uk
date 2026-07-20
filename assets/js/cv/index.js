'use strict';

import HomeTemperatureLink from './HomeTemperatureLink.js';
import { smartThingsClimateUrl } from '../apiConfig.js';

const HOME_TEMP_LINK_SELECTOR = '#cv-home-temp';

/**
 * Reveals the live indoor-temperature link, if the page has one.
 */
export function initHomeTemperatureLink() {
    const dom = document.querySelector(HOME_TEMP_LINK_SELECTOR);
    if (dom) {
        void (new HomeTemperatureLink(dom, smartThingsClimateUrl())).update();
    }
}

window.addEventListener('load', initHomeTemperatureLink);
