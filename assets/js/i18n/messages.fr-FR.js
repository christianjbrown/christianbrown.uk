'use strict';

/**
 * French (fr-FR) catalogue. Mirrors messages.en-GB.js — see that file for the
 * shape and intent. Draft translations, pending a native proofread.
 *
 * French conventions applied here: a (non-breaking) space before °C / % (and
 * before the colon in "Source :"), 24-hour time with no am/pm gloss, and Intl
 * for the relative-time and date wording.
 */

const NBSP = String.fromCharCode(0xA0);

export default {
    locale: 'fr-FR',

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
        DRY: 'Sec',
        PLEASANT: 'Agréable',
        COMFORTABLE: 'Confortable',
        STICKY: 'Moite',
        UNCOMFORTABLE: 'Inconfortable',
        OPPRESSIVE: 'Étouffant',
        MISERABLE: 'Pénible',
    },

    uvDescriptions: {
        LOW: 'Faible',
        MODERATE: 'Modéré',
        HIGH: 'Élevé',
        VERY_HIGH: 'Très élevé',
        EXTREME: 'Extrême',
    },

    weatherTypeNames: {
        CLEAR_NIGHT: 'Nuit claire',
        CLOUDY: 'Nuageux',
        DRIZZLE: 'Bruine',
        FOG: 'Brouillard',
        HAIL: 'Grêle',
        HAIL_SHOWER_DAY: 'Averse de grêle (jour)',
        HAIL_SHOWER_NIGHT: 'Averse de grêle (nuit)',
        HEAVY_RAIN: 'Forte pluie',
        HEAVY_RAIN_SHOWER_DAY: 'Forte averse (jour)',
        HEAVY_RAIN_SHOWER_NIGHT: 'Forte averse (nuit)',
        HEAVY_SNOW: 'Fortes chutes de neige',
        HEAVY_SNOW_SHOWER_DAY: 'Forte averse de neige (jour)',
        HEAVY_SNOW_SHOWER_NIGHT: 'Forte averse de neige (nuit)',
        LIGHT_RAIN: 'Pluie légère',
        LIGHT_RAIN_SHOWER_DAY: 'Légère averse (jour)',
        LIGHT_RAIN_SHOWER_NIGHT: 'Légère averse (nuit)',
        LIGHT_SNOW: 'Légères chutes de neige',
        LIGHT_SNOW_SHOWER_DAY: 'Légère averse de neige (jour)',
        LIGHT_SNOW_SHOWER_NIGHT: 'Légère averse de neige (nuit)',
        MIST: 'Brume',
        OVERCAST: 'Ciel couvert',
        PARTLY_CLOUDY_DAY: 'Partiellement nuageux (jour)',
        PARTLY_CLOUDY_NIGHT: 'Partiellement nuageux (nuit)',
        SLEET: 'Neige fondue',
        SLEET_SHOWER_DAY: 'Averse de neige fondue (jour)',
        SLEET_SHOWER_NIGHT: 'Averse de neige fondue (nuit)',
        SUNNY_DAY: 'Journée ensoleillée',
        THUNDER: 'Orage',
        THUNDER_SHOWER_DAY: 'Averse orageuse (jour)',
        THUNDER_SHOWER_NIGHT: 'Averse orageuse (nuit)',
        TRACE_RAIN: 'Pluie faible',
    },

    compassNames: {
        E: 'Est',
        ENE: 'Est-nord-est',
        ESE: 'Est-sud-est',
        N: 'Nord',
        NE: 'Nord-est',
        NNE: 'Nord-nord-est',
        NNW: 'Nord-nord-ouest',
        NW: 'Nord-ouest',
        S: 'Sud',
        SE: 'Sud-est',
        SSE: 'Sud-sud-est',
        SSW: 'Sud-sud-ouest',
        SW: 'Sud-ouest',
        W: 'Ouest',
        WNW: 'Ouest-nord-ouest',
        WSW: 'Ouest-sud-ouest',
    },

    // Display-name maps for SmartThings room/device names, keyed by the raw API
    // value; anything unmapped falls back to the API value.
    roomNames: {
        'Living room': 'Salon',
        'Hallway': 'Couloir',
        'Kitchen': 'Cuisine',
        'Bathroom': 'Salle de bain',
        'Study': 'Bureau',
        'Bedroom': 'Chambre',
    },
    deviceNames: {
        'Button': 'Bouton',
        'Door sensor': 'Capteur de porte',
        'Motion sensor': 'Détecteur de mouvement',
        'Hygrometer': 'Hygromètre',
    },
    locationNames: {
        'London, UK': 'Londres, Royaume-Uni',
        'Perth, Australia': 'Perth, Australie',
        'Singapore': 'Singapour',
    },

    table: {
        insideTitle: '🏠 Climat intérieur',
        average: 'Moyenne',
        updatedPrefix: 'Mis à jour ',
    },

    weather: {
        title: '🌤️ Prévisions météo extérieures',
        weatherTypeLabel: 'Type de temps',
        temperatureLabel: 'Température',
        feelsLikeLabel: 'Température ressentie',
        humidityLabel: 'Humidité',
        precipitationLabel: 'Probabilité de précipitations',
        uvIndexLabel: 'Indice UV',
        visibilityLabel: 'Visibilité',
        pressureLabel: 'Pression',
        dewPointLabel: 'Point de rosée',
        windLabel: 'Vent',
        unknown: 'Inconnu',
        gusts: 'rafales',
        sourcePrefix: 'Source : ',
        forecastBetween: ' prévisions pour ',
        and: ' et ',
    },

    error: {
        line1: '⚠️ Impossible de charger ces données pour le moment.',
        awarePrefix: 'Je suis au courant – ',
        linkText: 'les experts',
        awareSuffix: " s'en occupent.",
        line3: 'Veuillez réessayer plus tard.',
    },

    floor: {
        'Third floor': 'Troisième étage',
        'Fourth floor': 'Quatrième étage',
        outside: 'Extérieur',
    },

    time: {
        midnight: 'minuit',
        noon: 'midi',
        justNow: "à l'instant",
        twelveHourGloss: false,
        onWord: ' le ',

        relativeTime(value, unit) {
            return new Intl.RelativeTimeFormat('fr-FR', { numeric: 'always', style: 'short' }).format(-value, unit);
        },

        formatDate(date, timeZone, long = false) {
            return new Intl.DateTimeFormat('fr-FR', {
                timeZone,
                weekday: long ? 'long' : 'short',
                day: 'numeric',
                month: long ? 'long' : 'short',
            }).format(date);
        },
    },

    climateSummary(f) {
        let s = f.temperaturesMatch
            ? `Il fait ${f.insideTemp} à l'intérieur comme à l'extérieur`
            : `Il fait ${f.diffTemp} de ${f.warmer ? 'plus' : 'moins'} à l'intérieur (${f.insideTemp} à l'intérieur, ${f.outsideTemp} à l'extérieur)`;

        if (f.humidity) {
            const h = f.humidity;
            const conjunction = h.contrast ? 'mais' : 'et';
            const clause = h.match
                ? `l'humidité est de ${h.inside} à l'intérieur comme à l'extérieur`
                : `il y a ${h.diff} d'humidité en ${h.moreInside ? 'plus' : 'moins'}${f.temperaturesMatch ? " à l'intérieur" : ''} (${h.inside} à l'intérieur, ${h.outside} à l'extérieur)`;
            s += `, ${conjunction} ${clause}`;
        }

        return s + '.';
    },

    // French reads more naturally as a second, standalone sentence than spliced
    // mid-sentence.
    statusLine(time, date, climate) {
        const when = `Il est actuellement ${time} le ${date} chez moi à Londres`;
        return climate ? `${when}. ${climate}` : `${when}.`;
    },

    // Appended to the status line when the climate favours opening a window.
    windowAdvice: 'Mieux vaut sans doute ouvrir une fenêtre.',

    theme: {
        auto: 'Auto',
        light: 'Clair',
        dark: 'Sombre',
        switchTitle: 'Changer de thème de couleur',
        ariaLabelTemplate: 'Thème de couleur : {label}. Activer pour changer.',
    },

    header: {
        jobTitle: 'Responsable ingénierie',
        homeLinkTitle: "Page d'accueil de Christian Brown",
        avatarAlt: 'Avatar de Christian Brown',
        locationIconAlt: 'Icône de localisation',
        smartHomeLinkTitle: 'La maison connectée de Christian Brown',
    },

    page: {
        smartHomeTitle: 'Maison connectée',
        roomsHeading: '📐 Pièces',
        howItWorksHeading: '🏗️ Comment ça marche',
        floorPlanAlt: "Plan de la maison, avec la température et l'humidité de chaque pièce",
        howItWorksAlt: 'Schéma montrant le fonctionnement de cette page',
    },

    cv: {
        experienceHeading: 'Expérience professionnelle',
        educationHeading: 'Formation',
        downloadCv: 'Télécharger le CV',
        downloadIconAlt: 'Icône de téléchargement',
        now: "aujourd'hui",

        homeTempLink(temperature) {
            return `🏠 ${temperature} à la maison`;
        },
    },

    climateHistory: {
        title: 'Historique du climat',
        loading: 'Chargement de l’historique du climat…',
        error: 'Impossible de charger l’historique du climat pour le moment.',
        zoomInLabel: 'Zoom avant – résolution plus fine, période plus courte',
        zoomOutLabel: 'Zoom arrière – résolution plus grossière, période plus longue',
        series: {
            outside: 'Température extérieure',
            insideMin: 'Température intérieure (min.)',
            insideMax: 'Température intérieure (max.)',
        },
        humiditySeries: {
            outside: 'Humidité extérieure',
            insideMin: 'Humidité intérieure (min.)',
            insideMax: 'Humidité intérieure (max.)',
        },
        metricToggle: {
            temperature: 'Afficher la température',
            humidity: "Afficher l'humidité",
        },
        resolutions: {
            'hourly-day': 'Dernier jour · horaire',
            'hourly-1-month': 'Dernier mois · horaire',
            'daily-1-month': 'Dernier mois · quotidien',
            'daily-3-month': 'Les 3 derniers mois · quotidien',
            'daily-6-month': 'Les 6 derniers mois · quotidien',
            'daily-12-month': 'Les 12 derniers mois · quotidien',
        },
    },
};
