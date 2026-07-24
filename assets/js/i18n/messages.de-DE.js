'use strict';

/**
 * German (de-DE) catalogue. Mirrors messages.en-GB.js — see that file for the
 * shape and intent. Draft translations, pending a native proofread.
 *
 * German conventions applied here: a (non-breaking) space before °C / % , 24-hour
 * time with no am/pm gloss, and Intl for the relative-time and date wording.
 */

const NBSP = String.fromCharCode(0xA0);

export default {
    locale: 'de-DE',

    units: {
        tempC: `${NBSP}°C`,
        tempF: `${NBSP}°F`,
        percent: `${NBSP}%`,
        kmh: 'km/h',
        mph: 'mph',
        degree: '°',
        km: 'km',
        metre: 'm',
        hpa: 'hPa',
    },

    humidityDescriptions: {
        DRY: 'Trocken',
        PLEASANT: 'Angenehm',
        COMFORTABLE: 'Behaglich',
        STICKY: 'Schwül',
        UNCOMFORTABLE: 'Unangenehm',
        OPPRESSIVE: 'Drückend',
        MISERABLE: 'Unerträglich',
    },

    uvDescriptions: {
        LOW: 'Niedrig',
        MODERATE: 'Mäßig',
        HIGH: 'Hoch',
        VERY_HIGH: 'Sehr hoch',
        EXTREME: 'Extrem',
    },

    weatherTypeNames: {
        CLEAR_NIGHT: 'Klare Nacht',
        CLOUDY: 'Bewölkt',
        DRIZZLE: 'Nieselregen',
        FOG: 'Nebel',
        HAIL: 'Hagel',
        HAIL_SHOWER_DAY: 'Hagelschauer (Tag)',
        HAIL_SHOWER_NIGHT: 'Hagelschauer (Nacht)',
        HEAVY_RAIN: 'Starkregen',
        HEAVY_RAIN_SHOWER_DAY: 'Starker Regenschauer (Tag)',
        HEAVY_RAIN_SHOWER_NIGHT: 'Starker Regenschauer (Nacht)',
        HEAVY_SNOW: 'Starker Schneefall',
        HEAVY_SNOW_SHOWER_DAY: 'Starker Schneeschauer (Tag)',
        HEAVY_SNOW_SHOWER_NIGHT: 'Starker Schneeschauer (Nacht)',
        LIGHT_RAIN: 'Leichter Regen',
        LIGHT_RAIN_SHOWER_DAY: 'Leichter Regenschauer (Tag)',
        LIGHT_RAIN_SHOWER_NIGHT: 'Leichter Regenschauer (Nacht)',
        LIGHT_SNOW: 'Leichter Schneefall',
        LIGHT_SNOW_SHOWER_DAY: 'Leichter Schneeschauer (Tag)',
        LIGHT_SNOW_SHOWER_NIGHT: 'Leichter Schneeschauer (Nacht)',
        MIST: 'Dunst',
        OVERCAST: 'Bedeckt',
        PARTLY_CLOUDY_DAY: 'Teils bewölkt (Tag)',
        PARTLY_CLOUDY_NIGHT: 'Teils bewölkt (Nacht)',
        SLEET: 'Schneeregen',
        SLEET_SHOWER_DAY: 'Schneeregenschauer (Tag)',
        SLEET_SHOWER_NIGHT: 'Schneeregenschauer (Nacht)',
        SUNNY_DAY: 'Sonniger Tag',
        THUNDER: 'Gewitter',
        THUNDER_SHOWER_DAY: 'Gewitterschauer (Tag)',
        THUNDER_SHOWER_NIGHT: 'Gewitterschauer (Nacht)',
        TRACE_RAIN: 'Geringer Regen',
    },

    compassNames: {
        E: 'Östlich',
        ENE: 'Ost-nordöstlich',
        ESE: 'Ost-südöstlich',
        N: 'Nördlich',
        NE: 'Nordöstlich',
        NNE: 'Nord-nordöstlich',
        NNW: 'Nord-nordwestlich',
        NW: 'Nordwestlich',
        S: 'Südlich',
        SE: 'Südöstlich',
        SSE: 'Süd-südöstlich',
        SSW: 'Süd-südwestlich',
        SW: 'Südwestlich',
        W: 'Westlich',
        WNW: 'West-nordwestlich',
        WSW: 'West-südwestlich',
    },

    // Display-name maps for SmartThings room/device names, keyed by the raw API
    // value; anything unmapped falls back to the API value.
    roomNames: {
        'Living room': 'Wohnzimmer',
        'Hallway': 'Flur',
        'Kitchen': 'Küche',
        'Bathroom': 'Badezimmer',
        'Study': 'Arbeitszimmer',
        'Bedroom': 'Schlafzimmer',
    },
    deviceNames: {
        'Button': 'Taster',
        'Door sensor': 'Türsensor',
        'Motion sensor': 'Bewegungsmelder',
        'Hygrometer': 'Hygrometer',
    },
    locationNames: {
        'London, UK': 'London, Vereinigtes Königreich',
        'Perth, Australia': 'Perth, Australien',
        'Singapore': 'Singapur',
    },

    table: {
        insideTitle: '🏠 Innenklima',
        average: 'Durchschnitt',
        updatedPrefix: 'Aktualisiert ',
    },

    weather: {
        title: '🌤️ Wettervorhersage draußen',
        weatherTypeLabel: 'Wetterlage',
        temperatureLabel: 'Temperatur',
        feelsLikeLabel: 'Gefühlte Temperatur',
        humidityLabel: 'Luftfeuchtigkeit',
        precipitationLabel: 'Niederschlagswahrscheinlichkeit',
        uvIndexLabel: 'UV-Index',
        visibilityLabel: 'Sichtweite',
        pressureLabel: 'Luftdruck',
        dewPointLabel: 'Taupunkt',
        windLabel: 'Wind',
        unknown: 'Unbekannt',
        gusts: 'Böen',
        sourcePrefix: 'Quelle: ',
        forecastBetween: ' Vorhersage für ',
        and: ' und ',
    },

    error: {
        line1: '⚠️ Diese Daten lassen sich gerade nicht laden.',
        awarePrefix: 'Ich weiß Bescheid – ',
        linkText: 'die Fachleute',
        awareSuffix: ' kümmern sich darum.',
        line3: 'Bitte später erneut versuchen.',
    },

    floor: {
        'Third floor': 'Dritter Stock',
        'Fourth floor': 'Vierter Stock',
        outside: 'Draußen',
    },

    time: {
        midnight: 'Mitternacht',
        noon: 'Mittag',
        justNow: 'gerade eben',
        twelveHourGloss: false,
        onWord: ' am ',

        relativeTime(value, unit) {
            return new Intl.RelativeTimeFormat('de-DE', { numeric: 'always', style: 'short' }).format(-value, unit);
        },

        formatDate(date, timeZone, long = false) {
            return new Intl.DateTimeFormat('de-DE', {
                timeZone,
                weekday: long ? 'long' : 'short',
                day: 'numeric',
                month: long ? 'long' : 'short',
            }).format(date);
        },
    },

    climateSummary(f) {
        let s = f.temperaturesMatch
            ? `Drinnen und draußen sind es ${f.insideTemp}`
            : `Drinnen ist es ${f.diffTemp} ${f.warmer ? 'wärmer' : 'kälter'} (${f.insideTemp} drinnen, ${f.outsideTemp} draußen)`;

        if (f.humidity) {
            const h = f.humidity;
            const conjunction = h.contrast ? 'aber' : 'und';
            const clause = h.match
                ? `die Luftfeuchtigkeit beträgt drinnen und draußen ${h.inside}`
                : `es ist ${h.diff} ${h.moreInside ? 'feuchter' : 'trockener'}${f.temperaturesMatch ? ' drinnen' : ''} (${h.inside} drinnen, ${h.outside} draußen)`;
            s += `, ${conjunction} ${clause}`;
        }

        return s + '.';
    },

    // German does not splice the climate clause mid-sentence (its subordinate
    // word order would force the verb to the end); it reads more naturally as a
    // second, standalone sentence.
    statusLine(time, date, climate) {
        const when = `Es ist gerade ${time} am ${date} in meinem Londoner Zuhause`;
        return climate ? `${when}. ${climate}` : `${when}.`;
    },

    // Appended to the status line when the climate favours opening a window.
    windowAdvice: 'Am besten ein Fenster öffnen.',

    theme: {
        auto: 'Auto',
        light: 'Hell',
        dark: 'Dunkel',
        switchTitle: 'Farbschema wechseln',
        ariaLabelTemplate: 'Farbschema: {label}. Zum Ändern aktivieren.',
    },

    header: {
        jobTitle: 'Entwicklungsleiter',
        homeLinkTitle: 'Startseite von Christian Brown',
        avatarAlt: 'Avatar von Christian Brown',
        locationIconAlt: 'Standort-Symbol',
        smartHomeLinkTitle: 'Christian Browns Smart Home',
    },

    page: {
        smartHomeTitle: 'Smart Home',
        roomsHeading: '📐 Grundriss',
        historicalHeading: '📜 Verlauf',
        howItWorksHeading: '🏗️ Wie es funktioniert',
        floorPlanAlt: 'Grundriss des Hauses mit Temperatur und Luftfeuchtigkeit jedes Raums',
        howItWorksAlt: 'Diagramm, das zeigt, wie diese Seite funktioniert',
    },

    cv: {
        experienceHeading: 'Berufserfahrung',
        educationHeading: 'Ausbildung',
        downloadCv: 'Lebenslauf herunterladen',
        downloadIconAlt: 'Download-Symbol',
        now: 'heute',

        homeTempLink(temperature) {
            return `🏠 ${temperature} zu Hause`;
        },
    },

    climateHistory: {
        title: 'Klimaverlauf',
        loading: 'Klimaverlauf wird geladen …',
        error: 'Der Klimaverlauf konnte gerade nicht geladen werden.',
        zoomInLabel: 'Vergrößern – feinere Auflösung, kürzerer Zeitraum',
        zoomOutLabel: 'Verkleinern – gröbere Auflösung, längerer Zeitraum',
        series: {
            outside: 'Außentemperatur',
            insideMin: 'Innentemperatur (Min.)',
            insideMax: 'Innentemperatur (Max.)',
        },
        humiditySeries: {
            outside: 'Außenluftfeuchte',
            insideMin: 'Innenluftfeuchte (Min.)',
            insideMax: 'Innenluftfeuchte (Max.)',
        },
        metricToggle: {
            temperature: 'Temperatur anzeigen',
            humidity: 'Luftfeuchte anzeigen',
        },
        resolutions: {
            'hourly-day': 'Letzter Tag · stündlich',
            'hourly-1-month': 'Letzter Monat · stündlich',
            'daily-1-month': 'Letzter Monat · täglich',
            'daily-3-month': 'Letzte 3 Monate · täglich',
            'daily-6-month': 'Letzte 6 Monate · täglich',
            'daily-12-month': 'Letzte 12 Monate · täglich',
        },
    },
};
