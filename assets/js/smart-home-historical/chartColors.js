'use strict';

// The chart's colours live as CSS custom properties (defined per-theme in
// smart-home-historical.scss), so the canvas — coloured in JS — follows the
// site's light/dark themes. We read the resolved values off the document root
// and hand them to uPlot; on a theme change the chart re-reads them and rebuilds.

const PROPERTIES = {
    inside: '--cc-inside',
    insideFill: '--cc-inside-fill',
    outside: '--cc-outside',
    grid: '--cc-grid',
    axis: '--cc-axis',
    text: '--cc-text',
};

/**
 * @param {HTMLElement} root  defaults to the document element.
 * @return {{inside: String, insideFill: String, outside: String, grid: String, axis: String, text: String}}
 */
export function readChartColors(root = document.documentElement) {
    const style = getComputedStyle(root);
    const colors = {};

    for (const key of Object.keys(PROPERTIES)) {
        colors[key] = style.getPropertyValue(PROPERTIES[key]).trim();
    }

    return colors;
}
