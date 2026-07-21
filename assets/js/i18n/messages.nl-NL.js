'use strict';

/**
 * Dutch (nl-NL) catalogue. Mirrors messages.en-GB.js — see that file for the
 * shape and intent. Draft translations, pending a native proofread.
 *
 * Dutch conventions applied here: a (non-breaking) space before °C / % , 24-hour
 * time with no am/pm gloss, and Intl for the relative-time and date wording.
 */

const NBSP = String.fromCharCode(0xA0);

export default {
    locale: 'nl-NL',

    units: {
        tempC: `${NBSP}°C`,
        tempF: `${NBSP}°F`,
        percent: `${NBSP}%`,
        kmh: 'km/h',
        mph: 'mph',
        degree: '°',
    },

    humidityDescriptions: {
        DRY: 'Droog',
        PLEASANT: 'Aangenaam',
        COMFORTABLE: 'Comfortabel',
        STICKY: 'Klam',
        UNCOMFORTABLE: 'Oncomfortabel',
        OPPRESSIVE: 'Drukkend',
        MISERABLE: 'Ondraaglijk',
    },

    weatherTypeNames: {
        CLEAR_NIGHT: 'Heldere nacht',
        CLOUDY: 'Bewolkt',
        DRIZZLE: 'Motregen',
        FOG: 'Mist',
        HAIL: 'Hagel',
        HAIL_SHOWER_DAY: 'Hagelbui (dag)',
        HAIL_SHOWER_NIGHT: 'Hagelbui (nacht)',
        HEAVY_RAIN: 'Zware regen',
        HEAVY_RAIN_SHOWER_DAY: 'Zware regenbui (dag)',
        HEAVY_RAIN_SHOWER_NIGHT: 'Zware regenbui (nacht)',
        HEAVY_SNOW: 'Zware sneeuwval',
        HEAVY_SNOW_SHOWER_DAY: 'Zware sneeuwbui (dag)',
        HEAVY_SNOW_SHOWER_NIGHT: 'Zware sneeuwbui (nacht)',
        LIGHT_RAIN: 'Lichte regen',
        LIGHT_RAIN_SHOWER_DAY: 'Lichte regenbui (dag)',
        LIGHT_RAIN_SHOWER_NIGHT: 'Lichte regenbui (nacht)',
        LIGHT_SNOW: 'Lichte sneeuwval',
        LIGHT_SNOW_SHOWER_DAY: 'Lichte sneeuwbui (dag)',
        LIGHT_SNOW_SHOWER_NIGHT: 'Lichte sneeuwbui (nacht)',
        MIST: 'Nevel',
        OVERCAST: 'Zwaarbewolkt',
        PARTLY_CLOUDY_DAY: 'Half bewolkt (dag)',
        PARTLY_CLOUDY_NIGHT: 'Half bewolkt (nacht)',
        SLEET: 'Natte sneeuw',
        SLEET_SHOWER_DAY: 'Natte-sneeuwbui (dag)',
        SLEET_SHOWER_NIGHT: 'Natte-sneeuwbui (nacht)',
        SUNNY_DAY: 'Zonnige dag',
        THUNDER: 'Onweer',
        THUNDER_SHOWER_DAY: 'Onweersbui (dag)',
        THUNDER_SHOWER_NIGHT: 'Onweersbui (nacht)',
        TRACE_RAIN: 'Lichte neerslag',
    },

    compassNames: {
        E: 'Oostelijk',
        ENE: 'Oost-noordoostelijk',
        ESE: 'Oost-zuidoostelijk',
        N: 'Noordelijk',
        NE: 'Noordoostelijk',
        NNE: 'Noord-noordoostelijk',
        NNW: 'Noord-noordwestelijk',
        NW: 'Noordwestelijk',
        S: 'Zuidelijk',
        SE: 'Zuidoostelijk',
        SSE: 'Zuid-zuidoostelijk',
        SSW: 'Zuid-zuidwestelijk',
        SW: 'Zuidwestelijk',
        W: 'Westelijk',
        WNW: 'West-noordwestelijk',
        WSW: 'West-zuidwestelijk',
    },

    // Display-name maps for SmartThings room/device names, keyed by the raw API
    // value; anything unmapped falls back to the API value.
    roomNames: {
        'Living room': 'Woonkamer',
        'Hallway': 'Gang',
        'Kitchen': 'Keuken',
        'Bathroom': 'Badkamer',
        'Study': 'Studeerkamer',
        'Bedroom': 'Slaapkamer',
    },
    deviceNames: {
        'Button': 'Knop',
        'Door sensor': 'Deursensor',
        'Motion sensor': 'Bewegingssensor',
        'Hygrometer': 'Hygrometer',
    },
    locationNames: {
        'London, UK': 'Londen, VK',
        'Perth, Australia': 'Perth, Australië',
        'Singapore': 'Singapore',
    },

    table: {
        insideTitle: '🏠 Binnenklimaat',
        average: 'Gemiddelde',
        updatedPrefix: 'Bijgewerkt ',
    },

    weather: {
        title: '🌤️ Weersverwachting buiten',
        weatherTypeLabel: 'Weertype',
        temperatureLabel: '🌡️ Temperatuur',
        feelsLikeLabel: 'Gevoelstemperatuur',
        humidityLabel: '💧 Luchtvochtigheid',
        precipitationLabel: 'Kans op neerslag',
        windLabel: 'Wind',
        unknown: 'Onbekend',
        gusts: 'windstoten',
        sourcePrefix: 'Bron: ',
        forecastBetween: ' verwachting tussen ',
        and: ' en ',
    },

    error: {
        line1: '⚠️ Ik kan deze gegevens op dit moment niet laden.',
        awarePrefix: 'Ik ben op de hoogte – ',
        linkText: 'de specialisten',
        awareSuffix: ' zijn ermee bezig.',
        line3: 'Probeer het later opnieuw.',
    },

    floor: {
        'Third floor': 'Derde verdieping',
        'Fourth floor': 'Vierde verdieping',
        outside: 'Buiten',
    },

    time: {
        midnight: 'middernacht',
        noon: "twaalf uur 's middags",
        twelveHourGloss: false,
        onWord: ' op ',

        relativeTime(value, unit) {
            return new Intl.RelativeTimeFormat('nl-NL', { numeric: 'always', style: 'short' }).format(-value, unit);
        },

        formatDate(date, timeZone, long = false) {
            return new Intl.DateTimeFormat('nl-NL', {
                timeZone,
                weekday: long ? 'long' : 'short',
                day: 'numeric',
                month: long ? 'long' : 'short',
            }).format(date);
        },
    },

    climateSummary(f) {
        let s = f.temperaturesMatch
            ? `Binnen en buiten is het ${f.insideTemp}`
            : `Binnen is het ${f.diffTemp} ${f.warmer ? 'warmer' : 'kouder'} (${f.insideTemp} binnen, ${f.outsideTemp} buiten)`;

        if (f.humidity) {
            const h = f.humidity;
            const conjunction = h.contrast ? 'maar' : 'en';
            const clause = h.match
                ? `de luchtvochtigheid is binnen en buiten ${h.inside}`
                : `het is ${h.diff} ${h.moreInside ? 'vochtiger' : 'droger'}${f.temperaturesMatch ? ' binnen' : ''} (${h.inside} binnen, ${h.outside} buiten)`;
            s += `, ${conjunction} ${clause}`;
        }

        return s + '.';
    },

    // Dutch reads more naturally with the climate as a second, standalone
    // sentence than spliced mid-sentence (a subordinate clause would push the
    // verb to the end), matching the German approach.
    statusLine(time, date, climate) {
        const when = `Het is nu ${time} op ${date} in mijn huis in Londen`;
        return climate ? `${when}. ${climate}` : `${when}.`;
    },

    theme: {
        auto: 'Auto',
        light: 'Licht',
        dark: 'Donker',
        switchTitle: 'Kleurenschema wisselen',
        ariaLabelTemplate: 'Kleurenschema: {label}. Activeer om het te wijzigen.',
    },

    header: {
        jobTitle: 'Engineering Manager',
        homeLinkTitle: 'Startpagina van Christian Brown',
        avatarAlt: 'Avatar van Christian Brown',
        locationIconAlt: 'Locatiepictogram',
        smartHomeLinkTitle: 'Christian Browns smarthome',
    },

    page: {
        smartHomeTitle: 'Smarthome',
        roomsHeading: '📐 Kamers',
        howItWorksHeading: '🏗️ Hoe het werkt',
        floorPlanAlt: 'Plattegrond van het huis, met de temperatuur en luchtvochtigheid van elke kamer',
        howItWorksAlt: 'Diagram dat laat zien hoe deze pagina werkt',
    },

    cv: {
        experienceHeading: 'Werkervaring',
        educationHeading: 'Opleiding',
        downloadCv: 'CV downloaden',
        downloadIconAlt: 'Downloadpictogram',
        now: 'heden',

        homeTempLink(temperature) {
            return `🏠 ${temperature} thuis`;
        },
    },

};
