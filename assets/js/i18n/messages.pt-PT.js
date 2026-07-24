'use strict';

/**
 * Portuguese (pt-PT) catalogue. Mirrors messages.en-GB.js — see that file for the
 * shape and intent. Draft translations, pending a native proofread. Regional
 * variants (pt-BR, …) resolve here via primary-subtag matching.
 *
 * Portuguese conventions applied here: a (non-breaking) space before °C / % , 24-hour
 * time with no am/pm gloss, and Intl for the relative-time and date wording.
 */

const NBSP = String.fromCharCode(0xA0);

export default {
    locale: 'pt-PT',

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
        DRY: 'Seco',
        PLEASANT: 'Agradável',
        COMFORTABLE: 'Confortável',
        STICKY: 'Pegajoso',
        UNCOMFORTABLE: 'Desconfortável',
        OPPRESSIVE: 'Sufocante',
        MISERABLE: 'Insuportável',
    },

    uvDescriptions: {
        LOW: 'Baixo',
        MODERATE: 'Moderado',
        HIGH: 'Alto',
        VERY_HIGH: 'Muito alto',
        EXTREME: 'Extremo',
    },

    weatherTypeNames: {
        CLEAR_NIGHT: 'Noite limpa',
        CLOUDY: 'Nublado',
        DRIZZLE: 'Chuvisco',
        FOG: 'Nevoeiro',
        HAIL: 'Granizo',
        HAIL_SHOWER_DAY: 'Aguaceiro de granizo (dia)',
        HAIL_SHOWER_NIGHT: 'Aguaceiro de granizo (noite)',
        HEAVY_RAIN: 'Chuva forte',
        HEAVY_RAIN_SHOWER_DAY: 'Aguaceiro forte (dia)',
        HEAVY_RAIN_SHOWER_NIGHT: 'Aguaceiro forte (noite)',
        HEAVY_SNOW: 'Neve forte',
        HEAVY_SNOW_SHOWER_DAY: 'Aguaceiro de neve forte (dia)',
        HEAVY_SNOW_SHOWER_NIGHT: 'Aguaceiro de neve forte (noite)',
        LIGHT_RAIN: 'Chuva fraca',
        LIGHT_RAIN_SHOWER_DAY: 'Aguaceiro fraco (dia)',
        LIGHT_RAIN_SHOWER_NIGHT: 'Aguaceiro fraco (noite)',
        LIGHT_SNOW: 'Neve fraca',
        LIGHT_SNOW_SHOWER_DAY: 'Aguaceiro de neve fraco (dia)',
        LIGHT_SNOW_SHOWER_NIGHT: 'Aguaceiro de neve fraco (noite)',
        MIST: 'Névoa',
        OVERCAST: 'Encoberto',
        PARTLY_CLOUDY_DAY: 'Parcialmente nublado (dia)',
        PARTLY_CLOUDY_NIGHT: 'Parcialmente nublado (noite)',
        SLEET: 'Chuva com neve',
        SLEET_SHOWER_DAY: 'Aguaceiro de chuva com neve (dia)',
        SLEET_SHOWER_NIGHT: 'Aguaceiro de chuva com neve (noite)',
        SUNNY_DAY: 'Dia de sol',
        THUNDER: 'Trovoada',
        THUNDER_SHOWER_DAY: 'Aguaceiro com trovoada (dia)',
        THUNDER_SHOWER_NIGHT: 'Aguaceiro com trovoada (noite)',
        TRACE_RAIN: 'Chuva vestigial',
    },

    compassNames: {
        E: 'Este',
        ENE: 'És-nordeste',
        ESE: 'És-sudeste',
        N: 'Norte',
        NE: 'Nordeste',
        NNE: 'Nor-nordeste',
        NNW: 'Nor-noroeste',
        NW: 'Noroeste',
        S: 'Sul',
        SE: 'Sudeste',
        SSE: 'Su-sudeste',
        SSW: 'Su-sudoeste',
        SW: 'Sudoeste',
        W: 'Oeste',
        WNW: 'Oés-noroeste',
        WSW: 'Oés-sudoeste',
    },

    roomNames: {
        'Living room': 'Sala de estar',
        'Hallway': 'Corredor',
        'Kitchen': 'Cozinha',
        'Bathroom': 'Casa de banho',
        'Study': 'Escritório',
        'Bedroom': 'Quarto',
    },
    deviceNames: {
        'Button': 'Botão',
        'Door sensor': 'Sensor de porta',
        'Motion sensor': 'Sensor de movimento',
        'Hygrometer': 'Higrómetro',
    },
    locationNames: {
        'London, UK': 'Londres, Reino Unido',
        'Perth, Australia': 'Perth, Austrália',
        'Singapore': 'Singapura',
    },

    table: {
        insideTitle: '🏠 Clima interior',
        average: 'Média',
        updatedPrefix: 'Atualizado ',
    },

    weather: {
        title: '🌤️ Previsão meteorológica exterior',
        weatherTypeLabel: 'Tipo de tempo',
        temperatureLabel: 'Temperatura',
        feelsLikeLabel: 'Sensação térmica',
        humidityLabel: 'Humidade',
        precipitationLabel: 'Probabilidade de precipitação',
        uvIndexLabel: 'Índice UV',
        visibilityLabel: 'Visibilidade',
        pressureLabel: 'Pressão',
        dewPointLabel: 'Ponto de orvalho',
        windLabel: 'Vento',
        unknown: 'Desconhecido',
        gusts: 'rajadas',
        sourcePrefix: 'Fonte: ',
        forecastBetween: ' previsão para ',
        and: ' e ',
    },

    error: {
        line1: '⚠️ De momento não consigo carregar estes dados.',
        awarePrefix: 'Eu sei – ',
        linkText: 'os especialistas',
        awareSuffix: ' estão a tratar disso.',
        line3: 'Tente novamente mais tarde.',
    },

    floor: {
        'Third floor': 'Terceiro andar',
        'Fourth floor': 'Quarto andar',
        outside: 'Exterior',
    },

    time: {
        midnight: 'meia-noite',
        noon: 'meio-dia',
        justNow: 'agora mesmo',
        twelveHourGloss: false,
        onWord: ' em ',

        relativeTime(value, unit) {
            return new Intl.RelativeTimeFormat('pt-PT', { numeric: 'always', style: 'short' }).format(-value, unit);
        },

        formatDate(date, timeZone, long = false) {
            return new Intl.DateTimeFormat('pt-PT', {
                timeZone,
                weekday: long ? 'long' : 'short',
                day: 'numeric',
                month: long ? 'long' : 'short',
            }).format(date);
        },
    },

    climateSummary(f) {
        let s = f.temperaturesMatch
            ? `Está ${f.insideTemp} tanto dentro como fora`
            : `Dentro está ${f.diffTemp} ${f.warmer ? 'mais quente' : 'mais fresco'} (${f.insideTemp} dentro, ${f.outsideTemp} fora)`;

        if (f.humidity) {
            const h = f.humidity;
            const conjunction = h.contrast ? 'mas' : 'e';
            const clause = h.match
                ? `a humidade é de ${h.inside} tanto dentro como fora`
                : `há ${h.diff} ${h.moreInside ? 'mais' : 'menos'} humidade${f.temperaturesMatch ? ' dentro' : ''} (${h.inside} dentro, ${h.outside} fora)`;
            s += `, ${conjunction} ${clause}`;
        }

        return s + '.';
    },

    statusLine(time, date, climate) {
        const when = `Agora são ${time} de ${date} na minha casa em Londres`;
        return climate ? `${when}. ${climate}` : `${when}.`;
    },

    // Appended to the status line when the climate favours opening a window.
    windowAdvice: 'Talvez seja melhor abrir uma janela.',

    theme: {
        auto: 'Auto',
        light: 'Claro',
        dark: 'Escuro',
        switchTitle: 'Mudar o tema de cor',
        ariaLabelTemplate: 'Tema de cor: {label}. Ative para mudar.',
    },

    header: {
        jobTitle: 'Responsável de engenharia',
        homeLinkTitle: 'Página inicial de Christian Brown',
        avatarAlt: 'Avatar de Christian Brown',
        locationIconAlt: 'Ícone de localização',
        smartHomeLinkTitle: 'A casa inteligente de Christian Brown',
    },

    page: {
        smartHomeTitle: 'Casa inteligente',
        roomsHeading: '📐 Divisões',
        howItWorksHeading: '🏗️ Como funciona',
        floorPlanAlt: 'Planta da casa, com a temperatura e a humidade de cada divisão',
        howItWorksAlt: 'Diagrama que mostra como esta página funciona',
    },

    cv: {
        experienceHeading: 'Experiência profissional',
        educationHeading: 'Formação',
        downloadCv: 'Descarregar CV',
        downloadIconAlt: 'Ícone de descarregar',
        now: 'atualidade',

        homeTempLink(temperature) {
            return `🏠 ${temperature} em casa`;
        },
    },

    climateHistory: {
        title: 'Histórico do clima',
        loading: 'A carregar o histórico do clima…',
        error: 'Não foi possível carregar o histórico do clima neste momento.',
        zoomInLabel: 'Aumentar – resolução mais fina, período mais curto',
        zoomOutLabel: 'Diminuir – resolução mais grosseira, período mais longo',
        series: {
            outside: 'Temperatura exterior',
            insideMin: 'Temperatura interior (mín.)',
            insideMax: 'Temperatura interior (máx.)',
        },
        humiditySeries: {
            outside: 'Humidade exterior',
            insideMin: 'Humidade interior (mín.)',
            insideMax: 'Humidade interior (máx.)',
        },
        metricToggle: {
            temperature: 'Mostrar temperatura',
            humidity: 'Mostrar humidade',
        },
        resolutions: {
            'hourly-day': 'Último dia · por hora',
            'hourly-1-month': 'Último mês · por hora',
            'daily-1-month': 'Último mês · diário',
            'daily-3-month': 'Últimos 3 meses · diário',
            'daily-6-month': 'Últimos 6 meses · diário',
            'daily-12-month': 'Últimos 12 meses · diário',
        },
    },
};
