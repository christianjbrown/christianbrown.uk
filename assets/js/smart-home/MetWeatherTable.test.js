import { describe, it, expect, beforeEach } from 'vitest';
import MetWeatherTable from './MetWeatherTable.js';

function make() {
    const table = document.createElement('table');
    const updateSpan = document.createElement('span');
    document.body.append(table, updateSpan);
    return { table, updateSpan, subject: new MetWeatherTable(table, updateSpan, 'url') };
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('MetWeatherTable', () => {
    it('renders a full forecast: date span, feels-like, type and gusty wind', () => {
        const { table, updateSpan, subject } = make();
        subject._renderUpdate({
            valid_from: 1_700_000_000,
            valid_to: 1_700_003_600,
            temp: 10,
            temp_feels_like: 8,
            type_string: 'Cloudy',
            type_emoji: '☁️',
            humidity: 80,
            precipitation: 20,
            wind_speed: 15,
            wind_direction: 'N',
            wind_gust: 25,
        });

        expect(updateSpan.innerHTML).toContain('Met Office');
        expect(updateSpan.innerHTML).toContain('forecast for between');
        expect(table.textContent).toContain('Temperature feels like');
        expect(table.textContent).toContain('☁️ Cloudy');
        expect(table.textContent).toContain('80%');
        expect(table.textContent).toContain('20%');
        expect(table.textContent).toContain('Northerly 15mph (25mph gusts)');
    });

    it('renders a minimal forecast with plain wind and no optional rows', () => {
        const { table, updateSpan, subject } = make();
        subject._renderUpdate({ temp: 10, humidity: 80, precipitation: 20, wind_speed: 5 });

        expect(updateSpan.innerHTML).toBe('');
        expect(table.textContent).not.toContain('feels like');
        expect(table.textContent).not.toContain('Type');
        expect(table.textContent).toContain('5mph');
        expect(table.textContent).not.toContain('gusts');
    });

    it('falls back to "Unknown" for missing humidity and precipitation and omits wind', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10 });

        expect(table.textContent).toContain('Humidity');
        expect(table.textContent).toContain('Chance of precipitation');
        expect(table.textContent.match(/Unknown/g)).toHaveLength(2);
        expect(table.textContent).not.toContain('mph');
    });

    it('omits the feels-like row when it equals the temperature', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, temp_feels_like: 10, humidity: 50, precipitation: 0, wind_speed: 5 });
        expect(table.textContent).not.toContain('feels like');
    });

    it('ignores an unknown wind direction and zero gusts', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, humidity: 50, precipitation: 0, wind_speed: 5, wind_direction: 'XX', wind_gust: 0 });
        const windText = table.textContent;
        expect(windText).toContain('5mph');
        expect(windText).not.toContain('Easterly');
        expect(windText).not.toContain('gusts');
    });

    // The JSON contract marks `temp` as required and `temp_feels_like` as
    // non-empty, so these "Unknown" fallbacks are unreachable in production.
    // They are also latent bugs: passing the string "Unknown" into a Temperature
    // makes it call `"Unknown".toFixed(...)`, which throws. These tests pin that
    // current behaviour (and keep branch coverage honest).
    describe('unreachable "Unknown" fallbacks (latent bugs)', () => {
        it('throws when temperature is missing', () => {
            const { subject } = make();
            expect(() => subject._renderUpdate({ humidity: 80, precipitation: 20 })).toThrow(TypeError);
        });

        it('throws when temp_feels_like is present but null', () => {
            const { subject } = make();
            expect(() => subject._renderUpdate({ temp: 10, temp_feels_like: null })).toThrow(TypeError);
        });
    });

    describe('_formatWindSpeed', () => {
        it('prefixes a friendly compass name and omits speed when absent', () => {
            const { subject } = make();
            expect(subject._formatWindSpeed({ wind_direction: 'N' })).toBe('Northerly ');
        });
    });

    describe('_getContract', () => {
        it('returns the weather contract', () => {
            const { subject } = make();
            expect(subject._getContract()).toHaveProperty('humidity');
            expect(subject._getContract()).toHaveProperty('wind_speed');
        });
    });
});
