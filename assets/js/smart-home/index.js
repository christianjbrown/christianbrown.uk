'use strict';

import uPlot from '../vendor/uPlot.esm.js';
import SmartHomePage from './SmartHomePage.js';
import ClimateHistoryChart from '../smart-home-historical/ClimateHistoryChart.js';
import { applyLocale, setText, setAttr } from '../Locale.js';
import { catalogueFor } from '../i18n/catalogue.js';
import {
    SMART_HOME_TITLE_SELECTOR,
    ROOMS_HEADING_SELECTOR,
    HISTORICAL_HEADING_SELECTOR,
    HOW_IT_WORKS_HEADING_SELECTOR,
    STATUS_LINE_SELECTOR,
    ROOMS_SECTION_SELECTOR,
    HOME_TEMP_TABLE_SELECTOR,
    HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
    WEATHER_TABLE_SELECTOR,
    WEATHER_TABLE_UPDATE_TIME_SELECTOR,
} from './index.const.js';
import {
    CHART_SELECTOR,
    STATUS_SELECTOR,
    ZOOM_IN_SELECTOR,
    ZOOM_OUT_SELECTOR,
    RESOLUTION_SELECTOR,
    METRIC_TEMP_SELECTOR,
    METRIC_HUMIDITY_SELECTOR,
} from '../smart-home-historical/index.const.js';

window.addEventListener('load',
    () => {
        const catalogue = catalogueFor(applyLocale());

        // Localise the build-time English section headings and image alt text.
        setText(SMART_HOME_TITLE_SELECTOR, catalogue.page.smartHomeTitle);
        setText(ROOMS_HEADING_SELECTOR, catalogue.page.roomsHeading);
        setText(HISTORICAL_HEADING_SELECTOR, catalogue.page.historicalHeading);
        setText(HOW_IT_WORKS_HEADING_SELECTOR, catalogue.page.howItWorksHeading);
        setAttr('.floor-plan__image', 'alt', catalogue.page.floorPlanAlt);
        setAttr('.how-it-works', 'alt', catalogue.page.howItWorksAlt);

        const smartHomePage = new SmartHomePage(STATUS_LINE_SELECTOR, ROOMS_SECTION_SELECTOR, HOME_TEMP_TABLE_SELECTOR, HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR, WEATHER_TABLE_SELECTOR, WEATHER_TABLE_UPDATE_TIME_SELECTOR, catalogue);

        void smartHomePage.runAll();
        smartHomePage.setupSchedule();

        // The "📜 Historical" section: an independent climate-history chart that
        // fetches its own data and shares the page's resolved catalogue.
        const chartEls = {
            chart: document.querySelector(CHART_SELECTOR),
            status: document.querySelector(STATUS_SELECTOR),
            zoomIn: document.querySelector(ZOOM_IN_SELECTOR),
            zoomOut: document.querySelector(ZOOM_OUT_SELECTOR),
            resolution: document.querySelector(RESOLUTION_SELECTOR),
            metricTemp: document.querySelector(METRIC_TEMP_SELECTOR),
            metricHumidity: document.querySelector(METRIC_HUMIDITY_SELECTOR),
        };

        void new ClimateHistoryChart(chartEls, uPlot, undefined, catalogue).start();
    }
);
