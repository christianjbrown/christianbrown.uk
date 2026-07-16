'use strict';

import SmartHomePage from './SmartHomePage.js';
import {
    STATUS_LINE_SELECTOR,
    FLOOR_PLAN_SELECTOR,
    HOME_TEMP_TABLE_SELECTOR,
    HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
    WEATHER_TABLE_SELECTOR,
    WEATHER_TABLE_UPDATE_TIME_SELECTOR,
} from './index.const.js';

window.addEventListener('load',
    () => {

        const smartHomePage = new SmartHomePage(STATUS_LINE_SELECTOR, FLOOR_PLAN_SELECTOR, HOME_TEMP_TABLE_SELECTOR, HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR, WEATHER_TABLE_SELECTOR, WEATHER_TABLE_UPDATE_TIME_SELECTOR);

        void smartHomePage.runAll();
        smartHomePage.setupSchedule();
    }
);
