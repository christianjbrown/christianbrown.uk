import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
    STATUS_LINE_SELECTOR,
    ROOMS_SECTION_SELECTOR,
    HOME_TEMP_TABLE_SELECTOR,
    HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
    WEATHER_TABLE_SELECTOR,
    WEATHER_TABLE_UPDATE_TIME_SELECTOR,
} from './index.const.js';
import EN_GB from '../i18n/messages.en-GB.js';

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
        document.body.innerHTML = `
            <h2 id="smart-home-title">Smart home</h2>
            <h3 id="rooms-heading">📐 Rooms</h3>
            <h3 id="how-it-works-heading">🏗️ How it works</h3>
            <img class="floor-plan__image" alt="Floor plan of the house, with the temperature and humidity of each room">
            <img class="how-it-works" alt="Diagram showing how this page works">`;

        window.dispatchEvent(new Event('load'));

        // In jsdom (no ?locale, navigator.languages ≈ en-US) the locale resolves
        // to the en-GB default: the headings and image alts are localised (to
        // their en-GB text) and the en-GB catalogue is threaded through.
        expect(document.getElementById('smart-home-title').textContent).toBe('Smart home');
        expect(document.getElementById('rooms-heading').textContent).toBe('📐 Rooms');
        expect(document.getElementById('how-it-works-heading').textContent).toBe('🏗️ How it works');
        expect(document.querySelector('.floor-plan__image').getAttribute('alt')).toBe('Floor plan of the house, with the temperature and humidity of each room');
        expect(document.querySelector('.how-it-works').getAttribute('alt')).toBe('Diagram showing how this page works');
        expect(ctor).toHaveBeenCalledWith(
            STATUS_LINE_SELECTOR,
            ROOMS_SECTION_SELECTOR,
            HOME_TEMP_TABLE_SELECTOR,
            HOME_TEMP_TABLE_UPDATE_TIME_SELECTOR,
            WEATHER_TABLE_SELECTOR,
            WEATHER_TABLE_UPDATE_TIME_SELECTOR,
            EN_GB,
        );
        expect(runAll).toHaveBeenCalledTimes(1);
        expect(setupSchedule).toHaveBeenCalledTimes(1);
    });
});
