'use strict';

/**
 * The thin coordinator behind a smart-home table: it asks the data fetcher for
 * the payload, then tells the renderer what to draw, with the formatter wording
 * the readings. Subclasses override the `_render*` hooks to say what their table
 * contains.
 */
export default class UpdatingKeyValuePairTable {
    #dataFetcher;
    #renderer;
    #errorRenderer;
    #formatter;
    #logger;
    #lastData = null;
    // Protected (not #private) so subclasses can read the catalogue when building
    // their own labels.
    _catalogue;
    // Protected so subclasses can build their own elements and word their own times.
    _renderer;
    _formatter;

    /**
     * @param {Object} collaborators
     * @param {{fetch: function(): Promise<*>, getGeneratedAtUnix: function(): (Number|null)}} collaborators.dataFetcher
     * @param {import('./TableRenderer.js').default}       collaborators.renderer
     * @param {import('./TableErrorRenderer.js').default}  collaborators.errorRenderer
     * @param {import('./ReadingFormatter.js').default}    collaborators.formatter
     * @param {{error: function(*): void}}                 collaborators.logger  where fetch failures are reported
     * @param {Object}                                     collaborators.catalogue  message catalogue
     */
    constructor({ dataFetcher, renderer, errorRenderer, formatter, logger, catalogue }) {
        this.#dataFetcher = dataFetcher;
        this.#renderer = renderer;
        this.#errorRenderer = errorRenderer;
        this.#formatter = formatter;
        this.#logger = logger;
        this._catalogue = catalogue;
        this._renderer = renderer;
        this._formatter = formatter;
    }

    /**
     * Fetches an update from the URL and parses the response.
     *
     * @return {Promise}
     */
    async update() {
        return this.#dataFetcher.fetch()
            .then(
                (data) => {
                    this.#lastData = data;
                    this.#renderer.clear();
                    this._renderHeader();
                    this._renderUpdate(data, this.#dataFetcher.getGeneratedAtUnix());
                }
            )
            .catch(
                (err) => {
                    this.#lastData = null;
                    this.#renderer.clear();
                    this._renderHeader();
                    this.#logger.error(err);
                    this.#errorRenderer.render(this._catalogue.error);
                }
            );
    }

    /**
     * Returns the payload from the most recent successful fetch, or null if the
     * last fetch failed (or none has completed yet).
     *
     * @returns {Object|null}
     */
    getLastData() {
        return this.#lastData;
    }

    /**
     * Adds a row with temperatures formatted.
     *
     * @param {String}         name
     * @param {Number|String}  degreesC
     * @param {Number}         timestamp
     * @param {Boolean}        stale
     * @param {Boolean}        important
     */
    _addTempTableRow(name, degreesC, timestamp = null, stale = false, important = false) {
        const temperature = this.#formatter.temperature(degreesC);
        const timeDiff = timestamp ? this.#formatter.timeAgo(timestamp) : null;
        this._addTableRow(name, temperature.celsius, temperature.fahrenheit, timeDiff, stale, important, true);
    }

    /**
     * Renders the table's header row. The default is a no-op; subclasses
     * override it to add their title (and any column headings). It is called on
     * every render, success or failure, so the table's title stays visible
     * even when its API fails, telling the user which one is down.
     */
    _renderHeader() {

    }

    /**
     * Adds a header row.
     *
     * @param {Array<String|null>} labels
     * @param {Number}             titleColSpan
     */
    _addHeaderRow(labels, titleColSpan = 1) {
        this.#renderer.addHeaderRow(labels, titleColSpan);
    }

    /**
     * Adds a row showing temperature and humidity side by side.
     *
     * A single "time ago" is shown under the name, based on the oldest
     * (least recent) of the temperature and humidity readings. A device
     * that reports no humidity shows a muted dash in the humidity column;
     * one that does gets a muted "feel" description under the value.
     *
     * @param {String}         name
     * @param {Number|String}  degreesC
     * @param {Number}         tempTimestamp
     * @param {Boolean}        tempStale
     * @param {Number|null}    humidityPercent
     * @param {Number|null}    humidityTimestamp
     * @param {Boolean}        humidityStale
     * @param {Boolean}        important
     */
    _addClimateTableRow(name, degreesC, tempTimestamp = null, tempStale = false, humidityPercent = null, humidityTimestamp = null, humidityStale = false, important = false) {
        const temperature = this.#formatter.temperature(degreesC);

        const hasHumidity = (humidityPercent !== null && humidityPercent !== undefined);
        const humidity = hasHumidity ? this.#formatter.humidity(humidityPercent) : null;

        let oldestTimestamp = tempTimestamp;
        if (hasHumidity && humidityTimestamp && (!oldestTimestamp || humidityTimestamp < oldestTimestamp)) {
            oldestTimestamp = humidityTimestamp;
        }

        this.#renderer.addClimateRow({
            name,
            timeAgo: oldestTimestamp ? this.#formatter.timeAgo(oldestTimestamp) : null,
            celsius: temperature.celsius,
            fahrenheit: temperature.fahrenheit,
            temperatureStale: tempStale,
            humidityValue: hasHumidity ? humidity.value : '—',
            humidityDescription: hasHumidity ? humidity.description : null,
            humidityMuted: hasHumidity ? humidityStale : true,
            important,
        });
    }

    /**
     * Adds a generic row to the table (not temperature specific).
     *
     * @param {String}  primaryKey
     * @param {String}  primaryValue
     * @param {String}  secondaryValue
     * @param {String}  secondaryKey
     * @param {Boolean} muted
     * @param {Boolean} importantPrimary
     * @param {Boolean} secondaryMuted
     */
    _addTableRow(primaryKey, primaryValue, secondaryValue = null, secondaryKey = null, muted = false, importantPrimary = false, secondaryMuted = muted) {
        this.#renderer.addRow(primaryKey, primaryValue, secondaryValue, secondaryKey, muted, importantPrimary, secondaryMuted);
    }

    /**
     * Renders the update.
     *
     * @param {Object}      data
     * @param {Number|null} generatedAtUnix
     */
    _renderUpdate(data, generatedAtUnix = null) {

    }

    /**
     * The "Updated <time ago>" label wrapped in a small, muted `freshness`
     * span, or null when the time is unknown. Both tables render this so each
     * shows its own feed's freshness (they are fetched independently and can
     * differ): the climate table on its own line beneath the table, the weather
     * table on its own line beneath its source line.
     *
     * @param {Number|null} generatedAtUnix
     *
     * @returns {HTMLSpanElement|null}
     */
    _updatedElement(generatedAtUnix = null) {
        const label = this.#formatter.updatedLabel(generatedAtUnix);
        if (null === label) {
            return null;
        }

        return this.#renderer.createFreshnessElement(label);
    }

    /**
     * Replaces the update-time element's contents with the given nodes and
     * reveals it.
     *
     * @param {...(Node|String)} nodes
     */
    _updateDateSpan(...nodes) {
        this.#renderer.setUpdateContents(...nodes);
    }
}
