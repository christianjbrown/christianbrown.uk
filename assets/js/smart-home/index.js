'use strict';

import SmartHomePage from './smart-home-page.js';

const CLOCK_SPAN_SELECTOR = '#clock';
const WEATHER_TABLE_SELECTOR = '#weather-table';
const HOME_TEMP_TABLE_SELECTOR = '#home-temperature-table';

window.addEventListener('load',
    () => {
        const smartHomePage = new SmartHomePage(CLOCK_SPAN_SELECTOR, WEATHER_TABLE_SELECTOR, HOME_TEMP_TABLE_SELECTOR);

        void smartHomePage.runAll();
        smartHomePage.setupSchedule();
    }
);
