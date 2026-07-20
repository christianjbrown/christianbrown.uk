'use strict';

import SmartHomePage from './SmartHomePage.js';
import { applyLocale, setText, setAttr } from '../Locale.js';
import { catalogueFor } from '../i18n/catalogue.js';
import {
    SMART_HOME_TITLE_SELECTOR,
    ROOMS_HEADING_SELECTOR,
    HOW_IT_WORKS_HEADING_SELECTOR,
    STATUS_LINE_SELECTOR,
    ROOMS_SECTION_SELECTOR,
    HOME_TEMP_TABLE_SELECTOR,
    HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
    WEATHER_TABLE_SELECTOR,
    WEATHER_TABLE_UPDATE_TIME_SELECTOR,
} from './index.const.js';

window.addEventListener('load',
    () => {
        const catalogue = catalogueFor(applyLocale());

        // Localise the build-time English section headings and image alt text.
        setText(SMART_HOME_TITLE_SELECTOR, catalogue.page.smartHomeTitle);
        setText(ROOMS_HEADING_SELECTOR, catalogue.page.roomsHeading);
        setText(HOW_IT_WORKS_HEADING_SELECTOR, catalogue.page.howItWorksHeading);
        setAttr('.floor-plan__image', 'alt', catalogue.page.floorPlanAlt);
        setAttr('.how-it-works', 'alt', catalogue.page.howItWorksAlt);

        const smartHomePage = new SmartHomePage(STATUS_LINE_SELECTOR, ROOMS_SECTION_SELECTOR, HOME_TEMP_TABLE_SELECTOR, HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR, WEATHER_TABLE_SELECTOR, WEATHER_TABLE_UPDATE_TIME_SELECTOR, catalogue);

        void smartHomePage.runAll();
        smartHomePage.setupSchedule();
    }
);
