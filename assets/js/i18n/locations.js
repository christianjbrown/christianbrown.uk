'use strict';

/**
 * Localises a pipe-delimited list of raw location strings and joins them with the
 * locale's conjunction. Each item is mapped through the catalogue's
 * `locationNames` (falling back to the raw value when unmapped), then joined with
 * Intl.ListFormat — which supplies the localised "and" (und / et / y / e / og)
 * for free. A single location (no pipe) just returns its mapped value.
 *
 * @param {Object} catalogue
 * @param {String} pipeDelimited  e.g. "Singapore|London, UK" or "London, UK"
 *
 * @returns {String}
 */
export function formatLocations(catalogue, pipeDelimited) {
    const items = pipeDelimited.split('|').map((raw) => catalogue.locationNames[raw] ?? raw);

    return new Intl.ListFormat(catalogue.locale, { type: 'conjunction' }).format(items);
}
