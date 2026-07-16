import { describe, it, expect } from 'vitest';
import ClimateSummary from './ClimateSummary.js';

describe('ClimateSummary', () => {
    it('reports warmer inside and more humid inside', () => {
        expect(new ClimateSummary(26.6, 52.8, 25, 42.6).format())
            .toBe("It's 1.6°c warmer inside (26.6°c inside, 25.0°c outside), and 10.2% more humid (52.8% inside, 42.6% outside).");
    });

    it('reports cooler inside and less humid inside', () => {
        expect(new ClimateSummary(18, 40, 21, 55).format())
            .toBe("It's 3.0°c cooler inside (18.0°c inside, 21.0°c outside), and 15.0% less humid (40.0% inside, 55.0% outside).");
    });

    it('collapses matching temperatures and humidities', () => {
        expect(new ClimateSummary(26, 53, 26, 53).format())
            .toBe("It's 26.0°c inside and outside, and it's 53.0% humidity inside and outside.");
    });

    it('treats values that round to the same display as matching', () => {
        expect(new ClimateSummary(26.01, 53.02, 26.04, 53.01).format())
            .toBe("It's 26.0°c inside and outside, and it's 53.0% humidity inside and outside.");
    });

    it('omits the humidity clause when inside humidity is absent', () => {
        expect(new ClimateSummary(26.6, null, 25, 42.6).format())
            .toBe("It's 1.6°c warmer inside (26.6°c inside, 25.0°c outside).");
    });

    it('omits the humidity clause when outside humidity is absent', () => {
        expect(new ClimateSummary(26.6, 52.8, 25, null).format())
            .toBe("It's 1.6°c warmer inside (26.6°c inside, 25.0°c outside).");
    });

    describe('conjunction between the clauses', () => {
        // Cooler inside while it's hot out (>25°c) is good, so more humid inside
        // (bad) contrasts -> "but".
        it('uses "but" when it is hot out, cooler inside, but more humid inside', () => {
            expect(new ClimateSummary(27, 60, 30, 50).format())
                .toBe("It's 3.0°c cooler inside (27.0°c inside, 30.0°c outside), but 10.0% more humid (60.0% inside, 50.0% outside).");
        });

        // Warmer inside while it's cold out (<18°c) is good, so more humid inside
        // (bad) contrasts -> "but".
        it('uses "but" when it is cold out, warmer inside, but more humid inside', () => {
            expect(new ClimateSummary(20, 60, 15, 50).format())
                .toBe("It's 5.0°c warmer inside (20.0°c inside, 15.0°c outside), but 10.0% more humid (60.0% inside, 50.0% outside).");
        });

        // Good temperature but less humid inside (also good) -> no contrast -> "and".
        it('uses "and" when the good temperature is paired with less humidity inside', () => {
            expect(new ClimateSummary(27, 40, 30, 50).format())
                .toBe("It's 3.0°c cooler inside (27.0°c inside, 30.0°c outside), and 10.0% less humid (40.0% inside, 50.0% outside).");
        });

        // More humid inside but the temperature isn't a "good" case -> "and".
        it('uses "and" when the temperature situation is not favourable', () => {
            expect(new ClimateSummary(24, 60, 22, 50).format())
                .toBe("It's 2.0°c warmer inside (24.0°c inside, 22.0°c outside), and 10.0% more humid (60.0% inside, 50.0% outside).");
        });
    });
});
