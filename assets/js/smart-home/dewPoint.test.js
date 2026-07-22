import { describe, it, expect } from 'vitest';
import { dewPoint } from './dewPoint.js';

describe('dewPoint', () => {
    it.each([
        [20, 50, 9.26],
        [25, 60, 16.70],
        [15, 80, 11.58],
        [30, 40, 14.93],
    ])('computes the dew point of %i°C / %i%% RH as ~%f°C', (tempC, rh, expected) => {
        expect(dewPoint(tempC, rh)).toBeCloseTo(expected, 1);
    });

    it('equals the air temperature at 100% humidity', () => {
        expect(dewPoint(18, 100)).toBeCloseTo(18, 5);
    });

    it('falls as the air gets drier at a fixed temperature', () => {
        expect(dewPoint(22, 70)).toBeGreaterThan(dewPoint(22, 40));
    });
});
