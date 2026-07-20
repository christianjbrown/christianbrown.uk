import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';

const { needsConsent, getConsent, setConsent, deleteAll } = vi.hoisted(() => ({
    needsConsent: vi.fn(),
    getConsent: vi.fn(),
    setConsent: vi.fn(),
    deleteAll: vi.fn(),
}));

vi.mock('./Cookie.js', () => ({
    // get/set are used by Locale.js (locale cookie); stubbed so global.js's
    // import-time locale resolution finds no cookie and writes none.
    default: { needsConsent, getConsent, setConsent, deleteAll, get: () => null, set: () => {} },
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

let cookiesDiv;
let acceptButton;
let declineButton;

describe('global.js', () => {
    beforeAll(async () => {
        document.body.innerHTML = `
            <div id="cookies"></div>
            <button id="cookies-accept"></button>
            <button id="cookies-decline"></button>
            <button id="theme-toggle" title="Switch colour theme" hidden></button>
            <a class="header-home-link" title="Christian Brown homepage"></a>
            <div class="header-avatar"><img src="/avatar.jpg" alt="Christian Brown's avatar"></div>
            <img class="location-icon" alt="Location icon">
            <strong id="header-job-title">Engineering Manager</strong>
            <span id="header-location">London, UK</span>`;
        cookiesDiv = document.getElementById('cookies');
        acceptButton = document.getElementById('cookies-accept');
        declineButton = document.getElementById('cookies-decline');
        vi.spyOn(console, 'log').mockImplementation(() => {});
        // DOM is in place, so the module's top-level lookups succeed.
        await import('./global.js');
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        needsConsent.mockReset();
        getConsent.mockReset();
        setConsent.mockReset();
        deleteAll.mockReset();
        cookiesDiv.style.display = '';
        window.dataLayer = undefined;
    });

    describe('shared header + theme localisation', () => {
        it('localises the header chrome and theme toggle on import (en-GB in jsdom)', () => {
            expect(document.getElementById('header-job-title').textContent).toBe('Engineering Manager');
            expect(document.getElementById('header-location').textContent).toBe('London, UK');
            expect(document.documentElement.lang).toBe('en-GB');
            // Hover/accessibility text.
            expect(document.querySelector('.header-home-link').getAttribute('title')).toBe('Christian Brown homepage');
            expect(document.querySelector('.header-avatar img').getAttribute('alt')).toBe("Christian Brown's avatar");
            expect(document.querySelector('.location-icon').getAttribute('alt')).toBe('Location icon');
            // Theme toggle: revealed, localised label and title.
            const toggle = document.getElementById('theme-toggle');
            expect(toggle.hidden).toBe(false);
            expect(toggle.textContent).toContain('Auto');
            expect(toggle.getAttribute('title')).toBe('Switch colour theme');
            expect(toggle.getAttribute('aria-label')).toContain('Colour theme');
        });
    });

    describe('cookie banner buttons', () => {
        it('accepting hides the banner, stores consent and enables analytics', () => {
            acceptButton.dispatchEvent(new Event('click'));

            expect(cookiesDiv.style.display).toBe('none');
            expect(setConsent).toHaveBeenCalledWith(true);
            expect(window.dataLayer).toHaveLength(2); // gtag('js', ...) + gtag('config', ...)
        });

        it('declining hides the banner, deletes cookies and records the refusal', () => {
            declineButton.dispatchEvent(new Event('click'));

            expect(cookiesDiv.style.display).toBe('none');
            expect(deleteAll).toHaveBeenCalledTimes(1);
            expect(setConsent).toHaveBeenCalledWith(false);
            expect(window.dataLayer).toBeUndefined(); // declining must not enable analytics
        });
    });

    describe('on window load', () => {
        it('shows the banner when consent is needed but undecided', async () => {
            needsConsent.mockResolvedValue(true);
            getConsent.mockReturnValue(null);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(cookiesDiv.style.display).toBe('flex');
            expect(window.dataLayer).toBeUndefined();
        });

        it('enables analytics when consent is needed and already granted', async () => {
            needsConsent.mockResolvedValue(true);
            getConsent.mockReturnValue(true);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(cookiesDiv.style.display).not.toBe('flex');
            expect(window.dataLayer).toHaveLength(2);
        });

        it('does nothing when consent is needed and previously declined', async () => {
            needsConsent.mockResolvedValue(true);
            getConsent.mockReturnValue(false);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(cookiesDiv.style.display).not.toBe('flex');
            expect(window.dataLayer).toBeUndefined();
        });

        it('enables analytics directly when consent is not required', async () => {
            needsConsent.mockResolvedValue(false);

            window.dispatchEvent(new Event('load'));
            await flush();

            expect(getConsent).not.toHaveBeenCalled();
            expect(window.dataLayer).toHaveLength(2);
        });
    });
});
