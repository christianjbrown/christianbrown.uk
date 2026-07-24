'use strict';

// Static + fixture server for the real-device (Percy on Automate) build.
//
// Serves the fixture-built `_site` AND the three live-data endpoints the page
// fetches (see _config_percy.yml, which points them here over the BrowserStack
// Local tunnel). Real devices hit `http://bs-local.com:9000/...`, which the
// tunnel routes to this server on the CI runner — so every device sees the same
// fixed climate/weather data and the snapshots stay deterministic.
//
// Deliberately dependency-free (node:http + node:fs) so it needs nothing beyond
// the site build.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';

const PORT = Number(process.env.PERCY_MOCK_PORT || 9000);
const ROOT = new URL('../_site/', import.meta.url).pathname;

// Fixed instant the fixtures are timed against. The clock can't be frozen on a
// real device, so time-based text ("It's currently…", "x ago") is hidden via
// percyCSS in percy/real-device.mjs instead; these timestamps just need to be
// stable and plausible.
const NOW_UNIX = Math.floor(Date.UTC(2026, 6, 24, 18, 41, 0) / 1000);
const ago = (seconds) => NOW_UNIX - seconds;
const envelope = (data, generatedSecondsAgo = 300) => JSON.stringify({
    data,
    success: true,
    timestamp_unix: ago(generatedSecondsAgo),
    version: '1.0.0',
});

const CLIMATE = envelope([
    { name: 'Hygrometer', roomName: 'Bedroom', temperatureValue: 26.5, temperatureTimestamp: ago(3600), temperatureStale: false, humidityValue: 51, humidityTimestamp: ago(3600), humidityStale: false },
    { name: 'Button', roomName: 'Study', temperatureValue: 26.6, temperatureTimestamp: ago(540), temperatureStale: false },
    { name: 'Motion sensor', roomName: 'Hallway', temperatureValue: 25.7, temperatureTimestamp: ago(600), temperatureStale: false },
    { name: 'Door sensor', roomName: 'Hallway', temperatureValue: 23.7, temperatureTimestamp: ago(900), temperatureStale: false },
    { name: 'Motion sensor', roomName: 'Living room', temperatureValue: 26.1, temperatureTimestamp: ago(3600), temperatureStale: false, humidityValue: 48, humidityTimestamp: ago(3600), humidityStale: false },
], 3600);

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

// The historical chart is masked in the snapshot, so its content is irrelevant —
// an empty-but-valid envelope keeps the fetch from erroring.
const HISTORICAL = envelope([]);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.webmanifest': 'application/manifest+json',
    '.txt': 'text/plain; charset=utf-8',
};

function apiBody(pathname) {
    if (pathname === '/api/climate') return CLIMATE;
    if (pathname === '/api/weather') return WEATHER;
    if (pathname.startsWith('/api/historical')) return HISTORICAL;
    return null;
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(url.pathname);

    const api = apiBody(pathname);
    if (api !== null) {
        // Same-origin as the served site, so no CORS is needed, but it is
        // harmless and keeps things robust if the origin ever differs.
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
        res.end(api);
        return;
    }

    // Static file from _site. Map "/" to index.html and prevent path escapes.
    let rel = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    if (rel.endsWith('/')) rel += 'index.html';
    let filePath = join(ROOT, rel);
    try {
        const info = await stat(filePath);
        if (info.isDirectory()) filePath = join(filePath, 'index.html');
        const body = await readFile(filePath);
        res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
        res.end(body);
    } catch {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('Not found');
    }
});

server.listen(PORT, () => console.log(`[mock-server] serving _site + /api/* on http://localhost:${PORT}`));
