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
        it('maps the three temperature series and the x axis, earliest first', () => {
            const buckets = [
                { date: '2026-07-19', insideMaxTemp: 24.1, insideMinTemp: 19.3, outsideMaxTemp: 22.6 },
                { date: '2026-07-20', insideMaxTemp: 25.0, insideMinTemp: 20.1, outsideMaxTemp: 23.4 },
            ];

            expect(bucketsToSeries(buckets)).toEqual({
                x: [Date.UTC(2026, 6, 19) / 1000, Date.UTC(2026, 6, 20) / 1000],
                insideMax: [24.1, 25.0],
                insideMin: [19.3, 20.1],
                outsideMax: [22.6, 23.4],
            });
        });

        it('turns a missing side (null) into a gap', () => {
            const buckets = [
                { date: '2026-07-20', insideMaxTemp: 25.0, insideMinTemp: 20.1, outsideMaxTemp: null },
            ];

            const series = bucketsToSeries(buckets);
            expect(series.outsideMax).toEqual([null]);
            expect(series.insideMax).toEqual([25.0]);
        });

        it('returns empty columns for no buckets', () => {
            expect(bucketsToSeries([])).toEqual({ x: [], insideMax: [], insideMin: [], outsideMax: [] });
        });
    });
});
