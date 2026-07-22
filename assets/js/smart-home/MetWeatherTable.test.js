import { describe, it, expect, beforeEach } from 'vitest';
import MetWeatherTable from './MetWeatherTable.js';

// Wind figures use non-breaking spaces between coupled parts (number/unit,
// direction/degrees); normalise them to ordinary spaces so the expectations
// below stay readable. One test pins the non-breaking spaces explicitly.
const NBSP = String.fromCharCode(0xA0);
const stripNbsp = (text) => text.split(NBSP).join(String.fromCharCode(0x20));

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
            type_name: 'CLOUDY',
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
        // Both ends of this November window fall in GMT on the same day, so the
        // "TZ on date" suffix is shown once, after the second time, and the
        // source line ends with a full stop.
        expect(updateSpan.textContent).toMatch(/ and .* GMT on \w{3} \d+\w{2} \w{3}\.$/);
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
        expect(stripNbsp(table.textContent)).toContain('Northerly (350°) 24.1 km/h (40.2 km/h gusts)');
        expect(stripNbsp(table.textContent)).toContain('15 mph (25 mph gusts)');
    });

    it('adds the freshness on its own line beneath the source line when given the envelope timestamp', () => {
        const { updateSpan, subject } = make();
        subject._renderUpdate(
            { valid_from: 1_700_000_000, valid_to: 1_700_003_600, temp: 10, humidity: 50, precipitation: 0, wind_speed: 5 },
            Math.floor(Date.now() / 1000) - 120,
        );

        expect(updateSpan.textContent).toContain('Source: ');
        // The source line ends with a full stop; the freshness is a separate
        // block, so its text is not run together with the source line.
        expect(updateSpan.textContent).not.toContain('·');
        const freshness = updateSpan.querySelector('span.update-time__freshness');
        expect(freshness).not.toBeNull();
        expect(freshness.textContent).toMatch(/^Updated .* ago$/);
    });

    it('couples the direction, degrees and units with non-breaking spaces', () => {
        const { subject } = make();
        // Non-breaking between direction and degrees, and between each figure
        // and its unit; ordinary (breakable) space between speed and gusts.
        expect(subject._formatWindSpeed({ wind_direction: 'N', wind_direction_degrees: 350, wind_speed: 15, wind_gust: 25 }))
            .toBe(`Northerly${NBSP}(350°) 24.1${NBSP}km/h (40.2${NBSP}km/h gusts)`);
        expect(subject._formatWindSpeedMph({ wind_speed: 15, wind_gust: 25 }))
            .toBe(`15${NBSP}mph (25${NBSP}mph gusts)`);
    });

    it('renders a minimal forecast with plain wind and no optional rows', () => {
        const { table, updateSpan, subject } = make();
        subject._renderUpdate({ temp: 10, humidity: 80, precipitation: 20, wind_speed: 5 });

        expect(updateSpan.textContent).toBe('');
        expect(updateSpan.querySelector('a')).toBeNull();
        expect(table.textContent).not.toContain('feels like');
        expect(table.textContent).not.toContain('Weather type');
        // 5mph → 8km/h primary, mph kept as the muted line.
        expect(stripNbsp(table.textContent)).toContain('8 km/h');
        expect(stripNbsp(table.textContent)).toContain('5 mph');
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
        const windText = stripNbsp(table.textContent);
        expect(windText).toContain('5 mph');
        expect(windText).not.toContain('Easterly');
        expect(windText).not.toContain('gusts');
    });

    // The JSON contract marks `temp` as required and `temp_feels_like` as
    // non-empty, so these "Unknown" fallbacks are unreachable in production. The
    // "Unknown" string still reaches a Temperature, which now formats it through
    // Intl.NumberFormat and gets a harmless "NaN" rather than throwing (the old
    // `"Unknown".toFixed(...)` TypeError). These tests pin that (and keep branch
    // coverage honest).
    describe('unreachable "Unknown" fallbacks', () => {
        it('renders a NaN temperature rather than throwing when temperature is missing', () => {
            const { table, subject } = make();
            expect(() => subject._renderUpdate({ humidity: 80, precipitation: 20 })).not.toThrow();
            expect(table.textContent).toContain('NaN');
        });

        it('renders a NaN feels-like rather than throwing when temp_feels_like is present but null', () => {
            const { table, subject } = make();
            expect(() => subject._renderUpdate({ temp: 10, temp_feels_like: null })).not.toThrow();
            expect(table.textContent).toContain('NaN');
        });
    });

    it('renders its title spanning both columns, even without data (e.g. on API failure)', () => {
        const { table, subject } = make();
        subject._renderHeader();
        const headerCells = table.querySelector('tr').querySelectorAll('th');
        expect(headerCells).toHaveLength(1);
        expect(headerCells[0].colSpan).toBe(2);
        expect(headerCells[0].textContent).toContain('Outside weather forecast');
        expect(headerCells[0].querySelector('span.smart-home-table__value--title')).not.toBeNull();
    });

    it('renders Weather type before the temperature', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, type_name: 'CLOUDY', humidity: 50, precipitation: 0, wind_speed: 5 });
        const text = table.textContent;
        expect(text).toContain('Weather type');
        expect(text.indexOf('Weather type')).toBeLessThan(text.indexOf('Temperature'));
    });

    it('maps a known type_name token to its emoji and name', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, type_name: 'HEAVY_RAIN', humidity: 50, precipitation: 0, wind_speed: 5 });
        expect(table.textContent).toContain('Weather type');
        expect(table.textContent).toContain('🌧 Heavy rain');
    });

    it('omits the Weather type row for an unmapped type_name token', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, type_name: 'NOT_USED', humidity: 50, precipitation: 0, wind_speed: 5 });
        expect(table.textContent).not.toContain('Weather type');
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

    it('shows the UV index with a muted band description when present', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, humidity: 50, precipitation: 0, uv_index: 7, wind_speed: 5 });
        expect(table.textContent).toContain('UV index');
        expect(table.textContent).toContain('7');
        // UV 7 falls in the "high" band.
        expect(table.textContent).toContain('High');
    });

    it('shows visibility, switching to kilometres above a kilometre', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, humidity: 50, precipitation: 0, visibility: 12000, wind_speed: 5 });
        expect(table.textContent).toContain('Visibility');
        expect(stripNbsp(table.textContent)).toContain('12 km');
    });

    it('shows visibility in metres below a kilometre', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, humidity: 50, precipitation: 0, visibility: 800, wind_speed: 5 });
        expect(stripNbsp(table.textContent)).toContain('800 m');
    });

    it('omits the UV and visibility rows when their keys are absent', () => {
        const { table, subject } = make();
        subject._renderUpdate({ temp: 10, humidity: 50, precipitation: 0, wind_speed: 5 });
        expect(table.textContent).not.toContain('UV index');
        expect(table.textContent).not.toContain('Visibility');
    });

    it('shows the timezone on each time when the window spans a clock change', () => {
        const { updateSpan, subject } = make();
        // 00:30–01:30 UTC on 26 Oct 2025 straddles the BST→GMT fall-back, so the
        // two ends have different suffixes and each carries its own.
        const from = Date.parse('2025-10-26T00:30:00Z') / 1000;
        subject._renderUpdate({ valid_from: from, valid_to: from + 3600, temp: 10, humidity: 50, precipitation: 0, wind_speed: 5 });
        expect(updateSpan.textContent).toContain('BST on Sun 26th Oct and');
        expect(updateSpan.textContent).toContain('GMT on Sun 26th Oct');
    });

    describe('_formatWindSpeed', () => {
        it('prefixes a friendly compass name and omits speed when absent', () => {
            const { subject } = make();
            expect(subject._formatWindSpeed({ wind_direction: 'N' })).toBe(`Northerly${String.fromCharCode(0x20)}`);
        });

        it('converts mph to km/h with direction and gusts', () => {
            const { subject } = make();
            expect(stripNbsp(subject._formatWindSpeed({ wind_direction: 'N', wind_speed: 15, wind_gust: 25 })))
                .toBe('Northerly 24.1 km/h (40.2 km/h gusts)');
        });

        it('includes the direction in degrees when available', () => {
            const { subject } = make();
            expect(stripNbsp(subject._formatWindSpeed({ wind_direction: 'ESE', wind_direction_degrees: 112.5, wind_speed: 15 })))
                .toBe('East south easterly (112.5°) 24.1 km/h');
        });
    });

    describe('_formatWindSpeedMph', () => {
        it('keeps mph with gusts but no direction', () => {
            const { subject } = make();
            expect(stripNbsp(subject._formatWindSpeedMph({ wind_direction: 'N', wind_speed: 15, wind_gust: 25 })))
                .toBe('15 mph (25 mph gusts)');
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
