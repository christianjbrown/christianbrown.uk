'use strict';

/**
 * Display mapping for Met Office weather types.
 *
 * The weather endpoint sends `type_name` — a stable `WeatherType` enum-name
 * token (e.g. "HEAVY_RAIN") — rather than pre-rendered wording, because the
 * name and emoji are a presentation concern this site owns. This mirrors how
 * `wind_direction` (an enum-value token) is turned into a friendly name via
 * COMPASS_FRIENDLY_NAMES in MetWeatherTable.js.
 *
 * Keys are the enum names; each maps to its emoji and English name. When
 * locale support lands, `name` becomes a lookup keyed by this same enum name
 * (the emoji stays locale-independent). NOT_USED (Met Office code 4) has no
 * display mapping and is deliberately absent — an unmapped token is skipped by
 * the caller, so no "Weather type" row is shown for it.
 */
export const WEATHER_TYPES = {
    CLEAR_NIGHT: {emoji: '🌙', name: 'Clear night'},
    CLOUDY: {emoji: '☁️', name: 'Cloudy'},
    DRIZZLE: {emoji: '🌧️', name: 'Drizzle'},
    FOG: {emoji: '🌫️', name: 'Fog'},
    HAIL: {emoji: '🌨', name: 'Hail'},
    HAIL_SHOWER_DAY: {emoji: '🌨', name: 'Hail shower (day)'},
    HAIL_SHOWER_NIGHT: {emoji: '🌨', name: 'Hail shower (night)'},
    HEAVY_RAIN: {emoji: '🌧', name: 'Heavy rain'},
    HEAVY_RAIN_SHOWER_DAY: {emoji: '🌧', name: 'Heavy rain shower (day)'},
    HEAVY_RAIN_SHOWER_NIGHT: {emoji: '🌧', name: 'Heavy rain shower (night)'},
    HEAVY_SNOW: {emoji: '🌨', name: 'Heavy snow'},
    HEAVY_SNOW_SHOWER_DAY: {emoji: '🌨', name: 'Heavy snow shower (day)'},
    HEAVY_SNOW_SHOWER_NIGHT: {emoji: '🌨', name: 'Heavy snow shower (night)'},
    LIGHT_RAIN: {emoji: '🌦', name: 'Light rain'},
    LIGHT_RAIN_SHOWER_DAY: {emoji: '🌦', name: 'Light rain shower (day)'},
    LIGHT_RAIN_SHOWER_NIGHT: {emoji: '🌧', name: 'Light rain shower (night)'},
    LIGHT_SNOW: {emoji: '🌨', name: 'Light snow'},
    LIGHT_SNOW_SHOWER_DAY: {emoji: '🌨️', name: 'Light snow shower (day)'},
    LIGHT_SNOW_SHOWER_NIGHT: {emoji: '🌨️', name: 'Light snow shower (night)'},
    MIST: {emoji: '🌫️', name: 'Mist'},
    OVERCAST: {emoji: '🌥', name: 'Overcast'},
    PARTLY_CLOUDY_DAY: {emoji: '☁️', name: 'Partly cloudy (day)'},
    PARTLY_CLOUDY_NIGHT: {emoji: '☁️', name: 'Partly cloudy (night)'},
    SLEET: {emoji: '🌨', name: 'Sleet'},
    SLEET_SHOWER_DAY: {emoji: '🌨️', name: 'Sleet shower (day)'},
    SLEET_SHOWER_NIGHT: {emoji: '🌨️', name: 'Sleet shower (night)'},
    SUNNY_DAY: {emoji: '☀️', name: 'Sunny day'},
    THUNDER: {emoji: '🌩', name: 'Thunder'},
    THUNDER_SHOWER_DAY: {emoji: '⛈️', name: 'Thunder shower (day)'},
    THUNDER_SHOWER_NIGHT: {emoji: '⛈️', name: 'Thunder shower (night)'},
    TRACE_RAIN: {emoji: '🌧', name: 'Trace rain'},
};
