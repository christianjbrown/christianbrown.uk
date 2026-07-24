'use strict';

/**
 * Danish (da-DK) catalogue. Mirrors messages.en-GB.js — see that file for the
 * shape and intent. Draft translations, pending a native proofread.
 *
 * Danish conventions applied here: a (non-breaking) space before °C / % , 24-hour
 * time with no am/pm gloss, and Intl for the relative-time and date wording.
 */

const NBSP = String.fromCharCode(0xA0);

export default {
    locale: 'da-DK',

    units: {
        tempC: `${NBSP}°C`,
        tempF: `${NBSP}°F`,
        percent: `${NBSP}%`,
        kmh: 'km/t',
        mph: 'mph',
        degree: '°',
        km: 'km',
        metre: 'm',
        hpa: 'hPa',
    },

    humidityDescriptions: {
        DRY: 'Tør',
        PLEASANT: 'Behagelig',
        COMFORTABLE: 'Komfortabel',
        STICKY: 'Lummer',
        UNCOMFORTABLE: 'Ubehagelig',
        OPPRESSIVE: 'Trykkende',
        MISERABLE: 'Ulidelig',
    },

    uvDescriptions: {
        LOW: 'Lav',
        MODERATE: 'Moderat',
        HIGH: 'Høj',
        VERY_HIGH: 'Meget høj',
        EXTREME: 'Ekstrem',
    },

    weatherTypeNames: {
        CLEAR_NIGHT: 'Klar nat',
        CLOUDY: 'Skyet',
        DRIZZLE: 'Støvregn',
        FOG: 'Tåge',
        HAIL: 'Hagl',
        HAIL_SHOWER_DAY: 'Haglbyge (dag)',
        HAIL_SHOWER_NIGHT: 'Haglbyge (nat)',
        HEAVY_RAIN: 'Kraftig regn',
        HEAVY_RAIN_SHOWER_DAY: 'Kraftig regnbyge (dag)',
        HEAVY_RAIN_SHOWER_NIGHT: 'Kraftig regnbyge (nat)',
        HEAVY_SNOW: 'Kraftigt snefald',
        HEAVY_SNOW_SHOWER_DAY: 'Kraftig snebyge (dag)',
        HEAVY_SNOW_SHOWER_NIGHT: 'Kraftig snebyge (nat)',
        LIGHT_RAIN: 'Let regn',
        LIGHT_RAIN_SHOWER_DAY: 'Let regnbyge (dag)',
        LIGHT_RAIN_SHOWER_NIGHT: 'Let regnbyge (nat)',
        LIGHT_SNOW: 'Let snefald',
        LIGHT_SNOW_SHOWER_DAY: 'Let snebyge (dag)',
        LIGHT_SNOW_SHOWER_NIGHT: 'Let snebyge (nat)',
        MIST: 'Dis',
        OVERCAST: 'Overskyet',
        PARTLY_CLOUDY_DAY: 'Delvist skyet (dag)',
        PARTLY_CLOUDY_NIGHT: 'Delvist skyet (nat)',
        SLEET: 'Slud',
        SLEET_SHOWER_DAY: 'Sludbyge (dag)',
        SLEET_SHOWER_NIGHT: 'Sludbyge (nat)',
        SUNNY_DAY: 'Solrig dag',
        THUNDER: 'Torden',
        THUNDER_SHOWER_DAY: 'Tordenbyge (dag)',
        THUNDER_SHOWER_NIGHT: 'Tordenbyge (nat)',
        TRACE_RAIN: 'Svag regn',
    },

    compassNames: {
        E: 'Østlig',
        ENE: 'Øst-nordøstlig',
        ESE: 'Øst-sydøstlig',
        N: 'Nordlig',
        NE: 'Nordøstlig',
        NNE: 'Nord-nordøstlig',
        NNW: 'Nord-nordvestlig',
        NW: 'Nordvestlig',
        S: 'Sydlig',
        SE: 'Sydøstlig',
        SSE: 'Syd-sydøstlig',
        SSW: 'Syd-sydvestlig',
        SW: 'Sydvestlig',
        W: 'Vestlig',
        WNW: 'Vest-nordvestlig',
        WSW: 'Vest-sydvestlig',
    },

    // Display-name maps for SmartThings room/device names, keyed by the raw API
    // value; anything unmapped falls back to the API value.
    roomNames: {
        'Living room': 'Stue',
        'Hallway': 'Entré',
        'Kitchen': 'Køkken',
        'Bathroom': 'Badeværelse',
        'Study': 'Kontor',
        'Bedroom': 'Soveværelse',
    },
    deviceNames: {
        'Button': 'Knap',
        'Door sensor': 'Dørsensor',
        'Motion sensor': 'Bevægelsessensor',
        'Hygrometer': 'Hygrometer',
    },
    locationNames: {
        'London, UK': 'London, Storbritannien',
        'Perth, Australia': 'Perth, Australien',
        'Singapore': 'Singapore',
    },

    table: {
        insideTitle: '🏠 Indeklima',
        average: 'Gennemsnit',
        updatedPrefix: 'Opdateret ',
    },

    weather: {
        title: '🌤️ Vejrudsigt udenfor',
        weatherTypeLabel: 'Vejrtype',
        temperatureLabel: 'Temperatur',
        feelsLikeLabel: 'Føles som',
        humidityLabel: 'Luftfugtighed',
        precipitationLabel: 'Nedbørssandsynlighed',
        uvIndexLabel: 'UV-indeks',
        visibilityLabel: 'Sigtbarhed',
        pressureLabel: 'Lufttryk',
        dewPointLabel: 'Dugpunkt',
        windLabel: 'Vind',
        unknown: 'Ukendt',
        gusts: 'vindstød',
        sourcePrefix: 'Kilde: ',
        forecastBetween: ' vejrudsigt for ',
        and: ' og ',
    },

    error: {
        line1: '⚠️ Disse data kan ikke indlæses lige nu.',
        awarePrefix: 'Jeg er klar over det – ',
        linkText: 'de kloge hoveder',
        awareSuffix: ' arbejder på sagen.',
        line3: 'Prøv venligst igen senere.',
    },

    floor: {
        'Third floor': 'Tredje sal',
        'Fourth floor': 'Fjerde sal',
        outside: 'Udenfor',
    },

    time: {
        midnight: 'midnat',
        noon: 'middag',
        justNow: 'lige nu',
        twelveHourGloss: false,
        onWord: ' den ',

        relativeTime(value, unit) {
            return new Intl.RelativeTimeFormat('da-DK', { numeric: 'always', style: 'short' }).format(-value, unit);
        },

        formatDate(date, timeZone, long = false) {
            return new Intl.DateTimeFormat('da-DK', {
                timeZone,
                weekday: long ? 'long' : 'short',
                day: 'numeric',
                month: long ? 'long' : 'short',
            }).format(date);
        },
    },

    climateSummary(f) {
        let s = f.temperaturesMatch
            ? `Der er ${f.insideTemp} både inde og ude`
            : `Der er ${f.diffTemp} ${f.warmer ? 'varmere' : 'koldere'} indenfor (${f.insideTemp} inde, ${f.outsideTemp} ude)`;

        if (f.humidity) {
            const h = f.humidity;
            const conjunction = h.contrast ? 'men' : 'og';
            const clause = h.match
                ? `luftfugtigheden er ${h.inside} både inde og ude`
                : `der er ${h.diff} ${h.moreInside ? 'mere' : 'mindre'} fugtigt${f.temperaturesMatch ? ' indenfor' : ''} (${h.inside} inde, ${h.outside} ude)`;
            s += `, ${conjunction} ${clause}`;
        }

        return s + '.';
    },

    // Danish reads more naturally as a second, standalone sentence. Its long date
    // already carries "den" (e.g. "mandag den 20. juli"), so the wrapper doesn't
    // add one.
    statusLine(time, date, climate) {
        const when = `Klokken er ${time} ${date} i mit hjem i London`;
        return climate ? `${when}. ${climate}` : `${when}.`;
    },

    // Appended to the status line when the climate favours opening a window.
    windowAdvice: 'Nok bedst at åbne et vindue.',

    theme: {
        auto: 'Auto',
        light: 'Lys',
        dark: 'Mørk',
        switchTitle: 'Skift farvetema',
        ariaLabelTemplate: 'Farvetema: {label}. Aktivér for at ændre.',
    },

    header: {
        jobTitle: 'Udviklingschef',
        homeLinkTitle: 'Christian Browns hjemmeside',
        avatarAlt: 'Christian Browns avatar',
        locationIconAlt: 'Placeringsikon',
        smartHomeLinkTitle: 'Christian Browns smart home',
    },

    page: {
        smartHomeTitle: 'Smart home',
        roomsHeading: '📐 Rum',
        howItWorksHeading: '🏗️ Sådan virker det',
        floorPlanAlt: 'Plantegning af huset med temperatur og luftfugtighed i hvert rum',
        howItWorksAlt: 'Diagram, der viser, hvordan denne side fungerer',
    },

    cv: {
        experienceHeading: 'Erhvervserfaring',
        educationHeading: 'Uddannelse',
        downloadCv: 'Hent CV',
        downloadIconAlt: 'Downloadikon',
        now: 'nu',

        homeTempLink(temperature) {
            return `🏠 ${temperature} hjemme`;
        },
    },

    climateHistory: {
        title: 'Klimahistorik',
        loading: 'Indlæser klimahistorik…',
        error: 'Kunne ikke indlæse klimahistorikken lige nu.',
        zoomInLabel: 'Zoom ind – finere opløsning, kortere periode',
        zoomOutLabel: 'Zoom ud – grovere opløsning, længere periode',
        series: {
            outside: 'Udetemperatur',
            insideMin: 'Indetemperatur (min.)',
            insideMax: 'Indetemperatur (maks.)',
        },
        resolutions: {
            'hourly-day': 'Sidste dag · pr. time',
            'hourly-1-month': 'Sidste måned · pr. time',
            'daily-1-month': 'Sidste måned · dagligt',
            'daily-3-month': 'Sidste 3 måneder · dagligt',
            'daily-6-month': 'Sidste 6 måneder · dagligt',
            'daily-12-month': 'Sidste 12 måneder · dagligt',
        },
    },
};
