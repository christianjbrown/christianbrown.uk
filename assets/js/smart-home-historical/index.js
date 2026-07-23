'use strict';

import uPlot from '../vendor/uPlot.esm.js';
import { applyLocale, setText } from '../Locale.js';
import { catalogueFor } from '../i18n/catalogue.js';
import ClimateHistoryChart from './ClimateHistoryChart.js';
import {
    TITLE_SELECTOR,
    CHART_SELECTOR,
    STATUS_SELECTOR,
    ZOOM_IN_SELECTOR,
    ZOOM_OUT_SELECTOR,
    RESOLUTION_SELECTOR,
} from './index.const.js';

window.addEventListener('load',
    () => {
        const catalogue = catalogueFor(applyLocale());

        // Localise the build-time English page heading.
        setText(TITLE_SELECTOR, catalogue.climateHistory.title);

        const els = {
            chart: document.querySelector(CHART_SELECTOR),
            status: document.querySelector(STATUS_SELECTOR),
            zoomIn: document.querySelector(ZOOM_IN_SELECTOR),
            zoomOut: document.querySelector(ZOOM_OUT_SELECTOR),
            resolution: document.querySelector(RESOLUTION_SELECTOR),
        };

        void new ClimateHistoryChart(els, uPlot, undefined, catalogue).start();
    }
);
