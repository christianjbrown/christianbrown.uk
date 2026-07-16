'use strict';

import SmartHomePage from './SmartHomePage.js';
import {
    CLOCK_SPAN_SELECTOR,
    CLIMATE_SUMMARY_SELECTOR,
    HOME_TEMP_TABLE_SELECTOR,
    HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
    WEATHER_TABLE_SELECTOR,
    WEATHER_TABLE_UPDATE_TIME_SELECTOR,
} from './index.const.js';

window.addEventListener('load',
    () => {

        const smartHomePage = new SmartHomePage(CLOCK_SPAN_SELECTOR, CLIMATE_SUMMARY_SELECTOR, HOME_TEMP_TABLE_SELECTOR, HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR, WEATHER_TABLE_SELECTOR, WEATHER_TABLE_UPDATE_TIME_SELECTOR);

        void smartHomePage.runAll();
        smartHomePage.setupSchedule();
    }
);
