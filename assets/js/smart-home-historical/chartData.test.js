import { describe, it, expect } from 'vitest';
import { bucketToTimestamp, bucketsToSeries } from './chartData.js';

describe('chartData', () => {
    describe('bucketToTimestamp', () => {
        it('anchors a daily bucket at 00:00 UTC', () => {
            expect(bucketToTimestamp({ date: '2026-07-20' })).toBe(Date.UTC(2026, 6, 20, 0) / 1000);
        });

        it('uses the hour for an hourly bucket', () => {
            expect(bucketToTimestamp({ date: '2026-07-20', hour: 14 })).toBe(Date.UTC(2026, 6, 20, 14) / 1000);
        });

        it('treats hour 0 as midnight (not as a missing hour)', () => {
            expect(bucketToTimestamp({ date: '2026-07-20', hour: 0 })).toBe(Date.UTC(2026, 6, 20, 0) / 1000);
        });
    });

    describe('bucketsToSeries', () => {
        it('maps the temperature and humidity trios and the x axis, earliest first', () => {
            const buckets = [
                {
                    date: '2026-07-19',
                    insideMaxTemp: 24.1, insideMinTemp: 19.3, outsideMaxTemp: 22.6,
                    insideMaxHumidity: 58, insideMinHumidity: 41, outsideMaxHumidity: 73,
                },
                {
                    date: '2026-07-20',
                    insideMaxTemp: 25.0, insideMinTemp: 20.1, outsideMaxTemp: 23.4,
                    insideMaxHumidity: 60, insideMinHumidity: 44, outsideMaxHumidity: 68,
                },
            ];

            expect(bucketsToSeries(buckets)).toEqual({
                x: [Date.UTC(2026, 6, 19) / 1000, Date.UTC(2026, 6, 20) / 1000],
                temp: {
                    outside: [22.6, 23.4],
                    insideMin: [19.3, 20.1],
                    insideMax: [24.1, 25.0],
                },
                humidity: {
                    outside: [73, 68],
                    insideMin: [41, 44],
                    insideMax: [58, 60],
                },
            });
        });

        it('turns a missing side (null) into a gap, per metric', () => {
            const buckets = [
                {
                    date: '2026-07-20',
                    insideMaxTemp: 25.0, insideMinTemp: 20.1, outsideMaxTemp: null,
                    insideMaxHumidity: 60, insideMinHumidity: 44, outsideMaxHumidity: null,
                },
            ];

            const series = bucketsToSeries(buckets);
            expect(series.temp.outside).toEqual([null]);
            expect(series.temp.insideMax).toEqual([25.0]);
            expect(series.humidity.outside).toEqual([null]);
            expect(series.humidity.insideMax).toEqual([60]);
        });

        it('returns empty columns for no buckets', () => {
            expect(bucketsToSeries([])).toEqual({
                x: [],
                temp: { outside: [], insideMin: [], insideMax: [] },
                humidity: { outside: [], insideMin: [], insideMax: [] },
            });
        });
    });
});
