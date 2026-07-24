'use strict';

/**
 * Simplified Chinese (zh-CN) catalogue. Mirrors messages.en-GB.js — see that file
 * for the shape and intent. Draft translations, pending a native proofread.
 * Regional variants (zh-Hans, zh-SG, …) resolve here via matchLocale.
 *
 * Chinese conventions applied here: a period decimal separator, units tight
 * against the number, 24-hour time with no am/pm gloss, and Intl for the
 * (year-first) date, relative-time and duration wording.
 */

export default {
    locale: 'zh-CN',

    units: {
        tempC: '°C',
        tempF: '°F',
        percent: '%',
        kmh: 'km/h',
        mph: 'mph',
        degree: '°',
        km: 'km',
        metre: 'm',
        hpa: 'hPa',
    },

    humidityDescriptions: {
        DRY: '干燥',
        PLEASANT: '宜人',
        COMFORTABLE: '舒适',
        STICKY: '黏腻',
        UNCOMFORTABLE: '不适',
        OPPRESSIVE: '闷热',
        MISERABLE: '难受',
    },

    uvDescriptions: {
        LOW: '低',
        MODERATE: '中等',
        HIGH: '高',
        VERY_HIGH: '很高',
        EXTREME: '极高',
    },

    weatherTypeNames: {
        CLEAR_NIGHT: '晴朗夜空',
        CLOUDY: '多云',
        DRIZZLE: '毛毛雨',
        FOG: '雾',
        HAIL: '冰雹',
        HAIL_SHOWER_DAY: '冰雹阵雨（白天）',
        HAIL_SHOWER_NIGHT: '冰雹阵雨（夜间）',
        HEAVY_RAIN: '大雨',
        HEAVY_RAIN_SHOWER_DAY: '强阵雨（白天）',
        HEAVY_RAIN_SHOWER_NIGHT: '强阵雨（夜间）',
        HEAVY_SNOW: '大雪',
        HEAVY_SNOW_SHOWER_DAY: '强阵雪（白天）',
        HEAVY_SNOW_SHOWER_NIGHT: '强阵雪（夜间）',
        LIGHT_RAIN: '小雨',
        LIGHT_RAIN_SHOWER_DAY: '弱阵雨（白天）',
        LIGHT_RAIN_SHOWER_NIGHT: '弱阵雨（夜间）',
        LIGHT_SNOW: '小雪',
        LIGHT_SNOW_SHOWER_DAY: '弱阵雪（白天）',
        LIGHT_SNOW_SHOWER_NIGHT: '弱阵雪（夜间）',
        MIST: '薄雾',
        OVERCAST: '阴天',
        PARTLY_CLOUDY_DAY: '局部多云（白天）',
        PARTLY_CLOUDY_NIGHT: '局部多云（夜间）',
        SLEET: '雨夹雪',
        SLEET_SHOWER_DAY: '雨夹雪阵雨（白天）',
        SLEET_SHOWER_NIGHT: '雨夹雪阵雨（夜间）',
        SUNNY_DAY: '晴天',
        THUNDER: '雷暴',
        THUNDER_SHOWER_DAY: '雷阵雨（白天）',
        THUNDER_SHOWER_NIGHT: '雷阵雨（夜间）',
        TRACE_RAIN: '微量降雨',
    },

    compassNames: {
        E: '东',
        ENE: '东北偏东',
        ESE: '东南偏东',
        N: '北',
        NE: '东北',
        NNE: '东北偏北',
        NNW: '西北偏北',
        NW: '西北',
        S: '南',
        SE: '东南',
        SSE: '东南偏南',
        SSW: '西南偏南',
        SW: '西南',
        W: '西',
        WNW: '西北偏西',
        WSW: '西南偏西',
    },

    roomNames: {
        'Living room': '客厅',
        'Hallway': '走廊',
        'Kitchen': '厨房',
        'Bathroom': '浴室',
        'Study': '书房',
        'Bedroom': '卧室',
    },
    deviceNames: {
        'Button': '按钮',
        'Door sensor': '门传感器',
        'Motion sensor': '运动传感器',
        'Hygrometer': '湿度计',
    },
    locationNames: {
        'London, UK': '英国伦敦',
        'Perth, Australia': '澳大利亚珀斯',
        'Singapore': '新加坡',
    },

    table: {
        insideTitle: '🏠 室内气候',
        average: '平均',
        updatedPrefix: '更新于',
    },

    weather: {
        title: '🌤️ 室外天气预报',
        weatherTypeLabel: '天气类型',
        temperatureLabel: '温度',
        feelsLikeLabel: '体感温度',
        humidityLabel: '湿度',
        precipitationLabel: '降水概率',
        uvIndexLabel: '紫外线指数',
        visibilityLabel: '能见度',
        pressureLabel: '气压',
        dewPointLabel: '露点',
        windLabel: '风',
        unknown: '未知',
        gusts: '阵风',
        sourcePrefix: '来源：',
        forecastBetween: ' 天气预报，时段为 ',
        and: ' 至 ',
    },

    error: {
        line1: '⚠️ 目前无法加载这些数据。',
        awarePrefix: '我知道了 —— ',
        linkText: '专家们',
        awareSuffix: ' 正在处理。',
        line3: '请稍后再试。',
    },

    floor: {
        'Third floor': '三楼',
        'Fourth floor': '四楼',
        outside: '室外',
    },

    time: {
        midnight: '午夜',
        noon: '正午',
        justNow: '刚刚',
        twelveHourGloss: false,
        onWord: ' ',

        relativeTime(value, unit) {
            return new Intl.RelativeTimeFormat('zh-CN', { numeric: 'always', style: 'short' }).format(-value, unit);
        },

        formatDate(date, timeZone, long = false) {
            return new Intl.DateTimeFormat('zh-CN', {
                timeZone,
                weekday: long ? 'long' : 'short',
                day: 'numeric',
                month: long ? 'long' : 'short',
            }).format(date);
        },
    },

    climateSummary(f) {
        let s = f.temperaturesMatch
            ? `室内外都是 ${f.insideTemp}`
            : `室内比室外${f.warmer ? '暖' : '凉'}了 ${f.diffTemp}（室内 ${f.insideTemp}，室外 ${f.outsideTemp}）`;

        if (f.humidity) {
            const h = f.humidity;
            const conjunction = h.contrast ? '但' : '而';
            const clause = h.match
                ? `湿度室内外都是 ${h.inside}`
                : `室内湿度${h.moreInside ? '高' : '低'}了 ${h.diff}（室内 ${h.inside}，室外 ${h.outside}）`;
            s += `，${conjunction}${clause}`;
        }

        return s + '。';
    },

    statusLine(time, date, climate) {
        const when = `现在是 ${time}，${date}，在我伦敦的家中`;
        return climate ? `${when}。${climate}` : `${when}。`;
    },

    // Appended to the status line when the climate favours opening a window.
    windowAdvice: '也许最好开窗通风。',

    theme: {
        auto: '自动',
        light: '浅色',
        dark: '深色',
        switchTitle: '切换配色主题',
        ariaLabelTemplate: '配色主题：{label}。激活以更改。',
    },

    header: {
        jobTitle: '工程经理',
        homeLinkTitle: 'Christian Brown 主页',
        avatarAlt: 'Christian Brown 的头像',
        locationIconAlt: '位置图标',
        smartHomeLinkTitle: 'Christian Brown 的智能家居',
    },

    page: {
        smartHomeTitle: '智能家居',
        roomsHeading: '📐 平面图',
        historicalHeading: '📜 历史',
        howItWorksHeading: '🏗️ 工作原理',
        floorPlanAlt: '房屋平面图，标注各房间的温度和湿度',
        howItWorksAlt: '展示此页面工作原理的示意图',
    },

    cv: {
        experienceHeading: '工作经历',
        educationHeading: '教育经历',
        downloadCv: '下载简历',
        downloadIconAlt: '下载图标',
        now: '至今',

        homeTempLink(temperature) {
            return `🏠 家中 ${temperature}`;
        },
    },

    climateHistory: {
        title: '气候历史',
        loading: '正在加载气候历史…',
        error: '暂时无法加载气候历史。',
        zoomInLabel: '放大 — 更精细的分辨率、更短的时间范围',
        zoomOutLabel: '缩小 — 更粗的分辨率、更长的时间范围',
        series: {
            outside: '室外温度',
            insideMin: '室内最低温度',
            insideMax: '室内最高温度',
        },
        humiditySeries: {
            outside: '室外湿度',
            insideMin: '室内最低湿度',
            insideMax: '室内最高湿度',
        },
        metricToggle: {
            temperature: '显示温度',
            humidity: '显示湿度',
        },
        resolutions: {
            'hourly-day': '最近一天 · 每小时',
            'hourly-1-month': '最近一个月 · 每小时',
            'daily-1-month': '最近一个月 · 每天',
            'daily-3-month': '最近 3 个月 · 每天',
            'daily-6-month': '最近 6 个月 · 每天',
            'daily-12-month': '最近 12 个月 · 每天',
        },
    },
};
