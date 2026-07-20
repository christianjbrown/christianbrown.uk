'use strict';

/**
 * Traditional Chinese (zh-TW) catalogue. Mirrors messages.en-GB.js — see that file
 * for the shape and intent. Draft translations using Taiwan vocabulary (e.g.
 * 智慧家庭, 履歷, 感測器, 機率), pending a native proofread. Regional variants
 * (zh-Hant, zh-HK, zh-MO, …) resolve here via matchLocale.
 *
 * Chinese conventions applied here: a period decimal separator, units tight
 * against the number, 24-hour time with no am/pm gloss, and Intl for the
 * (year-first) date, relative-time and duration wording.
 */

export default {
    locale: 'zh-TW',

    units: {
        tempC: '°C',
        tempF: '°F',
        percent: '%',
        kmh: 'km/h',
        mph: 'mph',
        degree: '°',
    },

    humidityDescriptions: {
        DRY: '乾燥',
        PLEASANT: '宜人',
        COMFORTABLE: '舒適',
        STICKY: '黏膩',
        UNCOMFORTABLE: '不適',
        OPPRESSIVE: '悶熱',
        MISERABLE: '難受',
    },

    weatherTypeNames: {
        CLEAR_NIGHT: '晴朗夜空',
        CLOUDY: '多雲',
        DRIZZLE: '毛毛雨',
        FOG: '霧',
        HAIL: '冰雹',
        HAIL_SHOWER_DAY: '冰雹陣雨（白天）',
        HAIL_SHOWER_NIGHT: '冰雹陣雨（夜間）',
        HEAVY_RAIN: '大雨',
        HEAVY_RAIN_SHOWER_DAY: '強陣雨（白天）',
        HEAVY_RAIN_SHOWER_NIGHT: '強陣雨（夜間）',
        HEAVY_SNOW: '大雪',
        HEAVY_SNOW_SHOWER_DAY: '強陣雪（白天）',
        HEAVY_SNOW_SHOWER_NIGHT: '強陣雪（夜間）',
        LIGHT_RAIN: '小雨',
        LIGHT_RAIN_SHOWER_DAY: '弱陣雨（白天）',
        LIGHT_RAIN_SHOWER_NIGHT: '弱陣雨（夜間）',
        LIGHT_SNOW: '小雪',
        LIGHT_SNOW_SHOWER_DAY: '弱陣雪（白天）',
        LIGHT_SNOW_SHOWER_NIGHT: '弱陣雪（夜間）',
        MIST: '薄霧',
        OVERCAST: '陰天',
        PARTLY_CLOUDY_DAY: '局部多雲（白天）',
        PARTLY_CLOUDY_NIGHT: '局部多雲（夜間）',
        SLEET: '雨夾雪',
        SLEET_SHOWER_DAY: '雨夾雪陣雨（白天）',
        SLEET_SHOWER_NIGHT: '雨夾雪陣雨（夜間）',
        SUNNY_DAY: '晴天',
        THUNDER: '雷暴',
        THUNDER_SHOWER_DAY: '雷陣雨（白天）',
        THUNDER_SHOWER_NIGHT: '雷陣雨（夜間）',
        TRACE_RAIN: '微量降雨',
    },

    compassNames: {
        E: '東',
        ENE: '東北偏東',
        ESE: '東南偏東',
        N: '北',
        NE: '東北',
        NNE: '東北偏北',
        NNW: '西北偏北',
        NW: '西北',
        S: '南',
        SE: '東南',
        SSE: '東南偏南',
        SSW: '西南偏南',
        SW: '西南',
        W: '西',
        WNW: '西北偏西',
        WSW: '西南偏西',
    },

    roomNames: {
        'Living room': '客廳',
        'Hallway': '走廊',
        'Kitchen': '廚房',
        'Bathroom': '浴室',
        'Study': '書房',
        'Bedroom': '臥室',
    },
    deviceNames: {
        'Button': '按鈕',
        'Door sensor': '門感測器',
        'Motion sensor': '動作感測器',
        'Hygrometer': '濕度計',
    },
    locationNames: {
        'London, UK': '英國倫敦',
        'Perth, Australia': '澳洲伯斯',
        'Singapore': '新加坡',
    },

    table: {
        insideTitle: '🏠 室內氣候',
        average: '平均',
        updatedPrefix: '更新於',
    },

    weather: {
        title: '🌤️ 室外天氣預報',
        weatherTypeLabel: '天氣類型',
        temperatureLabel: '🌡️ 溫度',
        feelsLikeLabel: '體感溫度',
        humidityLabel: '💧 濕度',
        precipitationLabel: '降水機率',
        windLabel: '風',
        unknown: '未知',
        gusts: '陣風',
        sourcePrefix: '來源：',
        forecastBetween: ' 天氣預報，時段為 ',
        and: ' 至 ',
    },

    error: {
        line1: '⚠️ 目前無法載入這些資料。',
        awarePrefix: '我知道了 —— ',
        linkText: '專家們',
        awareSuffix: ' 正在處理。',
        line3: '請稍後再試。',
    },

    floor: {
        'Third floor': '三樓',
        'Fourth floor': '四樓',
        outside: '室外',
    },

    time: {
        midnight: '午夜',
        noon: '正午',
        twelveHourGloss: false,
        onWord: ' ',

        relativeTime(value, unit) {
            return new Intl.RelativeTimeFormat('zh-TW', { numeric: 'always', style: 'short' }).format(-value, unit);
        },

        formatDate(date, timeZone, long = false) {
            return new Intl.DateTimeFormat('zh-TW', {
                timeZone,
                weekday: long ? 'long' : 'short',
                day: 'numeric',
                month: long ? 'long' : 'short',
            }).format(date);
        },
    },

    climateSummary(f) {
        let s = f.temperaturesMatch
            ? `室內外都是 ${f.insideTemp}`
            : `室內比室外${f.warmer ? '暖' : '涼'}了 ${f.diffTemp}（室內 ${f.insideTemp}，室外 ${f.outsideTemp}）`;

        if (f.humidity) {
            const h = f.humidity;
            const conjunction = h.contrast ? '但' : '而';
            const clause = h.match
                ? `濕度室內外都是 ${h.inside}`
                : `室內濕度${h.moreInside ? '高' : '低'}了 ${h.diff}（室內 ${h.inside}，室外 ${h.outside}）`;
            s += `，${conjunction}${clause}`;
        }

        return s + '。';
    },

    statusLine(time, date, climate) {
        const when = `現在是 ${time}，${date}，在我倫敦的家中`;
        return climate ? `${when}。${climate}` : `${when}。`;
    },

    theme: {
        auto: '自動',
        light: '淺色',
        dark: '深色',
        switchTitle: '切換配色主題',
        ariaLabelTemplate: '配色主題：{label}。啟用以變更。',
    },

    header: {
        jobTitle: '工程經理',
        homeLinkTitle: 'Christian Brown 首頁',
        avatarAlt: 'Christian Brown 的頭像',
        locationIconAlt: '位置圖示',
        smartHomeLinkTitle: 'Christian Brown 的智慧家庭',
    },

    page: {
        smartHomeTitle: '智慧家庭',
        roomsHeading: '📐 房間',
        howItWorksHeading: '🏗️ 運作原理',
        floorPlanAlt: '房屋平面圖，標註各房間的溫度與濕度',
        howItWorksAlt: '顯示此頁面運作原理的示意圖',
    },

    cv: {
        experienceHeading: '工作經歷',
        educationHeading: '教育經歷',
        downloadCv: '下載履歷',
        downloadIconAlt: '下載圖示',
        now: '至今',

        homeTempLink(temperature) {
            return `🏠 家中 ${temperature}`;
        },
    },
};
