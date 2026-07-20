import { describe, it, expect } from 'vitest';
import ClimateSummary from './ClimateSummary.js';

describe('ClimateSummary', () => {
    it('reports warmer inside and more humid inside', () => {
        expect(new ClimateSummary(26.6, 52.8, 25, 42.6).format())
            .toBe("It's 1.6°c warmer inside (26.6°c inside, 25°c outside), and 10.2% more humid (52.8% inside, 42.6% outside).");
    });

    it('reports cooler inside and less humid inside', () => {
        expect(new ClimateSummary(18, 40, 21, 55).format())
            .toBe("It's 3°c cooler inside (18°c inside, 21°c outside), and 15% less humid (40% inside, 55% outside).");
    });

    it('collapses matching temperatures and humidities', () => {
        expect(new ClimateSummary(26, 53, 26, 53).format())
            .toBe("It's 26°c inside and outside, and it's 53% humidity inside and outside.");
    });

    // With no "warmer/cooler inside" clause to frame the comparison, the
    // humidity clause names the side itself: "more humid inside".
    it('names the side when temperatures match but humidity differs', () => {
        expect(new ClimateSummary(24, 40, 24, 35.2).format())
            .toBe("It's 24°c inside and outside, and 4.8% more humid inside (40% inside, 35.2% outside).");
    });

    it('names the side when temperatures match and it is less humid inside', () => {
        expect(new ClimateSummary(24, 35.2, 24, 40).format())
            .toBe("It's 24°c inside and outside, and 4.8% less humid inside (35.2% inside, 40% outside).");
    });

    it('treats values that round to the same display as matching', () => {
        expect(new ClimateSummary(26.01, 53.02, 26.04, 53.01).format())
            .toBe("It's 26°c inside and outside, and it's 53% humidity inside and outside.");
    });

    it('omits the humidity clause when inside humidity is absent', () => {
        expect(new ClimateSummary(26.6, null, 25, 42.6).format())
            .toBe("It's 1.6°c warmer inside (26.6°c inside, 25°c outside).");
    });

    it('omits the humidity clause when outside humidity is absent', () => {
        expect(new ClimateSummary(26.6, 52.8, 25, null).format())
            .toBe("It's 1.6°c warmer inside (26.6°c inside, 25°c outside).");
    });

    describe('conjunction between the clauses', () => {
        // "but" marks a contrast, and only on a cold (<18°c) or hot (>25°c) day
        // — a mild day in between is always "and". When cold or hot, the
        // temperature has a stance (warmer inside welcome in the cold, cooler
        // inside welcome in the heat); humidity is welcome when less humid
        // inside. "but" when exactly one is welcome.

        // Hot out, cooler inside (welcome) + more humid inside (unwelcome) -> but.
        it('uses "but" when it is hot out, cooler inside, but more humid inside', () => {
            expect(new ClimateSummary(27, 60, 30, 50).format())
                .toBe("It's 3°c cooler inside (27°c inside, 30°c outside), but 10% more humid (60% inside, 50% outside).");
        });

        // Cold out, warmer inside (welcome) + more humid inside (unwelcome) -> but.
        it('uses "but" when it is cold out, warmer inside, but more humid inside', () => {
            expect(new ClimateSummary(20, 60, 15, 50).format())
                .toBe("It's 5°c warmer inside (20°c inside, 15°c outside), but 10% more humid (60% inside, 50% outside).");
        });

        // Hot out, warmer inside (unwelcome) + less humid inside (welcome) -> but.
        // Proves the contrast holds both ways once outside the mild band.
        it('uses "but" when it is hot out, warmer inside, but less humid inside', () => {
            expect(new ClimateSummary(32, 40, 30, 55).format())
                .toBe("It's 2°c warmer inside (32°c inside, 30°c outside), but 15% less humid (40% inside, 55% outside).");
        });

        // A mild day is always "and", even when the humidity would otherwise
        // contrast (here warmer inside + less humid inside).
        it('uses "and" on a mild day even when the humidity would contrast', () => {
            expect(new ClimateSummary(24.6, 34.9, 23.6, 43).format())
                .toBe("It's 1°c warmer inside (24.6°c inside, 23.6°c outside), and 8.1% less humid (34.9% inside, 43% outside).");
        });

        // Both welcome: cooler when hot out AND less humid inside -> no contrast -> and.
        it('uses "and" when cooler inside and also less humid inside', () => {
            expect(new ClimateSummary(27, 40, 30, 50).format())
                .toBe("It's 3°c cooler inside (27°c inside, 30°c outside), and 10% less humid (40% inside, 50% outside).");
        });

        // Mild day, cooler inside, more humid inside -> "and".
        it('uses "and" when cooler inside on a mild day and more humid inside', () => {
            expect(new ClimateSummary(23.6, 43, 24.6, 34.9).format())
                .toBe("It's 1°c cooler inside (23.6°c inside, 24.6°c outside), and 8.1% more humid (43% inside, 34.9% outside).");
        });

        // Matching humidity has no contrast to draw, even with a welcome temp -> and.
        it('uses "and" when humidity matches even if the temperature is welcome', () => {
            expect(new ClimateSummary(27, 50, 30, 50).format())
                .toBe("It's 3°c cooler inside (27°c inside, 30°c outside), and it's 50% humidity inside and outside.");
        });
    });
});
