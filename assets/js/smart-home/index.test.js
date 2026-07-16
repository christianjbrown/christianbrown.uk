import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
    CLOCK_SPAN_SELECTOR,
    CLIMATE_SUMMARY_SELECTOR,
    HOME_TEMP_TABLE_SELECTOR,
    HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
    WEATHER_TABLE_SELECTOR,
    WEATHER_TABLE_UPDATE_TIME_SELECTOR,
} from './index.const.js';

const { ctor, runAll, setupSchedule } = vi.hoisted(() => ({
    ctor: vi.fn(),
    runAll: vi.fn(() => Promise.resolve()),
    setupSchedule: vi.fn(),
}));

vi.mock('./SmartHomePage.js', () => ({
    default: class {
        constructor(...args) {
            ctor(...args);
        }

        runAll() {
            return runAll();
        }

        setupSchedule() {
            return setupSchedule();
        }
    },
}));

describe('smart-home/index.js', () => {
    beforeAll(async () => {
        await import('./index.js');
    });

    it('wires up the SmartHomePage on window load', () => {
        window.dispatchEvent(new Event('load'));

        expect(ctor).toHaveBeenCalledWith(
            CLOCK_SPAN_SELECTOR,
            CLIMATE_SUMMARY_SELECTOR,
            HOME_TEMP_TABLE_SELECTOR,
            HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
            WEATHER_TABLE_SELECTOR,
            WEATHER_TABLE_UPDATE_TIME_SELECTOR,
        );
        expect(runAll).toHaveBeenCalledTimes(1);
        expect(setupSchedule).toHaveBeenCalledTimes(1);
    });
});
