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
 * Keys are the enum names; each maps to its emoji. The display name is a
 * separate, per-locale lookup keyed by this same enum name (see each
 * catalogue's `weatherTypeNames`) — the emoji stays locale-independent, so it
 * lives here. NOT_USED (Met Office code 4) has no display mapping and is
 * deliberately absent — an unmapped token is skipped by the caller, so no
 * "Weather type" row is shown for it.
 */
export const WEATHER_TYPES = {
    CLEAR_NIGHT: {emoji: '🌙'},
    CLOUDY: {emoji: '☁️'},
    DRIZZLE: {emoji: '🌧️'},
    FOG: {emoji: '🌫️'},
    HAIL: {emoji: '🌨'},
    HAIL_SHOWER_DAY: {emoji: '🌨'},
    HAIL_SHOWER_NIGHT: {emoji: '🌨'},
    HEAVY_RAIN: {emoji: '🌧'},
    HEAVY_RAIN_SHOWER_DAY: {emoji: '🌧'},
    HEAVY_RAIN_SHOWER_NIGHT: {emoji: '🌧'},
    HEAVY_SNOW: {emoji: '🌨'},
    HEAVY_SNOW_SHOWER_DAY: {emoji: '🌨'},
    HEAVY_SNOW_SHOWER_NIGHT: {emoji: '🌨'},
    LIGHT_RAIN: {emoji: '🌦'},
    LIGHT_RAIN_SHOWER_DAY: {emoji: '🌦'},
    LIGHT_RAIN_SHOWER_NIGHT: {emoji: '🌧'},
    LIGHT_SNOW: {emoji: '🌨'},
    LIGHT_SNOW_SHOWER_DAY: {emoji: '🌨️'},
    LIGHT_SNOW_SHOWER_NIGHT: {emoji: '🌨️'},
    MIST: {emoji: '🌫️'},
    OVERCAST: {emoji: '🌥'},
    PARTLY_CLOUDY_DAY: {emoji: '☁️'},
    PARTLY_CLOUDY_NIGHT: {emoji: '☁️'},
    SLEET: {emoji: '🌨'},
    SLEET_SHOWER_DAY: {emoji: '🌨️'},
    SLEET_SHOWER_NIGHT: {emoji: '🌨️'},
    SUNNY_DAY: {emoji: '☀️'},
    THUNDER: {emoji: '🌩'},
    THUNDER_SHOWER_DAY: {emoji: '⛈️'},
    THUNDER_SHOWER_NIGHT: {emoji: '⛈️'},
    TRACE_RAIN: {emoji: '🌧'},
};
