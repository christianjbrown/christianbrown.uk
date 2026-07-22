'use strict';

/**
 * Spanish (es-ES) catalogue. Mirrors messages.en-GB.js — see that file for the
 * shape and intent. Draft translations, pending a native proofread. Regional
 * variants (es-MX, es-AR, …) resolve here via primary-subtag matching.
 *
 * Spanish conventions applied here: a (non-breaking) space before °C / % , 24-hour
 * time with no am/pm gloss, and Intl for the relative-time and date wording.
 */

const NBSP = String.fromCharCode(0xA0);

export default {
    locale: 'es-ES',

    units: {
        tempC: `${NBSP}°C`,
        tempF: `${NBSP}°F`,
        percent: `${NBSP}%`,
        kmh: 'km/h',
        mph: 'mph',
        degree: '°',
        km: 'km',
        metre: 'm',
    },

    humidityDescriptions: {
        DRY: 'Seco',
        PLEASANT: 'Agradable',
        COMFORTABLE: 'Cómodo',
        STICKY: 'Pegajoso',
        UNCOMFORTABLE: 'Incómodo',
        OPPRESSIVE: 'Sofocante',
        MISERABLE: 'Insoportable',
    },

    uvDescriptions: {
        LOW: 'Bajo',
        MODERATE: 'Moderado',
        HIGH: 'Alto',
        VERY_HIGH: 'Muy alto',
        EXTREME: 'Extremo',
    },

    weatherTypeNames: {
        CLEAR_NIGHT: 'Noche despejada',
        CLOUDY: 'Nublado',
        DRIZZLE: 'Llovizna',
        FOG: 'Niebla',
        HAIL: 'Granizo',
        HAIL_SHOWER_DAY: 'Chubasco de granizo (día)',
        HAIL_SHOWER_NIGHT: 'Chubasco de granizo (noche)',
        HEAVY_RAIN: 'Lluvia intensa',
        HEAVY_RAIN_SHOWER_DAY: 'Chubasco intenso (día)',
        HEAVY_RAIN_SHOWER_NIGHT: 'Chubasco intenso (noche)',
        HEAVY_SNOW: 'Nevada intensa',
        HEAVY_SNOW_SHOWER_DAY: 'Chubasco de nieve intenso (día)',
        HEAVY_SNOW_SHOWER_NIGHT: 'Chubasco de nieve intenso (noche)',
        LIGHT_RAIN: 'Lluvia ligera',
        LIGHT_RAIN_SHOWER_DAY: 'Chubasco ligero (día)',
        LIGHT_RAIN_SHOWER_NIGHT: 'Chubasco ligero (noche)',
        LIGHT_SNOW: 'Nevada ligera',
        LIGHT_SNOW_SHOWER_DAY: 'Chubasco de nieve ligero (día)',
        LIGHT_SNOW_SHOWER_NIGHT: 'Chubasco de nieve ligero (noche)',
        MIST: 'Neblina',
        OVERCAST: 'Cubierto',
        PARTLY_CLOUDY_DAY: 'Parcialmente nublado (día)',
        PARTLY_CLOUDY_NIGHT: 'Parcialmente nublado (noche)',
        SLEET: 'Aguanieve',
        SLEET_SHOWER_DAY: 'Chubasco de aguanieve (día)',
        SLEET_SHOWER_NIGHT: 'Chubasco de aguanieve (noche)',
        SUNNY_DAY: 'Día soleado',
        THUNDER: 'Tormenta',
        THUNDER_SHOWER_DAY: 'Chubasco con tormenta (día)',
        THUNDER_SHOWER_NIGHT: 'Chubasco con tormenta (noche)',
        TRACE_RAIN: 'Lluvia débil',
    },

    compassNames: {
        E: 'Este',
        ENE: 'Estenoreste',
        ESE: 'Estesureste',
        N: 'Norte',
        NE: 'Noreste',
        NNE: 'Nornoreste',
        NNW: 'Nornoroeste',
        NW: 'Noroeste',
        S: 'Sur',
        SE: 'Sureste',
        SSE: 'Sursureste',
        SSW: 'Sursuroeste',
        SW: 'Suroeste',
        W: 'Oeste',
        WNW: 'Oestenoroeste',
        WSW: 'Oestesuroeste',
    },

    roomNames: {
        'Living room': 'Salón',
        'Hallway': 'Recibidor',
        'Kitchen': 'Cocina',
        'Bathroom': 'Baño',
        'Study': 'Despacho',
        'Bedroom': 'Dormitorio',
    },
    deviceNames: {
        'Button': 'Botón',
        'Door sensor': 'Sensor de puerta',
        'Motion sensor': 'Sensor de movimiento',
        'Hygrometer': 'Higrómetro',
    },
    locationNames: {
        'London, UK': 'Londres, Reino Unido',
        'Perth, Australia': 'Perth, Australia',
        'Singapore': 'Singapur',
    },

    table: {
        insideTitle: '🏠 Clima interior',
        average: 'Media',
        updatedPrefix: 'Actualizado ',
    },

    weather: {
        title: '🌤️ Pronóstico del tiempo exterior',
        weatherTypeLabel: 'Tipo de tiempo',
        temperatureLabel: 'Temperatura',
        feelsLikeLabel: 'Sensación térmica',
        humidityLabel: 'Humedad',
        precipitationLabel: 'Probabilidad de precipitación',
        uvIndexLabel: 'Índice UV',
        visibilityLabel: 'Visibilidad',
        windLabel: 'Viento',
        unknown: 'Desconocido',
        gusts: 'ráfagas',
        sourcePrefix: 'Fuente: ',
        forecastBetween: ' pronóstico para ',
        and: ' y ',
    },

    error: {
        line1: '⚠️ Ahora mismo no puedo cargar estos datos.',
        awarePrefix: 'Lo sé: ',
        linkText: 'los expertos',
        awareSuffix: ' están en ello.',
        line3: 'Inténtalo de nuevo más tarde.',
    },

    floor: {
        'Third floor': 'Tercera planta',
        'Fourth floor': 'Cuarta planta',
        outside: 'Exterior',
    },

    time: {
        midnight: 'medianoche',
        noon: 'mediodía',
        twelveHourGloss: false,
        onWord: ' el ',

        relativeTime(value, unit) {
            return new Intl.RelativeTimeFormat('es-ES', { numeric: 'always', style: 'short' }).format(-value, unit);
        },

        formatDate(date, timeZone, long = false) {
            return new Intl.DateTimeFormat('es-ES', {
                timeZone,
                weekday: long ? 'long' : 'short',
                day: 'numeric',
                month: long ? 'long' : 'short',
            }).format(date);
        },
    },

    climateSummary(f) {
        let s = f.temperaturesMatch
            ? `Hace ${f.insideTemp} tanto dentro como fuera`
            : `Dentro está ${f.diffTemp} ${f.warmer ? 'más cálido' : 'más fresco'} (${f.insideTemp} dentro, ${f.outsideTemp} fuera)`;

        if (f.humidity) {
            const h = f.humidity;
            const conjunction = h.contrast ? 'pero' : 'y';
            const clause = h.match
                ? `la humedad es del ${h.inside} tanto dentro como fuera`
                : `hay ${h.diff} ${h.moreInside ? 'más' : 'menos'} humedad${f.temperaturesMatch ? ' dentro' : ''} (${h.inside} dentro, ${h.outside} fuera)`;
            s += `, ${conjunction} ${clause}`;
        }

        return s + '.';
    },

    statusLine(time, date, climate) {
        const when = `Ahora mismo son las ${time} el ${date} en mi casa de Londres`;
        return climate ? `${when}. ${climate}` : `${when}.`;
    },

    theme: {
        auto: 'Auto',
        light: 'Claro',
        dark: 'Oscuro',
        switchTitle: 'Cambiar el tema de color',
        ariaLabelTemplate: 'Tema de color: {label}. Actívalo para cambiarlo.',
    },

    header: {
        jobTitle: 'Responsable de ingeniería',
        homeLinkTitle: 'Página de inicio de Christian Brown',
        avatarAlt: 'Avatar de Christian Brown',
        locationIconAlt: 'Icono de ubicación',
        smartHomeLinkTitle: 'La casa inteligente de Christian Brown',
    },

    page: {
        smartHomeTitle: 'Casa inteligente',
        roomsHeading: '📐 Habitaciones',
        howItWorksHeading: '🏗️ Cómo funciona',
        floorPlanAlt: 'Plano de la casa, con la temperatura y la humedad de cada habitación',
        howItWorksAlt: 'Diagrama que muestra cómo funciona esta página',
    },

    cv: {
        experienceHeading: 'Experiencia profesional',
        educationHeading: 'Formación',
        downloadCv: 'Descargar CV',
        downloadIconAlt: 'Icono de descarga',
        now: 'actualidad',

        homeTempLink(temperature) {
            return `🏠 ${temperature} en casa`;
        },
    },
};
