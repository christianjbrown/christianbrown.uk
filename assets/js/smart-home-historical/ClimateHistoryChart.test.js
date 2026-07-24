import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { dataFetcherCtor, dataFetcherFetch } = vi.hoisted(() => ({
    dataFetcherCtor: vi.fn(),
    dataFetcherFetch: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../apiConfig.js', () => ({
    historicalClimateUrl: () => 'https://api.test/get-historical-climate-data',
}));

vi.mock('../DataFetcher.js', () => ({
    default: class {
        constructor(...args) {
            dataFetcherCtor(...args);
        }

        fetch() {
            return dataFetcherFetch();
        }
    },
}));

import ClimateHistoryChart from './ClimateHistoryChart.js';
import { HISTORICAL_CONTRACT } from './contract.js';

const BASE = 'https://api.test/get-historical-climate-data';
const BUCKETS = [
    {
        date: '2026-07-19',
        insideMaxTemp: 24.1, insideMinTemp: 19.3, outsideMaxTemp: 22.6,
        insideMaxHumidity: 58, insideMinHumidity: 41, outsideMaxHumidity: 73,
    },
    {
        date: '2026-07-20',
        insideMaxTemp: 25.0, insideMinTemp: 20.1, outsideMaxTemp: null,
        insideMaxHumidity: 60, insideMinHumidity: 44, outsideMaxHumidity: null,
    },
];

const COLOR_VARS = {
    '--cc-inside': '#75923c',
    '--cc-inside-fill': 'rgba(117,146,60,.18)',
    '--cc-outside': '#555',
    '--cc-grid': '#aaa',
    '--cc-axis': '#aaa',
    '--cc-text': '#222',
};

let themeObserverCb;
let mediaChangeCb;

function fakeUplot() {
    const instances = [];
    function FakeUplot(opts, data, target) {
        this.opts = opts;
        this.data = data;
        this.target = target;
        this.destroy = vi.fn();
        this.setSize = vi.fn();
        instances.push(this);
    }
    FakeUplot.instances = instances;
    return FakeUplot;
}

function resolvingFetcher(buckets = BUCKETS) {
    const urls = [];
    const factory = (url) => {
        urls.push(url);
        return { fetch: () => Promise.resolve(buckets) };
    };
    factory.urls = urls;
    return factory;
}

function rejectingFetcher() {
    return () => ({ fetch: () => Promise.reject(new Error('boom')) });
}

function makeEls() {
    const chart = document.createElement('div');
    const status = document.createElement('p');
    const zoomIn = document.createElement('button');
    const zoomOut = document.createElement('button');
    const resolution = document.createElement('span');
    const metricTemp = document.createElement('button');
    const metricHumidity = document.createElement('button');
    document.body.append(chart, status, zoomIn, zoomOut, resolution, metricTemp, metricHumidity);
    return { chart, status, zoomIn, zoomOut, resolution, metricTemp, metricHumidity };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
    dataFetcherCtor.mockClear();
    dataFetcherFetch.mockClear();
    document.body.innerHTML = '';
    Object.entries(COLOR_VARS).forEach(([prop, value]) => document.documentElement.style.setProperty(prop, value));

    themeObserverCb = null;
    vi.stubGlobal('MutationObserver', class {
        constructor(cb) {
            themeObserverCb = cb;
        }

        observe() {}

        disconnect() {}
    });

    mediaChangeCb = null;
    window.matchMedia = () => ({ matches: false, addEventListener: (event, cb) => { mediaChangeCb = cb; } });
});

afterEach(() => {
    vi.unstubAllGlobals();
    Object.keys(COLOR_VARS).forEach((prop) => document.documentElement.style.removeProperty(prop));
    delete window.matchMedia;
});

describe('ClimateHistoryChart', () => {
    it('renders the default (hourly-1-month) view on start, coloured from the CSS tokens', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        const fetcher = resolvingFetcher();

        await new ClimateHistoryChart(els, uPlot, fetcher).start();

        expect(fetcher.urls).toEqual([`${BASE}/hourly-1-month`]);
        expect(uPlot.instances).toHaveLength(1);

        const plot = uPlot.instances[0];
        expect(plot.target).toBe(els.chart);
        // Legend order (left→right): outside, inside min, inside max — so the data
        // columns are [x, outsideMax, insideMin, insideMax]; the null outside is a gap.
        expect(plot.data).toEqual([
            [Date.UTC(2026, 6, 19) / 1000, Date.UTC(2026, 6, 20) / 1000],
            [22.6, null],
            [19.3, 20.1],
            [24.1, 25.0],
        ]);
        expect(plot.opts.series[1].stroke).toBe('#555');
        expect(plot.opts.series[2].stroke).toBe('#75923c');
        expect(plot.opts.series[3].stroke).toBe('#75923c');
        expect(plot.opts.series[1].label).toBe('Outside temperature');
        expect(plot.opts.series[2].label).toBe('Inside min temperature');
        expect(plot.opts.series[3].label).toBe('Inside max temperature');
        // Band between inside max (series 3, upper) and inside min (series 2, lower).
        expect(plot.opts.bands[0]).toEqual({ series: [3, 2], fill: 'rgba(117,146,60,.18)' });
        // Locale-aware date formatters are wired onto the x axis and its readout.
        expect(plot.opts.axes[0].values).toBeTypeOf('function');
        expect(plot.opts.series[0].value).toBeTypeOf('function');
        // The default (hourly) view does not pin the ticks to whole days.
        expect(plot.opts.axes[0].incrs).toBeUndefined();

        expect(els.status.hidden).toBe(true);
        expect(els.resolution.textContent).toBe('Last month · hourly');
        expect(els.zoomIn.disabled).toBe(false);
        expect(els.zoomOut.disabled).toBe(false);
        // Localised aria-labels come from the catalogue (en-GB by default).
        expect(els.zoomIn.getAttribute('aria-label')).toBe('Zoom in — finer resolution, shorter range');
        expect(els.zoomOut.getAttribute('aria-label')).toBe('Zoom out — coarser resolution, longer range');
        // The metric toggle defaults to temperature (pressed) with humidity off.
        expect(els.metricTemp.getAttribute('aria-pressed')).toBe('true');
        expect(els.metricHumidity.getAttribute('aria-pressed')).toBe('false');
        expect(els.metricTemp.getAttribute('aria-label')).toBe('Show temperature');
        expect(els.metricHumidity.getAttribute('aria-label')).toBe('Show humidity');
    });

    it('switches to the humidity metric on toggle — no re-fetch, new labels and % readout', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        const fetcher = resolvingFetcher();
        await new ClimateHistoryChart(els, uPlot, fetcher).start();

        const fetchesBefore = fetcher.urls.length;
        els.metricHumidity.dispatchEvent(new Event('click'));
        await flush();

        // A metric switch re-draws from the data already in hand — no new fetch.
        expect(fetcher.urls.length).toBe(fetchesBefore);
        expect(uPlot.instances).toHaveLength(2);

        const plot = uPlot.instances.at(-1);
        // Humidity columns: outside = outsideMaxHumidity (null → gap), then the
        // inside min/max that form the band.
        expect(plot.data).toEqual([
            [Date.UTC(2026, 6, 19) / 1000, Date.UTC(2026, 6, 20) / 1000],
            [73, null],
            [41, 44],
            [58, 60],
        ]);
        expect(plot.opts.series[1].label).toBe('Outside humidity');
        expect(plot.opts.series[2].label).toBe('Inside min humidity');
        expect(plot.opts.series[3].label).toBe('Inside max humidity');
        // The y-axis and legend now read in percent.
        expect(plot.opts.axes[1].values({}, [30, 60])).toEqual(['30%', '60%']);
        expect(plot.opts.series[1].value({}, 73)).toBe('73%');

        // aria-pressed follows the active metric.
        expect(els.metricTemp.getAttribute('aria-pressed')).toBe('false');
        expect(els.metricHumidity.getAttribute('aria-pressed')).toBe('true');
    });

    it('ignores a click on the already-active metric', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        await new ClimateHistoryChart(els, uPlot, resolvingFetcher()).start();

        // Already on temperature: clicking it again is a no-op (no redraw).
        els.metricTemp.dispatchEvent(new Event('click'));
        await flush();
        expect(uPlot.instances).toHaveLength(1);
    });

    it('uses the provided catalogue for the series, resolution and status text', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        const catalogue = {
            locale: 'de-DE',
            climateHistory: {
                title: 'Klimaverlauf',
                loading: 'Wird geladen …',
                error: 'Fehler.',
                zoomInLabel: 'Vergrößern',
                zoomOutLabel: 'Verkleinern',
                series: { outside: 'Außentemperatur', insideMin: 'Innen (Min.)', insideMax: 'Innen (Max.)' },
                humiditySeries: { outside: 'Außenluftfeuchte', insideMin: 'Innen (Min.)', insideMax: 'Innen (Max.)' },
                metricToggle: { temperature: 'Temperatur anzeigen', humidity: 'Luftfeuchte anzeigen' },
                resolutions: { 'hourly-1-month': 'Letzter Monat · stündlich' },
            },
        };

        await new ClimateHistoryChart(els, uPlot, resolvingFetcher(), catalogue).start();

        expect(els.resolution.textContent).toBe('Letzter Monat · stündlich');
        expect(els.zoomIn.getAttribute('aria-label')).toBe('Vergrößern');
        expect(els.metricTemp.getAttribute('aria-label')).toBe('Temperatur anzeigen');
        expect(els.metricHumidity.getAttribute('aria-label')).toBe('Luftfeuchte anzeigen');
        expect(uPlot.instances[0].opts.series[1].label).toBe('Außentemperatur');
        expect(uPlot.instances[0].opts.series[3].label).toBe('Innen (Max.)');
    });

    it('pins the x-axis to whole-day ticks on the daily resolutions', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        await new ClimateHistoryChart(els, uPlot, resolvingFetcher()).start();

        // Step from hourly-1-month (index 1) to daily-1-month (index 2).
        els.zoomOut.dispatchEvent(new Event('click'));
        await flush();

        expect(els.resolution.textContent).toBe('Last month · daily');
        expect(uPlot.instances.at(-1).opts.axes[0].incrs[0]).toBe(86400);
    });

    it('falls back to a fixed width when the container has no measured width', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();

        await new ClimateHistoryChart(els, uPlot, resolvingFetcher()).start();

        expect(uPlot.instances[0].opts.width).toBe(640);
    });

    it('sizes the chart to the container width when it has one', async () => {
        const els = makeEls();
        Object.defineProperty(els.chart, 'clientWidth', { value: 820, configurable: true });
        const uPlot = fakeUplot();

        await new ClimateHistoryChart(els, uPlot, resolvingFetcher()).start();

        expect(uPlot.instances[0].opts.width).toBe(820);
    });

    it('shows an error and draws no chart when the fetch fails', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();

        await new ClimateHistoryChart(els, uPlot, rejectingFetcher()).start();

        expect(uPlot.instances).toHaveLength(0);
        expect(els.status.hidden).toBe(false);
        expect(els.status.textContent).toBe('Couldn\'t load the climate history right now.');
    });

    it('constructs a DataFetcher with the historical contract by default', async () => {
        const els = makeEls();
        dataFetcherFetch.mockResolvedValueOnce(BUCKETS);

        await new ClimateHistoryChart(els, fakeUplot()).start();

        expect(dataFetcherCtor).toHaveBeenCalledWith(`${BASE}/hourly-1-month`, HISTORICAL_CONTRACT);
    });

    it('zooms in and out along the ladder, disabling the buttons at the ends', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        const fetcher = resolvingFetcher();
        await new ClimateHistoryChart(els, uPlot, fetcher).start();

        // Zoom all the way in.
        els.zoomIn.dispatchEvent(new Event('click'));
        await flush();
        expect(fetcher.urls.at(-1)).toBe(`${BASE}/hourly-day`);
        expect(els.zoomIn.disabled).toBe(true);
        expect(els.resolution.textContent).toBe('Last day · hourly');

        // Already at the finest resolution: another click is a no-op (no new fetch).
        const beforeCount = fetcher.urls.length;
        els.zoomIn.dispatchEvent(new Event('click'));
        await flush();
        expect(fetcher.urls.length).toBe(beforeCount);

        // Zoom all the way out.
        for (let i = 0; i < 5; i++) {
            els.zoomOut.dispatchEvent(new Event('click'));
            await flush();
        }
        expect(fetcher.urls.at(-1)).toBe(`${BASE}/daily-12-month`);
        expect(els.zoomOut.disabled).toBe(true);

        // Already at the longest window: a further zoom-out is a no-op.
        const outCount = fetcher.urls.length;
        els.zoomOut.dispatchEvent(new Event('click'));
        await flush();
        expect(fetcher.urls.length).toBe(outCount);
    });

    it('rebuilds the chart (destroying the old one) on a data-theme change', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        await new ClimateHistoryChart(els, uPlot, resolvingFetcher()).start();

        const first = uPlot.instances[0];
        themeObserverCb();

        expect(first.destroy).toHaveBeenCalledTimes(1);
        expect(uPlot.instances).toHaveLength(2);
    });

    it('rebuilds on an OS colour-scheme change when matchMedia is available', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        await new ClimateHistoryChart(els, uPlot, resolvingFetcher()).start();

        expect(mediaChangeCb).toBeTypeOf('function');
        mediaChangeCb();

        expect(uPlot.instances).toHaveLength(2);
    });

    it('still works when matchMedia is unavailable', async () => {
        delete window.matchMedia;
        const els = makeEls();
        const uPlot = fakeUplot();

        await new ClimateHistoryChart(els, uPlot, resolvingFetcher()).start();

        // No throw; the data-theme observer still drives rebuilds.
        themeObserverCb();
        expect(uPlot.instances).toHaveLength(2);
    });

    it('ignores a theme change before any chart has been drawn', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        await new ClimateHistoryChart(els, uPlot, rejectingFetcher()).start();

        themeObserverCb();

        expect(uPlot.instances).toHaveLength(0);
    });

    it('resizes the chart on a window resize', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        await new ClimateHistoryChart(els, uPlot, resolvingFetcher()).start();

        window.dispatchEvent(new Event('resize'));

        expect(uPlot.instances[0].setSize).toHaveBeenCalledWith({ width: 640, height: 380 });
    });

    it('ignores a resize before any chart has been drawn', async () => {
        const els = makeEls();
        const uPlot = fakeUplot();
        await new ClimateHistoryChart(els, uPlot, rejectingFetcher()).start();

        expect(() => window.dispatchEvent(new Event('resize'))).not.toThrow();
    });
});
