'use strict';

// The live-data API endpoints, resolved from _config.yml at build time. The
// global layout serialises them into every page as an inert JSON
// <script id="api-config"> block — inert (type="application/json", not
// executable) so it satisfies the strict `script-src 'self'` CSP. Each API
// carries its production and dev URLs plus a per-API `useLocal` flag: when the
// flag is set the dev URL is used, otherwise production. Defaults are
// production, so a local `jekyll serve` still talks to the live CDN until a flag
// is flipped in _config.yml.

const CONFIG_ELEMENT_ID = 'api-config';

function readApiConfig() {
    const el = document.getElementById(CONFIG_ELEMENT_ID);
    if (!el) {
        throw new Error(`Missing API config: expected an inert JSON <script id="${CONFIG_ELEMENT_ID}"> in the page`);
    }

    return JSON.parse(el.textContent);
}

function resolveUrl(name) {
    const api = readApiConfig()[name];

    return api.useLocal ? api.urlDev : api.urlProd;
}

/**
 * @return {String} the SmartThings indoor-climate endpoint.
 */
export function smartThingsClimateUrl() {
    return resolveUrl('smartThingsClimate');
}

/**
 * @return {String} the Met Office outdoor-weather endpoint.
 */
export function metOfficeWeatherUrl() {
    return resolveUrl('metOfficeWeather');
}

/**
 * The historical-climate endpoint base. A resolution route (e.g. `/hourly-1-month`)
 * is appended to this by the caller.
 *
 * @return {String} the historical-climate endpoint base URL.
 */
export function historicalClimateUrl() {
    return resolveUrl('historicalClimate');
}
