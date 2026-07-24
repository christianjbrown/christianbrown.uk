'use strict';

// Percy on Automate (POA) — real-device visual snapshots.
//
// Drives real BrowserStack devices (iPhone/iPad Safari, Android Chrome) with
// Selenium and captures a true device screenshot per page via percyScreenshot.
// Unlike the web gate (percy/snapshot.mjs, which captures a DOM for Percy to
// re-render), this photographs the actual device.
//
// Determinism: the site is built with fixture feeds (_config_percy.yml) and
// served to the devices over a BrowserStack Local tunnel (percy/mock-server.mjs),
// so sensor/weather data is fixed. The device clock can't be frozen, so the few
// time-based bits ("It's currently…", "x ago", live CV role durations) are
// hidden with percyCSS below.
//
// Run: `percy exec -- node percy/real-device.mjs` with PERCY_TOKEN (the
// Automate-mode project token), BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY.

import { Builder } from 'selenium-webdriver';
// The DEFAULT export is percySnapshot (DOM-based, for the web project); Percy on
// Automate needs the named percyScreenshot, which photographs the real device.
import { percyScreenshot } from '@percy/selenium-webdriver';
import browserstack from 'browserstack-local';

const USERNAME = process.env.BROWSERSTACK_USERNAME;
const ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;
const HUB = 'https://hub-cloud.browserstack.com/wd/hub';
const BASE = 'http://bs-local.com:9000';

if (!USERNAME || !ACCESS_KEY) {
    console.error('BROWSERSTACK_USERNAME / BROWSERSTACK_ACCESS_KEY are required');
    process.exit(2);
}

// Hidden on every snapshot: the one-time cookie prompt, the time-based summary
// and freshness lines, the per-reading "x ago" labels, the live CV role
// durations, and the time-series history canvas — everything whose value moves
// with the wall clock rather than the fixture data.
const PERCY_CSS = [
    '#cookies { display: none !important; }',
    '#status-line { visibility: hidden !important; }',
    '.update-time__freshness { visibility: hidden !important; }',
    '#home-temperature-table td:first-child .smart-home-table__value--secondary { visibility: hidden !important; }',
    '.cv-experience-job-metadata-dates { visibility: hidden !important; }',
    // Drop the tall history-chart and FAQ sections from the capture entirely.
    // Real iOS Safari 500s on very tall full-page screenshots, and the smart-home
    // page (profile + tables + floor plan + history + FAQ) exceeds that. The
    // tables and floor plan — the visual content that matters — sit above these,
    // so nothing important is lost. (display:none removes their height, unlike the
    // history canvas being merely masked.)
    '.floor-plan-section, .historical-section, .faq { display: none !important; }',
].join('\n');

const DEVICES = [
    { label: 'iPhone', browserName: 'safari', deviceName: 'iPhone 15', osVersion: '17' },
    { label: 'iPad', browserName: 'safari', deviceName: 'iPad Pro 12.9 2022', osVersion: '16' },
    { label: 'Android', browserName: 'chrome', deviceName: 'Google Pixel 8', osVersion: '14' },
];

const PAGES = [
    {
        name: 'Homepage',
        path: '/',
        ready: `
            var l = document.querySelector('#cv-home-temp');
            return !!l && l.hidden === false && (l.textContent || '').trim().length > 0;
        `,
    },
    {
        name: 'Smart home',
        path: '/smart-home.html',
        ready: `
            var rows = function (s) { return document.querySelectorAll(s + ' tr').length; };
            var status = (document.querySelector('#status-line') || {}).textContent || '';
            return rows('#home-temperature-table') > 1 && rows('#weather-table') > 1 && !/Loading/.test(status);
        `,
    },
];

function capsFor(device) {
    return {
        browserName: device.browserName,
        'bstack:options': {
            deviceName: device.deviceName,
            osVersion: device.osVersion,
            realMobile: 'true',
            local: 'true',
            userName: USERNAME,
            accessKey: ACCESS_KEY,
            projectName: 'christianbrown.uk',
            buildName: `real-device ${process.env.GITHUB_SHA || 'local'}`,
            sessionName: device.label,
        },
    };
}

async function startTunnel() {
    const local = new browserstack.Local();
    await new Promise((resolve, reject) => {
        local.start({ key: ACCESS_KEY, forceLocal: true }, (err) => (err ? reject(err) : resolve()));
    });
    return local;
}

async function runDevice(device) {
    const driver = await new Builder().usingServer(HUB).withCapabilities(capsFor(device)).build();
    try {
        for (const page of PAGES) {
            await driver.get(`${BASE}${page.path}`);
            await driver.wait(async () => {
                try {
                    return await driver.executeScript(page.ready);
                } catch {
                    return false;
                }
            }, 30000, `${device.label}: ${page.name} did not finish rendering`);
            await percyScreenshot(driver, page.name, { fullPage: true, percyCSS: PERCY_CSS });
            console.log(`captured ${page.name} on ${device.label}`);
        }
    } finally {
        await driver.quit();
    }
}

async function main() {
    const tunnel = await startTunnel();
    try {
        // Sequential keeps within the 5 parallel-session limit with room to spare
        // and makes CI logs readable; the whole run is a handful of pages.
        for (const device of DEVICES) {
            await runDevice(device);
        }
    } finally {
        await new Promise((resolve) => tunnel.stop(() => resolve()));
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
