'use strict';

import uPlot from '../vendor/uPlot.esm.js';
import ClimateHistoryChart from './ClimateHistoryChart.js';
import {
    CHART_SELECTOR,
    STATUS_SELECTOR,
    ZOOM_IN_SELECTOR,
    ZOOM_OUT_SELECTOR,
    RESOLUTION_SELECTOR,
} from './index.const.js';

window.addEventListener('load',
    () => {
        const els = {
            chart: document.querySelector(CHART_SELECTOR),
            status: document.querySelector(STATUS_SELECTOR),
            zoomIn: document.querySelector(ZOOM_IN_SELECTOR),
            zoomOut: document.querySelector(ZOOM_OUT_SELECTOR),
            resolution: document.querySelector(RESOLUTION_SELECTOR),
        };

        void new ClimateHistoryChart(els, uPlot).start();
    }
);
