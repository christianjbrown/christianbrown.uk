'use strict';

import DataFetcher from '../DataFetcher.js';
import { historicalClimateUrl } from '../apiConfig.js';
import { HISTORICAL_CONTRACT } from './contract.js';
import { DEFAULT_INDEX, clampIndex, routeAt, labelAt, canZoomIn, canZoomOut } from './resolutions.js';
import { bucketsToSeries } from './chartData.js';
import { readChartColors } from './chartColors.js';
import { tempAxisValues, tempSeriesValue } from './chartFormat.js';

const CHART_HEIGHT = 380;
const FALLBACK_WIDTH = 640;
const LINE_WIDTH = 2;
const LOADING_TEXT = 'Loading climate history…';
const ERROR_TEXT = 'Couldn\'t load the climate history right now.';

/**
 * Drives the historical-climate line chart: fetches the current resolution,
 * renders it with uPlot, steps the zoom control through the resolution ladder,
 * and re-renders on theme change (so the canvas follows light/dark) and resize.
 *
 * The uPlot constructor and the DataFetcher factory are injected so the whole
 * controller is unit-testable without a real canvas (jsdom has none).
 */
export default class ClimateHistoryChart {
    #els;
    #uPlotCtor;
    #createFetcher;
    #index;
    #plot;
    #data;

    /**
     * @param {{chart: HTMLElement, status: HTMLElement, zoomIn: HTMLButtonElement, zoomOut: HTMLButtonElement, resolution: HTMLElement}} els
     * @param {Function} uPlotCtor      the uPlot constructor.
     * @param {Function} createFetcher  url → an object with a `fetch()` promise.
     */
    constructor(els, uPlotCtor, createFetcher = (url) => new DataFetcher(url, HISTORICAL_CONTRACT)) {
        this.#els = els;
        this.#uPlotCtor = uPlotCtor;
        this.#createFetcher = createFetcher;
        this.#index = DEFAULT_INDEX;
        this.#plot = null;
        this.#data = null;
    }

    /**
     * Wires the zoom buttons + theme/resize watchers and loads the default view.
     *
     * @return {Promise}
     */
    async start() {
        this.#els.zoomIn.addEventListener('click', () => { void this.#step(-1); });
        this.#els.zoomOut.addEventListener('click', () => { void this.#step(1); });
        this.#watchTheme();
        this.#watchResize();

        return this.#load();
    }

    async #step(delta) {
        const next = clampIndex(this.#index + delta);
        if (next === this.#index) {
            return;
        }
        this.#index = next;
        await this.#load();
    }

    async #load() {
        this.#updateControls();
        this.#setStatus(LOADING_TEXT);

        let buckets;
        try {
            buckets = await this.#createFetcher(this.#url()).fetch();
        } catch {
            this.#destroyPlot();
            this.#data = null;
            this.#setStatus(ERROR_TEXT);
            return;
        }

        this.#setStatus('');
        this.#render(buckets);
    }

    #url() {
        return `${historicalClimateUrl()}/${routeAt(this.#index)}`;
    }

    #updateControls() {
        this.#els.zoomIn.disabled = !canZoomIn(this.#index);
        this.#els.zoomOut.disabled = !canZoomOut(this.#index);
        this.#els.resolution.textContent = labelAt(this.#index);
    }

    #setStatus(text) {
        this.#els.status.textContent = text;
        this.#els.status.hidden = text === '';
    }

    #render(buckets) {
        const series = bucketsToSeries(buckets);
        this.#data = [series.x, series.insideMax, series.insideMin, series.outsideMax];
        this.#draw();
    }

    #draw() {
        this.#destroyPlot();
        this.#plot = new this.#uPlotCtor(this.#options(readChartColors()), this.#data, this.#els.chart);
    }

    #options(colors) {
        return {
            'width': this.#width(),
            'height': CHART_HEIGHT,
            'scales': { 'x': { 'time': true } },
            'axes': [
                { 'stroke': colors.axis, 'grid': { 'stroke': colors.grid }, 'ticks': { 'stroke': colors.grid } },
                { 'stroke': colors.axis, 'grid': { 'stroke': colors.grid }, 'ticks': { 'stroke': colors.grid }, 'values': tempAxisValues },
            ],
            'series': [
                {},
                { 'label': 'Inside max', 'stroke': colors.inside, 'width': LINE_WIDTH, 'value': tempSeriesValue },
                { 'label': 'Inside min', 'stroke': colors.inside, 'width': LINE_WIDTH, 'value': tempSeriesValue },
                { 'label': 'Outside max', 'stroke': colors.outside, 'width': LINE_WIDTH, 'value': tempSeriesValue },
            ],
            'bands': [
                { 'series': [1, 2], 'fill': colors.insideFill },
            ],
        };
    }

    #width() {
        return this.#els.chart.clientWidth || FALLBACK_WIDTH;
    }

    #destroyPlot() {
        if (this.#plot) {
            this.#plot.destroy();
            this.#plot = null;
        }
    }

    #watchTheme() {
        const observer = new MutationObserver(() => { this.#onThemeChange(); });
        observer.observe(document.documentElement, { 'attributes': true, 'attributeFilter': ['data-theme'] });

        if (typeof window.matchMedia === 'function') {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { this.#onThemeChange(); });
        }
    }

    #onThemeChange() {
        if (this.#data) {
            this.#draw();
        }
    }

    #watchResize() {
        window.addEventListener('resize', () => { this.#onResize(); });
    }

    #onResize() {
        if (this.#plot) {
            this.#plot.setSize({ 'width': this.#width(), 'height': CHART_HEIGHT });
        }
    }
}
