import { describe, it, expect, beforeAll, vi } from 'vitest';

const { ctor, start } = vi.hoisted(() => ({
    ctor: vi.fn(),
    start: vi.fn(() => Promise.resolve()),
}));

// The vendored uPlot ESM is a large third-party module (and touches the canvas);
// stub it so the boot test doesn't import it.
vi.mock('../vendor/uPlot.esm.js', () => ({ default: {} }));

vi.mock('./ClimateHistoryChart.js', () => ({
    default: class {
        constructor(...args) {
            ctor(...args);
        }

        start() {
            return start();
        }
    },
}));

describe('smart-home-historical/index.js', () => {
    beforeAll(async () => {
        await import('./index.js');
    });

    it('wires up the ClimateHistoryChart on window load', () => {
        document.body.innerHTML = `
            <div id="climate-chart"></div>
            <p id="chart-status"></p>
            <button id="chart-zoom-in"></button>
            <button id="chart-zoom-out"></button>
            <span id="chart-resolution"></span>`;

        window.dispatchEvent(new Event('load'));

        expect(ctor).toHaveBeenCalledTimes(1);
        const [els, uPlot, createFetcher, locale] = ctor.mock.calls[0];
        expect(els.chart).toBe(document.getElementById('climate-chart'));
        expect(els.status).toBe(document.getElementById('chart-status'));
        expect(els.zoomIn).toBe(document.getElementById('chart-zoom-in'));
        expect(els.zoomOut).toBe(document.getElementById('chart-zoom-out'));
        expect(els.resolution).toBe(document.getElementById('chart-resolution'));
        expect(uPlot).toBeDefined();
        // The default fetcher is left in place; a resolved locale is threaded in.
        expect(createFetcher).toBeUndefined();
        expect(typeof locale).toBe('string');
        expect(start).toHaveBeenCalledTimes(1);
    });
});
