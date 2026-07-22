'use strict';

/**
 * The en-GB message catalogue — the site's default locale and the reference the
 * de-DE and fr-FR catalogues mirror. Every user-facing string on the smart-home
 * page (and the homepage's localised bits) is resolved through a catalogue like
 * this, so switching locale is a matter of swapping the object rather than
 * touching the rendering code.
 *
 * A catalogue is three kinds of entry:
 *   - plain label strings (table titles, row labels, units, error text, …);
 *   - keyed enum maps (weather-type names, compass names, humidity descriptors),
 *     keyed by the same stable tokens the data/logic layer uses;
 *   - builder functions for the grammar-sensitive prose (the status line, the
 *     climate summary, relative time and dates), where word order and morphology
 *     differ enough between languages that a template with holes will not do.
 *
 * This catalogue is deliberately the one value classes fall back to by default,
 * so `new Temperature(21)` (no catalogue) still renders exactly as it always has.
 */


export default {
    locale: 'en-GB',

    // Unit strings, incl. the (non-)spacing between a number and its unit. en-GB
    // sets its degree/percent tight against the number and lower-cases the
    // degree unit, matching the site's long-standing look.
    units: {
        tempC: '°c',
        tempF: '°f',
        percent: '%',
        kmh: 'km/h',
        mph: 'mph',
        degree: '°',
        km: 'km',
        metre: 'm',
    },

    // Subjective one-word humidity descriptors, keyed by the stable token
    // Humidity.describe() derives from the percentage.
    humidityDescriptions: {
        DRY: 'Dry',
        PLEASANT: 'Pleasant',
        COMFORTABLE: 'Comfortable',
        STICKY: 'Sticky',
        UNCOMFORTABLE: 'Uncomfortable',
        OPPRESSIVE: 'Oppressive',
        MISERABLE: 'Miserable',
    },

    // UV-index exposure-risk bands, keyed by the stable token UvIndex.describe()
    // derives from the index (WHO / Met Office scale).
    uvDescriptions: {
        LOW: 'Low',
        MODERATE: 'Moderate',
        HIGH: 'High',
        VERY_HIGH: 'Very high',
        EXTREME: 'Extreme',
    },

    // Met Office weather-type display names, keyed by the stable enum-name token
    // the feed sends (see weatherTypes.js — the emoji lives there, the name here).
    weatherTypeNames: {
        CLEAR_NIGHT: 'Clear night',
        CLOUDY: 'Cloudy',
        DRIZZLE: 'Drizzle',
        FOG: 'Fog',
        HAIL: 'Hail',
        HAIL_SHOWER_DAY: 'Hail shower (day)',
        HAIL_SHOWER_NIGHT: 'Hail shower (night)',
        HEAVY_RAIN: 'Heavy rain',
        HEAVY_RAIN_SHOWER_DAY: 'Heavy rain shower (day)',
        HEAVY_RAIN_SHOWER_NIGHT: 'Heavy rain shower (night)',
        HEAVY_SNOW: 'Heavy snow',
        HEAVY_SNOW_SHOWER_DAY: 'Heavy snow shower (day)',
        HEAVY_SNOW_SHOWER_NIGHT: 'Heavy snow shower (night)',
        LIGHT_RAIN: 'Light rain',
        LIGHT_RAIN_SHOWER_DAY: 'Light rain shower (day)',
        LIGHT_RAIN_SHOWER_NIGHT: 'Light rain shower (night)',
        LIGHT_SNOW: 'Light snow',
        LIGHT_SNOW_SHOWER_DAY: 'Light snow shower (day)',
        LIGHT_SNOW_SHOWER_NIGHT: 'Light snow shower (night)',
        MIST: 'Mist',
        OVERCAST: 'Overcast',
        PARTLY_CLOUDY_DAY: 'Partly cloudy (day)',
        PARTLY_CLOUDY_NIGHT: 'Partly cloudy (night)',
        SLEET: 'Sleet',
        SLEET_SHOWER_DAY: 'Sleet shower (day)',
        SLEET_SHOWER_NIGHT: 'Sleet shower (night)',
        SUNNY_DAY: 'Sunny day',
        THUNDER: 'Thunder',
        THUNDER_SHOWER_DAY: 'Thunder shower (day)',
        THUNDER_SHOWER_NIGHT: 'Thunder shower (night)',
        TRACE_RAIN: 'Trace rain',
    },

    // Friendly wind-direction names, keyed by the compass token the feed sends.
    compassNames: {
        E: 'Easterly',
        ENE: 'East north easterly',
        ESE: 'East south easterly',
        N: 'Northerly',
        NE: 'North easterly',
        NNE: 'North north easterly',
        NNW: 'North north westerly',
        NW: 'North westerly',
        S: 'Southerly',
        SE: 'South easterly',
        SSE: 'South south easterly',
        SSW: 'South south westerly',
        SW: 'South westerly',
        W: 'Westerly',
        WNW: 'West north westerly',
        WSW: 'West south westerly',
    },

    // Display-name maps for the room and device names SmartThings sends, keyed
    // by the raw API value. A name with no entry falls back to the API value, so
    // en-GB (which reads the English API names as-is) needs none.
    roomNames: {},
    deviceNames: {},
    // Location display names (experience/education entries and the header),
    // keyed by the raw value; unmapped falls back to the raw value.
    locationNames: {},

    // Inside-climate table + shared table chrome.
    table: {
        insideTitle: '🏠 Inside climate',
        average: 'Average',
        updatedPrefix: 'Updated ',
    },

    // Outside-weather table.
    weather: {
        title: '🌤️ Outside weather forecast',
        weatherTypeLabel: 'Weather type',
        temperatureLabel: '🌡️ Temperature',
        feelsLikeLabel: 'Temperature feels like',
        humidityLabel: '💧 Humidity',
        precipitationLabel: 'Chance of precipitation',
        uvIndexLabel: '☀️ UV index',
        visibilityLabel: '👁️ Visibility',
        windLabel: 'Wind',
        unknown: 'Unknown',
        gusts: 'gusts',
        sourcePrefix: 'Source: ',
        forecastBetween: ' forecast for between ',
        and: ' and ',
    },

    // Shown in place of the table when its feed fails to load. Split around the
    // "top men" link so no markup is ever built from a string.
    error: {
        line1: "⚠️ I'm having trouble loading this data right now.",
        awarePrefix: "I'm aware - ",
        linkText: 'top men',
        awareSuffix: ' are working on it.',
        line3: 'Please try again later.',
    },

    // Floor-plan overlay labels. The room-name labels are NOT here — they come
    // from SmartThings and double as data-join keys — but the floor headings and
    // the outside marker are ours to translate.
    floor: {
        'Third floor': 'Third floor',
        'Fourth floor': 'Fourth floor',
        outside: 'Outside',
    },

    // Localisable date/time bits. The rest (weekday/month names) comes straight
    // from Intl once the locale is threaded through.
    time: {
        midnight: 'midnight',
        noon: 'noon',
        // en-GB shows a friendly 12-hour gloss after the 24-hour time, e.g.
        // "14:30 (2:30pm)". de-DE and fr-FR are 24-hour only and switch this off.
        twelveHourGloss: true,
        onWord: ' on ',

        /**
         * "3 mins ago" / "1 sec ago" — the site's own terse abbreviations, kept
         * verbatim for en-GB (Intl.RelativeTimeFormat cannot reproduce "hrs").
         *
         * @param {Number} value
         * @param {String} unit  'second' | 'minute' | 'hour' | 'day'
         * @returns {String}
         */
        relativeTime(value, unit) {
            const word = { second: 'sec', minute: 'min', hour: 'hr', day: 'day' }[unit];
            return `${value} ${word}${value === 1 ? '' : 's'} ago`;
        },

        /**
         * "Mon 20th Nov" or, when long, "Monday, 20th of November". Intl handles
         * the weekday/month names; the English ordinal suffix and joining words
         * are added here.
         *
         * @param {Date}    date
         * @param {String}  timeZone
         * @param {Boolean} long
         * @returns {String}
         */
        formatDate(date, timeZone, long = false) {
            const locale = 'en-GB';
            const dayOfMonth = parseInt(new Intl.DateTimeFormat(locale, { timeZone, day: 'numeric' }).format(date), 10);
            const suffix = dayOfMonth % 10 === 1 && dayOfMonth !== 11 ? 'st'
                : dayOfMonth % 10 === 2 && dayOfMonth !== 12 ? 'nd'
                    : dayOfMonth % 10 === 3 && dayOfMonth !== 13 ? 'rd' : 'th';
            const dayOfWeek = new Intl.DateTimeFormat(locale, { timeZone, weekday: long ? 'long' : 'short' }).format(date);
            const month = new Intl.DateTimeFormat(locale, { timeZone, month: long ? 'long' : 'short' }).format(date);

            return long
                ? `${dayOfWeek}, ${dayOfMonth}${suffix} of ${month}`
                : `${dayOfWeek} ${dayOfMonth}${suffix} ${month}`;
        },
    },

    /**
     * The inside-vs-outside climate sentence. Receives already-localised number
     * strings and the semantic facts (which side is warmer, whether to contrast,
     * …) and owns only the wording and word order.
     *
     * @param {Object} f
     * @returns {String}
     */
    climateSummary(f) {
        let s = f.temperaturesMatch
            ? `It's ${f.insideTemp} inside and outside`
            : `It's ${f.diffTemp} ${f.warmer ? 'warmer' : 'cooler'} inside (${f.insideTemp} inside, ${f.outsideTemp} outside)`;

        if (f.humidity) {
            const h = f.humidity;
            const conjunction = h.contrast ? 'but' : 'and';
            const clause = h.match
                ? `it's ${h.inside} humidity inside and outside`
                : `${h.diff} ${h.moreInside ? 'more' : 'less'} humid${f.temperaturesMatch ? ' inside' : ''} (${h.inside} inside, ${h.outside} outside)`;
            s += `, ${conjunction} ${clause}`;
        }

        return s + '.';
    },

    /**
     * The status line: the London time and date, and — when the climate summary
     * is available — that summary woven in. en-GB splices it mid-sentence after
     * ", where " and lower-cases its first letter.
     *
     * @param {String}      time
     * @param {String}      date
     * @param {String|null} climate  the full climate sentence, or null
     * @returns {String}
     */
    statusLine(time, date, climate) {
        const when = `It's currently ${time} on ${date} in my London home`;
        if (!climate) {
            return `${when}.`;
        }

        return `${when}, where ${climate.charAt(0).toLowerCase() + climate.slice(1)}`;
    },

    // Colour-theme toggle. `ariaLabelTemplate`'s {label} hole is filled with the
    // active theme label (see Theme.bindToggle).
    theme: {
        auto: 'Auto',
        light: 'Light',
        dark: 'Dark',
        switchTitle: 'Switch colour theme',
        ariaLabelTemplate: 'Colour theme: {label}. Activate to change it.',
    },

    // Shared site header (every page). Includes the hover/accessibility text
    // (title/alt) the build renders in English.
    header: {
        jobTitle: 'Engineering Manager',
        homeLinkTitle: 'Christian Brown homepage',
        avatarAlt: "Christian Brown's avatar",
        locationIconAlt: 'Location icon',
        smartHomeLinkTitle: "Christian Brown's smart home",
    },

    // Page-level section headings and the smart-home page's image alt text.
    page: {
        smartHomeTitle: 'Smart home',
        roomsHeading: '📐 Rooms',
        howItWorksHeading: '🏗️ How it works',
        floorPlanAlt: 'Floor plan of the house, with the temperature and humidity of each room',
        howItWorksAlt: 'Diagram showing how this page works',
    },

    // Homepage (CV) strings.
    cv: {
        // Sentence case, to match the site's other headings (and how French/
        // Danish/German render theirs).
        experienceHeading: 'Professional experience',
        educationHeading: 'Education',
        downloadCv: 'Download CV',
        downloadIconAlt: 'Download icon',
        now: 'now',

        /**
         * The header's live indoor-temperature link, e.g. "🏠 21°c at home".
         *
         * @param {String} temperature  already-localised, e.g. "21°c"
         * @returns {String}
         */
        homeTempLink(temperature) {
            return `🏠 ${temperature} at home`;
        },
    },
};
