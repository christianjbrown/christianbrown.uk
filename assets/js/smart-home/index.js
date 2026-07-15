'use strict';

import SmartHomePage from './SmartHomePage.js';
import {
    CLOCK_SPAN_SELECTOR,
    HOME_TEMP_TABLE_SELECTOR,
    HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
    WEATHER_TABLE_SELECTOR,
    WEATHER_TABLE_UPDATE_TIME_SELECTOR,
} from './index.const.js';

window.addEventListener('load',
    () => {

        const smartHomePage = new SmartHomePage(CLOCK_SPAN_SELECTOR, HOME_TEMP_TABLE_SELECTOR, HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR, WEATHER_TABLE_SELECTOR, WEATHER_TABLE_UPDATE_TIME_SELECTOR);

        void smartHomePage.runAll();
        smartHomePage.setupSchedule();

        setupCollapseToggles();
    }
);

/**
 * Toggle the Bootstrap `.collapse` targets without pulling in Bootstrap's JS.
 * The `.collapse` / `.show` styling still comes from the Bootstrap SCSS.
 */
function setupCollapseToggles() {
    const toggles = document.querySelectorAll('[data-bs-toggle="collapse"]');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', event => {
            event.preventDefault();
            const target = document.querySelector(toggle.getAttribute('data-bs-target'));
            if (target) {
                target.classList.toggle('show');
            }
        });
    });
}
