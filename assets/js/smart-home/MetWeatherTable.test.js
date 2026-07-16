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
            wind_direction_degrees: 350,
            wind_gust: 25,
        });

        const metOfficeLink = updateSpan.querySelector('a');
        expect(metOfficeLink).not.toBeNull();
        expect(metOfficeLink.textContent).toBe('Met Office');
        expect(metOfficeLink.getAttribute('href')).toBe('https://www.metoffice.gov.uk/');
        expect(metOfficeLink.target).toBe('_blank');
        expect(updateSpan.textContent).toContain('Source: ');
        expect(updateSpan.textContent).toContain('forecast for between');
        // Both ends of this November window fall in GMT, so the timezone is
        // shown once, after the second time.
        expect(updateSpan.textContent).toMatch(/ and .* GMT$/);
        expect(table.textContent).toContain('🌡️ Temperature');
        expect(table.textContent).toContain('Temperature feels like');
        expect(table.textContent).toContain('Weather type');
        expect(table.textContent).toContain('☁️ Cloudy');
        expect(table.textContent).toContain('💧 Humidity');
        expect(table.textContent).toContain('80%');
        // Humidity of 80% reads as "Miserable".
        expect(table.textContent).toContain('Miserable');
        expect(table.textContent).toContain('20%');
        // 15mph → 24.1km/h, 25mph gust → 40.2km/h; direction carries its degrees;
        // mph kept as the muted line without the direction.
        expect(table.textContent).toContain('Northerly (350°) 24.1km/h (40.2km/h gusts)');
        expect(table.textContent).toContain('15mph (25mph gusts)');
    });

    it('renders a minimal forecast with plain wind and no optional rows', () => {
        const { table, updateSpan, subject } = make();
        subject._renderUpdate({ temp: 10, humidity: 80, precipitation: 20, wind_speed: 5 });

        expect(updateSpan.textContent).toBe('');
        expect(updateSpan.querySelector('a')).toBeNull();
        expect(table.textContent).not.toContain('feels like');
        expect(table.textContent).not.toContain('Weather type');
        // 5mph → 8km/h primary, mph kept as the muted line.
        expect(table.textContent).toContain('8km/h');
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

    it('opens with a blank header row so it lines up with the inside table', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, humidity: 50, precipitation: 0, wind_speed: 5 });
        const firstRow = table.querySelector('tr');
        const headerCells = firstRow.querySelectorAll('th');
        expect(headerCells).toHaveLength(2);
        expect(firstRow.textContent).toBe('');
    });

    it('renders Weather type before the temperature', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, type_string: 'Cloudy', type_emoji: '☁️', humidity: 50, precipitation: 0, wind_speed: 5 });
        const text = table.textContent;
        expect(text).toContain('Weather type');
        expect(text.indexOf('Weather type')).toBeLessThan(text.indexOf('Temperature'));
    });

    it('shows a muted humidity description under the value', () => {
        const cases = [
            [40, 'Dry'], [52, 'Pleasant'], [58, 'Comfortable'], [63, 'Sticky'],
            [68, 'Uncomfortable'], [73, 'Oppressive'], [90, 'Miserable'],
        ];
        for (const [humidity, label] of cases) {
            const { table, subject } = make();
            subject._renderUpdate({ temp: 10, humidity, precipitation: 0, wind_speed: 5 });
            expect(table.textContent).toContain(label);
        }
    });

    it('shows the timezone on each time when the window spans a clock change', () => {
        const { updateSpan, subject } = make();
        // 00:30–01:30 UTC on 26 Oct 2025 straddles the BST→GMT fall-back.
        const from = Date.parse('2025-10-26T00:30:00Z') / 1000;
        subject._renderUpdate({ valid_from: from, valid_to: from + 3600, temp: 10, humidity: 50, precipitation: 0, wind_speed: 5 });
        expect(updateSpan.textContent).toContain('BST and');
        expect(updateSpan.textContent).toContain('GMT');
    });

    describe('_formatWindSpeed', () => {
        it('prefixes a friendly compass name and omits speed when absent', () => {
            const { subject } = make();
            expect(subject._formatWindSpeed({ wind_direction: 'N' })).toBe('Northerly ');
        });

        it('converts mph to km/h with direction and gusts', () => {
            const { subject } = make();
            expect(subject._formatWindSpeed({ wind_direction: 'N', wind_speed: 15, wind_gust: 25 }))
                .toBe('Northerly 24.1km/h (40.2km/h gusts)');
        });

        it('includes the direction in degrees when available', () => {
            const { subject } = make();
            expect(subject._formatWindSpeed({ wind_direction: 'ESE', wind_direction_degrees: 112.5, wind_speed: 15 }))
                .toBe('East south easterly (112.5°) 24.1km/h');
        });
    });

    describe('_formatWindSpeedMph', () => {
        it('keeps mph with gusts but no direction', () => {
            const { subject } = make();
            expect(subject._formatWindSpeedMph({ wind_direction: 'N', wind_speed: 15, wind_gust: 25 }))
                .toBe('15mph (25mph gusts)');
        });

        it('returns an empty string when there is no wind speed', () => {
            const { subject } = make();
            expect(subject._formatWindSpeedMph({})).toBe('');
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
