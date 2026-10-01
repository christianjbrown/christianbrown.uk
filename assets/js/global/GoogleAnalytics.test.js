import { describe, it, expect, beforeEach } from 'vitest';

import GoogleAnalytics, { GTAG_SCRIPT_ID } from './GoogleAnalytics.js';

const NOW = Date.parse('2023-11-20T12:00:00Z');
const clock = { now: () => NOW };
const MEASUREMENT_ID = 'G-TEST123';

const tag = () => document.getElementById(GTAG_SCRIPT_ID);

beforeEach(() => {
    tag()?.remove();
    window.dataLayer = undefined;
});

describe('GoogleAnalytics', () => {
    it('queues the js and config commands, stamping the js command from the clock', () => {
        new GoogleAnalytics(window, document, clock, MEASUREMENT_ID).enable();

        const commands = window.dataLayer.map((args) => Array.from(args));
        expect(commands).toHaveLength(2);
        expect(commands[0][0]).toBe('js');
        expect(commands[0][1].getTime()).toBe(NOW);
        expect(commands[1]).toEqual(['config', MEASUREMENT_ID]);
    });

    it('keeps whatever was already on dataLayer', () => {
        window.dataLayer = ['existing'];

        new GoogleAnalytics(window, document, clock, MEASUREMENT_ID).enable();

        expect(window.dataLayer[0]).toBe('existing');
        expect(window.dataLayer).toHaveLength(3);
    });

    it('injects the tag as an async classic script', () => {
        new GoogleAnalytics(window, document, clock, MEASUREMENT_ID).enable();

        expect(tag().src).toBe(`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`);
        expect(tag().async).toBe(true);
        // gtag.js reads document.currentScript, which is null in a module.
        expect(tag().type).toBe('');
    });

    it('does not inject the tag twice', () => {
        const analytics = new GoogleAnalytics(window, document, clock, MEASUREMENT_ID);

        analytics.loadTag();
        analytics.loadTag();

        expect(document.querySelectorAll(`#${GTAG_SCRIPT_ID}`)).toHaveLength(1);
    });

    it('loads no tag when no measurement id is configured', () => {
        new GoogleAnalytics(window, document, clock, '').loadTag();

        expect(tag()).toBeNull();
    });

    it('url-encodes the measurement id', () => {
        new GoogleAnalytics(window, document, clock, 'G A').loadTag();

        expect(tag().src).toContain('id=G%20A');
    });
});
