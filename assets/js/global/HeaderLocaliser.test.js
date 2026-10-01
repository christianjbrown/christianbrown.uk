import { describe, it, expect, beforeEach, vi } from 'vitest';

import HeaderLocaliser from './HeaderLocaliser.js';
import EN_GB from '../i18n/messages.en-GB.js';
import DE_DE from '../i18n/messages.de-DE.js';

let themeToggle;
let localiser;

beforeEach(() => {
    document.body.innerHTML = `
        <button id="theme-toggle" title="Switch colour theme" hidden></button>
        <a class="header-home-link" title="Christian Brown homepage"></a>
        <div class="header-avatar"><img src="/avatar.jpg" alt="Christian Brown's avatar"></div>
        <img class="location-icon" alt="Location icon">
        <strong id="header-job-title">Engineering Manager</strong>
        <span id="header-location" data-location="London, UK">London, UK</span>`;
    themeToggle = { bind: vi.fn() };
    localiser = new HeaderLocaliser(document, themeToggle, 'theme-toggle');
});

describe('HeaderLocaliser', () => {
    it('localises the header text, hover text and alt text', () => {
        localiser.localise(DE_DE);

        expect(document.getElementById('header-job-title').textContent).toBe(DE_DE.header.jobTitle);
        expect(document.querySelector('.header-home-link').getAttribute('title')).toBe(DE_DE.header.homeLinkTitle);
        expect(document.querySelector('.header-avatar img').getAttribute('alt')).toBe(DE_DE.header.avatarAlt);
        expect(document.querySelector('.location-icon').getAttribute('alt')).toBe(DE_DE.header.locationIconAlt);
    });

    it('titles the theme toggle and binds it with the locale strings', () => {
        localiser.localise(DE_DE);

        const toggle = document.getElementById('theme-toggle');
        expect(toggle.getAttribute('title')).toBe(DE_DE.theme.switchTitle);
        expect(themeToggle.bind).toHaveBeenCalledWith(toggle, DE_DE.theme);
    });

    it('keeps en-GB text as it was built', () => {
        localiser.localise(EN_GB);

        expect(document.getElementById('header-job-title').textContent).toBe('Engineering Manager');
        expect(document.getElementById('header-location').textContent).toBe('London, UK');
    });

    it('localises the rest of the header on a page without a location', () => {
        document.getElementById('header-location').remove();

        localiser.localise(DE_DE);

        expect(document.getElementById('header-job-title').textContent).toBe(DE_DE.header.jobTitle);
        expect(document.getElementById('header-location')).toBeNull();
    });
});
