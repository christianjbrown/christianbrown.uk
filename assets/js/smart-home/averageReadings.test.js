import { describe, it, expect } from 'vitest';
import averageReadings, { averageTemperature, averageHumidity } from './averageReadings.js';

describe('averageReadings', () => {
    it('averages the fresh readings and takes the earliest timestamp', () => {
        expect(averageReadings([
            { value: 20, stale: false, timestamp: 300 },
            { value: 22, stale: false, timestamp: 100 },
            { value: 99, stale: true, timestamp: 50 }, // ignored while fresh readings exist
        ])).toEqual({ value: 21, stale: false, timestamp: 100 });
    });

    it('falls back to the stale readings, marked stale, when none are fresh', () => {
        expect(averageReadings([
            { value: 20, stale: true, timestamp: 300 },
            { value: 24, stale: true, timestamp: 100 },
        ])).toEqual({ value: 22, stale: true, timestamp: 100 });
    });

    it('ignores non-numeric values', () => {
        expect(averageReadings([
            { value: null, stale: false, timestamp: 100 },
            { value: 20, stale: false, timestamp: 200 },
        ])).toEqual({ value: 20, stale: false, timestamp: 200 });
    });

    it('returns null when there is no numeric reading', () => {
        expect(averageReadings([{ value: null, stale: false, timestamp: 1 }])).toBeNull();
        expect(averageReadings([])).toBeNull();
    });

    it('returns a null timestamp when none of the contributors carry one', () => {
        expect(averageReadings([{ value: 20, stale: false, timestamp: undefined }]))
            .toEqual({ value: 20, stale: false, timestamp: null });
    });

    describe('averageTemperature / averageHumidity', () => {
        const devices = [
            { temperatureValue: 20, temperatureStale: false, temperatureTimestamp: 100, humidityValue: 50, humidityStale: false, humidityTimestamp: 90 },
            { temperatureValue: 24, temperatureStale: false, temperatureTimestamp: 200, humidityValue: 60, humidityStale: true, humidityTimestamp: 80 },
        ];

        it('reads the temperature fields off each device', () => {
            expect(averageTemperature(devices)).toEqual({ value: 22, stale: false, timestamp: 100 });
        });

        it('reads the humidity fields off each device', () => {
            // The second device's humidity is stale, so only the first (fresh) contributes.
            expect(averageHumidity(devices)).toEqual({ value: 50, stale: false, timestamp: 90 });
        });
    });
});
