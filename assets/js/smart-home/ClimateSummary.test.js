import { describe, it, expect } from 'vitest';
import ClimateSummary from './ClimateSummary.js';
import { dewPoint } from './dewPoint.js';

describe('ClimateSummary', () => {
    it('reports warmer inside and more humid inside', () => {
        expect(new ClimateSummary(26.6, 52.8, 25, 42.6).format())
            .toBe("It's 1.6°c warmer inside (26.6°c inside, 25°c outside), and 10.2% more humid (52.8% inside, 42.6% outside).");
    });

    // Mild day (21°c out), drier inside -> the drier inside is a welcome
    // contrast, so "but".
    it('reports cooler inside but less humid inside on a mild day', () => {
        expect(new ClimateSummary(18, 40, 21, 55).format())
            .toBe("It's 3°c cooler inside (18°c inside, 21°c outside), but 15% less humid (40% inside, 55% outside).");
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

    // Mild day, drier inside -> a welcome contrast, so "but".
    it('names the side when temperatures match but it is less humid inside', () => {
        expect(new ClimateSummary(24, 35.2, 24, 40).format())
            .toBe("It's 24°c inside and outside, but 4.8% less humid inside (35.2% inside, 40% outside).");
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
        // "but" marks a contrast. On a cold (<18°c) or hot (>25°c) day the
        // temperature has a stance (warmer inside welcome in the cold, cooler
        // inside welcome in the heat); humidity is welcome when less humid
        // inside; "but" when exactly one is welcome. On a mild day the
        // temperature takes no side, but a drier inside is still a welcome
        // contrast, so "but" when it's less humid inside, otherwise "and".

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

        // Mild day, drier inside -> "but" (the drier inside is a welcome
        // contrast even though the temperature takes no side).
        it('uses "but" on a mild day when it is less humid inside', () => {
            expect(new ClimateSummary(24.6, 34.9, 23.6, 43).format())
                .toBe("It's 1°c warmer inside (24.6°c inside, 23.6°c outside), but 8.1% less humid (34.9% inside, 43% outside).");
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

    describe('shouldOpenWindow', () => {
        // Outside humidity (4th arg) plays no part in the decision, so it's a
        // constant here; the outdoor dew point is set relative to the calculated
        // indoor dew point so each threshold is exact and readable.
        const decide = (insideTemp, insideHumidity, outsideTemp, outsideDewPoint) =>
            new ClimateSummary(insideTemp, insideHumidity, outsideTemp, 50, outsideDewPoint).shouldOpenWindow();
        const indoorDewPoint = (temp, humidity) => dewPoint(temp, humidity);

        it('is false when the indoor humidity is unknown', () => {
            expect(new ClimateSummary(24, null, 15, 50, 10).shouldOpenWindow()).toBe(false);
        });

        it('is false when the outdoor dew point is unknown', () => {
            expect(new ClimateSummary(24, 65, 15, 50, null).shouldOpenWindow()).toBe(false);
        });

        describe('rule 1 - muggy inside (RH >= 60%)', () => {
            it('opens when the outdoor dew point is >= 2°C lower and it is >= 8°C out', () => {
                expect(decide(24, 65, 10, indoorDewPoint(24, 65) - 2)).toBe(true);
            });
            it('stays shut when the dew-point drop is under 2°C', () => {
                expect(decide(24, 65, 10, indoorDewPoint(24, 65) - 1)).toBe(false);
            });
            it('stays shut when it is colder than 8°C out', () => {
                expect(decide(24, 65, 5, indoorDewPoint(24, 65) - 5)).toBe(false);
            });
        });

        describe('rule 2 - getting muggy (55% <= RH < 60%)', () => {
            it('opens when the drop is >= 3°C and it is >= 12°C out', () => {
                expect(decide(24, 57, 14, indoorDewPoint(24, 57) - 3)).toBe(true);
            });
            it('stays shut when the drop is under 3°C', () => {
                expect(decide(24, 57, 14, indoorDewPoint(24, 57) - 2)).toBe(false);
            });
            it('stays shut when it is colder than 12°C out', () => {
                expect(decide(24, 57, 10, indoorDewPoint(24, 57) - 5)).toBe(false);
            });
        });

        describe('rule 3 - pleasant outside (18-25°C)', () => {
            it('opens when indoor >= 18°C, RH >= 45% and the drop is >= 1°C', () => {
                expect(decide(20, 50, 22, indoorDewPoint(20, 50) - 1)).toBe(true);
            });
            it('stays shut below 18°C outside', () => {
                expect(decide(20, 50, 17, indoorDewPoint(20, 50) - 5)).toBe(false);
            });
            it('stays shut above 25°C outside', () => {
                expect(decide(20, 50, 26, indoorDewPoint(20, 50) - 5)).toBe(false);
            });
            it('stays shut when indoor is below 18°C', () => {
                expect(decide(17, 50, 22, indoorDewPoint(17, 50) - 5)).toBe(false);
            });
            it('stays shut when indoor humidity is below 45%', () => {
                expect(decide(20, 40, 22, indoorDewPoint(20, 40) - 5)).toBe(false);
            });
            it('stays shut when the drop is under 1°C', () => {
                expect(decide(20, 50, 22, indoorDewPoint(20, 50) - 0.5)).toBe(false);
            });
        });

        describe('rule 4 - hot inside (> 25°C)', () => {
            it('opens when outside is >= 2°C cooler and not much muggier', () => {
                expect(decide(27, 40, 24, indoorDewPoint(27, 40) + 1)).toBe(true);
            });
            it('stays shut when outside is less than 2°C cooler', () => {
                expect(decide(27, 40, 26, indoorDewPoint(27, 40) - 5)).toBe(false);
            });
            it('stays shut when the outdoor air is more than 1°C muggier', () => {
                expect(decide(27, 40, 24, indoorDewPoint(27, 40) + 2)).toBe(false);
            });
        });
    });
});
