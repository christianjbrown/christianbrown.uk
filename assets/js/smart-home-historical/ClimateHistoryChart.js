'use strict';

import DataFetcher from '../DataFetcher.js';
import { historicalClimateUrl } from '../apiConfig.js';
import EN_GB from '../i18n/messages.en-GB.js';
import { HISTORICAL_CONTRACT } from './contract.js';
import { DEFAULT_INDEX, clampIndex, routeAt, isHourly, canZoomIn, canZoomOut } from './resolutions.js';
import { bucketsToSeries } from './chartData.js';
import { readChartColors } from './chartColors.js';
import { tempAxisValues, tempSeriesValue, humidityAxisValues, humiditySeriesValue } from './chartFormat.js';
import { makeAxisValues, makePointValue, DAY_INCRS } from './chartTime.js';

const CHART_HEIGHT = 380;
const FALLBACK_WIDTH = 640;
const LINE_WIDTH = 2;
const DEFAULT_METRIC = 'temp';

/**
 * Drives the historical-climate line chart: fetches the current resolution,
 * renders it with uPlot, steps the zoom control through the resolution ladder,
 * toggles between the temperature and humidity metric (both arrive in every
 * fetch, so switching only re-draws — no re-fetch), and re-renders on theme
 * change (so the canvas follows light/dark) and resize.
 *
 * The uPlot constructor and the DataFetcher factory are injected so the whole
 * controller is unit-testable without a real canvas (jsdom has none).
 */
export default class ClimateHistoryChart {
    #els;
    #uPlotCtor;
    #createFetcher;
    #strings;
    #locale;
    #index;
    #metric;
    #plot;
    #series;

    /**
     * @param {{chart: HTMLElement, status: HTMLElement, zoomIn: HTMLButtonElement, zoomOut: HTMLButtonElement, resolution: HTMLElement, metricTemp: HTMLButtonElement, metricHumidity: HTMLButtonElement}} els
     * @param {Function} uPlotCtor      the uPlot constructor.
     * @param {Function} createFetcher  url → an object with a `fetch()` promise.
     * @param {Object}   catalogue      a message catalogue (defaults to en-GB); its
     *                                  `climateHistory` block supplies the labels and
     *                                  its `locale` drives the date formatting.
     */
    constructor(els, uPlotCtor, createFetcher = (url) => new DataFetcher(url, HISTORICAL_CONTRACT), catalogue = EN_GB) {
        this.#els = els;
        this.#uPlotCtor = uPlotCtor;
        this.#createFetcher = createFetcher;
        this.#strings = catalogue.climateHistory;
        this.#locale = catalogue.locale;
        this.#index = DEFAULT_INDEX;
        this.#metric = DEFAULT_METRIC;
        this.#plot = null;
        this.#series = null;
    }

    /**
     * Wires the zoom buttons + theme/resize watchers and loads the default view.
     *
     * @return {Promise}
     */
    async start() {
        this.#els.zoomIn.setAttribute('aria-label', this.#strings.zoomInLabel);
        this.#els.zoomOut.setAttribute('aria-label', this.#strings.zoomOutLabel);
        this.#els.zoomIn.addEventListener('click', () => { void this.#step(-1); });
        this.#els.zoomOut.addEventListener('click', () => { void this.#step(1); });
        this.#els.metricTemp.setAttribute('aria-label', this.#strings.metricToggle.temperature);
        this.#els.metricHumidity.setAttribute('aria-label', this.#strings.metricToggle.humidity);
        this.#els.metricTemp.addEventListener('click', () => { this.#setMetric('temp'); });
        this.#els.metricHumidity.addEventListener('click', () => { this.#setMetric('humidity'); });
        this.#updateMetricControls();
        this.#watchTheme();
        this.#watchResize();

        return this.#load();
    }

    // Both metrics arrive in every fetch, so a switch only re-draws the series
    // already in hand.
    #setMetric(metric) {
        if (metric === this.#metric) {
            return;
        }
        this.#metric = metric;
        this.#updateMetricControls();
        if (this.#series) {
            this.#draw();
        }
    }

    #updateMetricControls() {
        this.#els.metricTemp.setAttribute('aria-pressed', String(this.#metric === 'temp'));
        this.#els.metricHumidity.setAttribute('aria-pressed', String(this.#metric === 'humidity'));
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
        this.#setStatus(this.#strings.loading);

        let buckets;
        try {
            buckets = await this.#createFetcher(this.#url()).fetch();
        } catch {
            this.#destroyPlot();
            this.#series = null;
            this.#setStatus(this.#strings.error);
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
        this.#els.resolution.textContent = this.#strings.resolutions[routeAt(this.#index)];
    }

    #setStatus(text) {
        this.#els.status.textContent = text;
        this.#els.status.hidden = text === '';
    }

    #render(buckets) {
        // Keep both metric trios so the toggle can re-draw without re-fetching.
        this.#series = bucketsToSeries(buckets);
        this.#draw();
    }

    #draw() {
        const cols = this.#series[this.#metric];
        // Column order matches the series/legend order below: outside, then the
        // inside min/max that form the band.
        const data = [this.#series.x, cols.outside, cols.insideMin, cols.insideMax];
        this.#destroyPlot();
        this.#plot = new this.#uPlotCtor(this.#options(readChartColors()), data, this.#els.chart);
    }

    // The per-metric labels and y-axis/legend formatters: temperature reads in
    // °C, humidity in %. The colours and the inside min/max band are shared.
    #metricFormat() {
        if (this.#metric === 'humidity') {
            return { labels: this.#strings.humiditySeries, axisValues: humidityAxisValues, seriesValue: humiditySeriesValue };
        }
        return { labels: this.#strings.series, axisValues: tempAxisValues, seriesValue: tempSeriesValue };
    }

    #options(colors) {
        const hourly = isHourly(this.#index);
        const { labels, axisValues, seriesValue } = this.#metricFormat();
        const timeAxis = {
            'stroke': colors.axis,
            'grid': { 'stroke': colors.grid },
            'ticks': { 'stroke': colors.grid },
            'values': makeAxisValues(this.#locale, hourly),
        };
        // Daily view: pin ticks to whole days (or longer) so a short range never
        // shows sub-day (hour) ticks.
        if (!hourly) {
            timeAxis.incrs = DAY_INCRS;
        }

        return {
            'width': this.#width(),
            'height': CHART_HEIGHT,
            'scales': { 'x': { 'time': true } },
            'axes': [
                timeAxis,
                { 'stroke': colors.axis, 'grid': { 'stroke': colors.grid }, 'ticks': { 'stroke': colors.grid }, 'values': axisValues },
            ],
            'series': [
                { 'value': makePointValue(this.#locale) },
                { 'label': labels.outside, 'stroke': colors.outside, 'width': LINE_WIDTH, 'value': seriesValue },
                { 'label': labels.insideMin, 'stroke': colors.inside, 'width': LINE_WIDTH, 'value': seriesValue },
                { 'label': labels.insideMax, 'stroke': colors.inside, 'width': LINE_WIDTH, 'value': seriesValue },
            ],
            // Fill the band between inside max (upper, series 3) and inside min
            // (lower, series 2).
            'bands': [
                { 'series': [3, 2], 'fill': colors.insideFill },
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
        if (this.#series) {
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
