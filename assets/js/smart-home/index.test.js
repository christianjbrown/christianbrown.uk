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

const { ctor, runAll, setupSchedule, chartCtor, chartStart } = vi.hoisted(() => ({
    ctor: vi.fn(),
    runAll: vi.fn(() => Promise.resolve()),
    setupSchedule: vi.fn(),
    chartCtor: vi.fn(),
    chartStart: vi.fn(() => Promise.resolve()),
}));

vi.mock('./SmartHomePage.js', () => ({
    default: class {
        constructor(...args) {
            ctor(...args);
        }

        runAll() {
            return runAll();
        }

        setupSchedule() {
            return setupSchedule();
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

    it('wires up the SmartHomePage on window load', () => {
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
            <p id="chart-status"></p>`;

        window.dispatchEvent(new Event('load'));

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
