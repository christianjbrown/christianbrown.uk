import { describe, it, expect } from 'vitest';
import ClimateSummary from './ClimateSummary.js';

describe('ClimateSummary', () => {
    it('reports warmer inside and more humid inside', () => {
        expect(new ClimateSummary(26.6, 52.8, 25, 42.6).format())
            .toBe("It's 1.6°c warmer inside (26.6°c inside, 25°c outside), and 10.2% more humid (52.8% inside, 42.6% outside).");
    });

    it('reports cooler inside but less humid inside', () => {
        expect(new ClimateSummary(18, 40, 21, 55).format())
            .toBe("It's 3°c cooler inside (18°c inside, 21°c outside), but 15% less humid (40% inside, 55% outside).");
    });

    it('collapses matching temperatures and humidities', () => {
        expect(new ClimateSummary(26, 53, 26, 53).format())
            .toBe("It's 26°c inside and outside, and it's 53% humidity inside and outside.");
    });

    // With no "warmer/cooler inside" clause to frame the comparison, the
    // humidity clause names the side itself: "more humid inside". Equal temps
    // aren't a welcome temperature, and more humid inside isn't welcome either
    // — both unwelcome, no contrast -> "and".
    it('names the side when temperatures match but humidity differs', () => {
        expect(new ClimateSummary(26.3, 40, 26.3, 35.2).format())
            .toBe("It's 26.3°c inside and outside, and 4.8% more humid inside (40% inside, 35.2% outside).");
    });

    // Equal temps aren't welcome, but less humid inside is — a contrast -> "but".
    it('names the side when temperatures match but it is less humid inside', () => {
        expect(new ClimateSummary(26.3, 35.2, 26.3, 40).format())
            .toBe("It's 26.3°c inside and outside, but 4.8% less humid inside (35.2% inside, 40% outside).");
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
        // "but" marks a contrast: exactly one reading is the welcome one.
        // Temperature is welcome only at the extremes — warmer inside when it's
        // cold out (<18°c), or cooler inside when it's hot out (>25°c). Humidity
        // is welcome when it's less humid inside. Both welcome, or neither -> and.

        // Welcome temp (cooler when hot out) + unwelcome humidity (more) -> but.
        it('uses "but" when it is hot out, cooler inside, but more humid inside', () => {
            expect(new ClimateSummary(27, 60, 30, 50).format())
                .toBe("It's 3°c cooler inside (27°c inside, 30°c outside), but 10% more humid (60% inside, 50% outside).");
        });

        // Welcome temp (warmer when cold out) + unwelcome humidity (more) -> but.
        it('uses "but" when it is cold out, warmer inside, but more humid inside', () => {
            expect(new ClimateSummary(20, 60, 15, 50).format())
                .toBe("It's 5°c warmer inside (20°c inside, 15°c outside), but 10% more humid (60% inside, 50% outside).");
        });

        // Unwelcome temp (warmer on a mild day) + welcome humidity (less) -> but.
        it('uses "but" when warmer inside on a mild day but less humid inside', () => {
            expect(new ClimateSummary(24.6, 34.9, 23.6, 43).format())
                .toBe("It's 1°c warmer inside (24.6°c inside, 23.6°c outside), but 8.1% less humid (34.9% inside, 43% outside).");
        });

        // Both welcome: cooler when hot out AND less humid inside -> no contrast -> and.
        it('uses "and" when cooler inside and also less humid inside', () => {
            expect(new ClimateSummary(27, 40, 30, 50).format())
                .toBe("It's 3°c cooler inside (27°c inside, 30°c outside), and 10% less humid (40% inside, 50% outside).");
        });

        // Neither welcome: warmer on a mild day AND more humid inside -> and.
        it('uses "and" when warmer inside on a mild day and also more humid inside', () => {
            expect(new ClimateSummary(24, 60, 22, 50).format())
                .toBe("It's 2°c warmer inside (24°c inside, 22°c outside), and 10% more humid (60% inside, 50% outside).");
        });

        // The mild-day neutral band: cooler inside but not hot out isn't a
        // welcome temperature, so more humid inside doesn't contrast -> and.
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
