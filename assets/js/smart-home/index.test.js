import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
    STATUS_LINE_SELECTOR,
    ROOMS_SECTION_SELECTOR,
    HOME_TEMP_TABLE_SELECTOR,
    HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
    WEATHER_TABLE_SELECTOR,
    WEATHER_TABLE_UPDATE_TIME_SELECTOR,
} from './index.const.js';
import EN_GB from '../i18n/messages.en-GB.js';
import TableFactory from './TableFactory.js';
import SystemClock from '../Clock.js';

const { factoryCtor, ctor, runAll, setupSchedule, chartCtor, chartStart } = vi.hoisted(() => ({
    factoryCtor: vi.fn(),
    ctor: vi.fn(),
    runAll: vi.fn(() => Promise.resolve()),
    setupSchedule: vi.fn(),
    chartCtor: vi.fn(),
    chartStart: vi.fn(() => Promise.resolve()),
}));

vi.mock('./SmartHomePageFactory.js', () => ({
    default: class {
        constructor(...args) {
            factoryCtor(...args);
        }

        create(...args) {
            ctor(...args);

            return { runAll: () => runAll(), setupSchedule: () => setupSchedule() };
        }
    },
}));

// The vendored uPlot ESM is a large third-party module (and touches the canvas);
// stub it, and stub the chart controller so the boot test just checks wiring.
vi.mock('../vendor/uPlot.esm.js', () => ({ default: {} }));

vi.mock('../smart-home-historical/ClimateHistoryChart.js', () => ({
    default: class {
        constructor(...args) {
            chartCtor(...args);
        }

        start() {
            return chartStart();
        }
    },
}));

describe('smart-home/index.js', () => {
    beforeAll(async () => {
        await import('./index.js');
    });

    it('wires up the SmartHomePage on window load', async () => {
        document.body.innerHTML = `
            <h2 id="smart-home-title">Smart home</h2>
            <h3 id="rooms-heading">📐 Floor plan</h3>
            <h3 id="historical-heading">📜 Historical</h3>
            <h3 id="how-it-works-heading">🏗️ How it works</h3>
            <img class="floor-plan__image" alt="Floor plan of the house, with the temperature and humidity of each room">
            <img class="how-it-works" alt="Diagram showing how this page works">
            <span id="chart-resolution"></span>
            <button id="chart-metric-temp"></button>
            <button id="chart-metric-humidity"></button>
            <button id="chart-zoom-in"></button>
            <button id="chart-zoom-out"></button>
            <div id="historical-chart"></div>
            <p id="chart-status"></p>
            <script type="application/json" id="api-config">{"smartThingsClimate":{"urlProd":"https://cdn.example.com/climate","urlDev":"http://127.0.0.1:8080","useLocal":false},"metOfficeWeather":{"urlProd":"https://cdn.example.com/weather","urlDev":"http://127.0.0.1:8081","useLocal":false}}</script>`;

        window.dispatchEvent(new Event('load'));
        // The handler resolves the catalogue with a dynamic import now, so let
        // its microtasks drain before asserting on what it rendered.
        await new Promise((resolve) => setTimeout(resolve, 0));

        // In jsdom (no ?locale, navigator.languages ≈ en-US) the locale resolves
        // to the en-GB default: the headings and image alts are localised (to
        // their en-GB text) and the en-GB catalogue is threaded through.
        expect(document.getElementById('smart-home-title').textContent).toBe('Smart home');
        expect(document.getElementById('rooms-heading').textContent).toBe('📐 Floor plan');
        expect(document.getElementById('historical-heading').textContent).toBe('📜 Historical');
        expect(document.getElementById('how-it-works-heading').textContent).toBe('🏗️ How it works');
        expect(document.querySelector('.floor-plan__image').getAttribute('alt')).toBe('Floor plan of the house, with the temperature and humidity of each room');
        expect(document.querySelector('.how-it-works').getAttribute('alt')).toBe('Diagram showing how this page works');
        expect(ctor).toHaveBeenCalledWith(
            STATUS_LINE_SELECTOR,
            ROOMS_SECTION_SELECTOR,
            HOME_TEMP_TABLE_SELECTOR,
            HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
            WEATHER_TABLE_SELECTOR,
            WEATHER_TABLE_UPDATE_TIME_SELECTOR,
            EN_GB,
        );
        // The factory is handed the page's document, a clock, the table factory
        // and the two API URLs (the production CDN ones by default).
        const [factoryDocument, clock, tableFactory, climateUrl, weatherUrl] = factoryCtor.mock.calls[0];
        expect(factoryDocument).toBe(document);
        expect(clock).toBeInstanceOf(SystemClock);
        expect(tableFactory).toBeInstanceOf(TableFactory);
        expect(climateUrl).toBe('https://cdn.example.com/climate');
        expect(weatherUrl).toBe('https://cdn.example.com/weather');
        expect(runAll).toHaveBeenCalledTimes(1);
        expect(setupSchedule).toHaveBeenCalledTimes(1);

        // The historical chart is constructed with the queried chart elements,
        // the (stubbed) uPlot ctor, the default fetcher and the same catalogue,
        // then started.
        expect(chartCtor).toHaveBeenCalledTimes(1);
        const [chartEls, , createFetcher, chartCatalogue] = chartCtor.mock.calls[0];
        expect(chartEls.chart).toBe(document.getElementById('historical-chart'));
        expect(chartEls.metricTemp).toBe(document.getElementById('chart-metric-temp'));
        expect(chartEls.metricHumidity).toBe(document.getElementById('chart-metric-humidity'));
        expect(createFetcher).toBeUndefined();
        expect(chartCatalogue).toBe(EN_GB);
        expect(chartStart).toHaveBeenCalledTimes(1);
    });
});
