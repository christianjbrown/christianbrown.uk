'use strict';

// Percy visual-regression driver.
//
// Percy captures a *static* DOM snapshot and re-renders it in its own browsers
// at each configured width — it does not re-run the page's JavaScript. So this
// script's job is to get each page into a deterministic, fully-rendered state
// locally (with Playwright), then hand that DOM to Percy:
//
//   * the live climate/weather/historical feeds are stubbed with fixtures, so
//     the tables, floor plan and header temperature link always render the same
//     content (and no real network is needed in CI);
//   * the clock is pinned, so every "x ago" label, the "It's currently …"
//     summary and the CV's live role durations are identical each run;
//   * the timezone is pinned to Europe/London so those times read as BST/GMT.
//
// Run via `npm run test:visual` (which wraps this in `percy exec`). With no
// PERCY_TOKEN, `percy exec` disables uploads and the snapshots become no-ops,
// so this stays green on forks and local runs.

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import percySnapshot from '@percy/playwright';

const PORT = Number(process.env.PERCY_SNAPSHOT_PORT || 8080);
const BASE = `http://127.0.0.1:${PORT}`;

// A fixed instant so clocks, "x ago" labels and live durations never drift.
// 2026-07-24 19:41 BST (18:41 UTC) — the sample readings below are timed
// relative to this.
const FIXED_MS = Date.UTC(2026, 6, 24, 18, 41, 0);
const NOW_UNIX = Math.floor(FIXED_MS / 1000);
const ago = (seconds) => NOW_UNIX - seconds;

// Every endpoint wraps its payload in this envelope:
//   { data, success, timestamp_unix, version }
const envelope = (data, generatedSecondsAgo = 300) => ({
    data,
    success: true,
    timestamp_unix: ago(generatedSecondsAgo),
    version: '1.0.0',
});

// Indoor climate — a representative spread of rooms/devices, a couple carrying
// humidity. Drives the smart-home inside-climate table and floor plan, and the
// homepage header temperature link (same endpoint).
const CLIMATE = envelope([
    { name: 'Hygrometer', roomName: 'Bedroom', temperatureValue: 26.5, temperatureTimestamp: ago(3600), temperatureStale: false, humidityValue: 51, humidityTimestamp: ago(3600), humidityStale: false },
    { name: 'Button', roomName: 'Study', temperatureValue: 26.6, temperatureTimestamp: ago(540), temperatureStale: false },
    { name: 'Motion sensor', roomName: 'Hallway', temperatureValue: 25.7, temperatureTimestamp: ago(600), temperatureStale: false },
    { name: 'Door sensor', roomName: 'Hallway', temperatureValue: 23.7, temperatureTimestamp: ago(900), temperatureStale: false },
    { name: 'Motion sensor', roomName: 'Living room', temperatureValue: 26.1, temperatureTimestamp: ago(3600), temperatureStale: false, humidityValue: 48, humidityTimestamp: ago(3600), humidityStale: false },
], 3600);

// Outdoor weather — one forecast hour carrying the full spread of optional
// readings so the weather table renders every row.
const WEATHER = envelope({
    valid_from: NOW_UNIX,
    valid_to: NOW_UNIX + 3600,
    type_name: 'CLOUDY',
    temp: 26.1,
    temp_feels_like: 26.3,
    humidity: 39,
    precipitation: 5,
    wind_speed: 8,
    wind_direction: 'SW',
    wind_direction_degrees: 225,
    wind_gust: 14,
    dew_point: 11,
    pressure: 1013,
    uv_index: 4,
    visibility: 20000,
});

// The historical chart is masked in .percy.yml, so its content is irrelevant —
// return an empty-but-valid envelope purely to keep the console quiet.
const HISTORICAL = envelope([]);

// Match the production CDN paths (see _config.yml). Glob-matched so the query
// string / origin don't matter.
const ROUTES = [
    ['**/get-smartthings-climate*', CLIMATE],
    ['**/get-met-office-weather*', WEATHER],
    ['**/get-historical-climate-data*', HISTORICAL],
];

const PAGES = [
    {
        name: 'Homepage',
        path: '/',
        // The header temperature link stays hidden until the (stubbed) climate
        // feed resolves and fills it in.
        ready: () => {
            const link = document.querySelector('#cv-home-temp');
            return !!link && link.hidden === false && link.textContent.trim().length > 0;
        },
    },
    {
        name: 'Smart home',
        path: '/smart-home.html',
        // Both tables populated and the status line swapped out of "[Loading..]".
        ready: () => {
            const rows = (sel) => document.querySelectorAll(`${sel} tr`).length;
            const status = document.querySelector('#status-line')?.textContent || '';
            return rows('#home-temperature-table') > 1 && rows('#weather-table') > 1 && !/Loading/.test(status);
        },
    },
];

function fulfilJson(route, body) {
    return route.fulfill({
        status: 200,
        contentType: 'application/json',
        // These are fetched cross-origin (cdn.christianbrown.uk); without an
        // Access-Control-Allow-Origin header the browser blocks the response and
        // the fetch fails.
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(body),
    });
}

async function startServer() {
    const server = spawn('npx', ['http-server', '_site', '-p', String(PORT), '-s', '-c-1'], { stdio: 'ignore' });
    for (let i = 0; i < 50; i++) {
        try {
            const res = await fetch(`${BASE}/`);
            if (res.ok) {
                return server;
            }
        } catch {
            // not up yet
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
    }
    server.kill();
    throw new Error(`Static server did not start on ${BASE}`);
}

async function main() {
    const server = await startServer();
    const browser = await chromium.launch();

    try {
        for (const pageDef of PAGES) {
            const context = await browser.newContext({
                viewport: { width: 1280, height: 1024 },
                timezoneId: 'Europe/London',
                deviceScaleFactor: 1,
            });
            const page = await context.newPage();

            // Pin Date/now only — timers keep ticking so rendering and Playwright's
            // own polling still work.
            await page.clock.setFixedTime(FIXED_MS);

            for (const [pattern, body] of ROUTES) {
                await page.route(pattern, (route) => fulfilJson(route, body));
            }

            await page.goto(`${BASE}${pageDef.path}`, { waitUntil: 'load' });
            await page.waitForFunction(pageDef.ready, null, { timeout: 15000 });
            // Let fonts and images settle so text metrics and the floor plan are stable.
            await page.waitForLoadState('networkidle').catch(() => {});
            await page.evaluate(() => document.fonts && document.fonts.ready);

            await percySnapshot(page, pageDef.name);
            await context.close();
        }
    } finally {
        await browser.close();
        server.kill();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
