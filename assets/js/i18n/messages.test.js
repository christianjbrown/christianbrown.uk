import { describe, it, expect } from 'vitest';
import { catalogueFor, EN_GB } from './catalogue.js';
import DE_DE from './messages.de-DE.js';
import FR_FR from './messages.fr-FR.js';
import DA_DK from './messages.da-DK.js';
import ES_ES from './messages.es-ES.js';
import PT_PT from './messages.pt-PT.js';

// A fixed instant so the Intl date assertions are deterministic: 09:05 UTC on
// Monday 20 November 2023.
const DATE = new Date(Date.UTC(2023, 10, 20, 9, 5));

describe('catalogueFor', () => {
    it('returns the catalogue for a supported locale', () => {
        expect(catalogueFor('de-DE')).toBe(DE_DE);
        expect(catalogueFor('fr-FR')).toBe(FR_FR);
        expect(catalogueFor('da-DK')).toBe(DA_DK);
        expect(catalogueFor('es-ES')).toBe(ES_ES);
        expect(catalogueFor('pt-PT')).toBe(PT_PT);
        expect(catalogueFor('en-GB')).toBe(EN_GB);
    });

    it('falls back to en-GB for anything unrecognised', () => {
        expect(catalogueFor('xx-XX')).toBe(EN_GB);
        expect(catalogueFor(undefined)).toBe(EN_GB);
    });
});

describe('de-DE catalogue', () => {
    const cat = DE_DE;

    describe('climateSummary', () => {
        it('reports warmer inside and more humid inside (no contrast)', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '26,6 °C', outsideTemp: '25 °C', diffTemp: '1,6 °C', warmer: true,
                humidity: { match: false, inside: '52,8 %', outside: '42,6 %', diff: '10,2 %', moreInside: true, contrast: false },
            })).toBe('Drinnen ist es 1,6 °C wärmer (26,6 °C drinnen, 25 °C draußen), und es ist 10,2 % feuchter (52,8 % drinnen, 42,6 % draußen).');
        });

        it('reports cooler inside and less humid inside with a contrast', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '27 °C', outsideTemp: '30 °C', diffTemp: '3 °C', warmer: false,
                humidity: { match: false, inside: '40 %', outside: '55 %', diff: '15 %', moreInside: false, contrast: true },
            })).toBe('Drinnen ist es 3 °C kälter (27 °C drinnen, 30 °C draußen), aber es ist 15 % trockener (40 % drinnen, 55 % draußen).');
        });

        it('collapses matching temperatures and humidities', () => {
            expect(cat.climateSummary({
                temperaturesMatch: true, insideTemp: '26 °C', outsideTemp: '26 °C', diffTemp: '0 °C', warmer: false,
                humidity: { match: true, inside: '53 %', outside: '53 %', diff: '0 %', moreInside: false, contrast: false },
            })).toBe('Drinnen und draußen sind es 26 °C, und die Luftfeuchtigkeit beträgt drinnen und draußen 53 %.');
        });

        it('names the inside side when temperatures match but humidity differs', () => {
            expect(cat.climateSummary({
                temperaturesMatch: true, insideTemp: '24 °C', outsideTemp: '24 °C', diffTemp: '0 °C', warmer: false,
                humidity: { match: false, inside: '40 %', outside: '35,2 %', diff: '4,8 %', moreInside: true, contrast: false },
            })).toBe('Drinnen und draußen sind es 24 °C, und es ist 4,8 % feuchter drinnen (40 % drinnen, 35,2 % draußen).');
        });

        it('omits the humidity clause when it is absent', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '26,6 °C', outsideTemp: '25 °C', diffTemp: '1,6 °C', warmer: true, humidity: null,
            })).toBe('Drinnen ist es 1,6 °C wärmer (26,6 °C drinnen, 25 °C draußen).');
        });
    });

    describe('statusLine', () => {
        it('appends the climate as a second sentence', () => {
            expect(cat.statusLine('19:53 GMT', 'Donnerstag, 16. Juli', 'Drinnen ist es warm.'))
                .toBe('Es ist gerade 19:53 GMT am Donnerstag, 16. Juli in meinem Londoner Zuhause. Drinnen ist es warm.');
        });

        it('shows just the time when there is no climate', () => {
            expect(cat.statusLine('19:53 GMT', 'Donnerstag, 16. Juli', null))
                .toBe('Es ist gerade 19:53 GMT am Donnerstag, 16. Juli in meinem Londoner Zuhause.');
        });
    });

    it('formats relative time with Intl', () => {
        const label = cat.time.relativeTime(5, 'minute');
        expect(label).toContain('5');
        expect(label.toLowerCase()).toContain('vor');
    });

    it('formats dates with Intl', () => {
        expect(cat.time.formatDate(DATE, 'UTC', false)).toMatch(/20.*Nov/);
        expect(cat.time.formatDate(DATE, 'UTC', true)).toMatch(/Montag.*20.*November/);
    });

    it('builds the home-temperature link', () => {
        expect(cat.cv.homeTempLink('21 °C')).toBe('🏠 21 °C zu Hause');
    });
});

describe('fr-FR catalogue', () => {
    const cat = FR_FR;

    describe('climateSummary', () => {
        it('reports warmer inside and more humid inside (no contrast)', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '26,6 °C', outsideTemp: '25 °C', diffTemp: '1,6 °C', warmer: true,
                humidity: { match: false, inside: '52,8 %', outside: '42,6 %', diff: '10,2 %', moreInside: true, contrast: false },
            })).toBe("Il fait 1,6 °C de plus à l'intérieur (26,6 °C à l'intérieur, 25 °C à l'extérieur), et il y a 10,2 % d'humidité en plus (52,8 % à l'intérieur, 42,6 % à l'extérieur).");
        });

        it('reports cooler inside and less humid inside with a contrast', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '27 °C', outsideTemp: '30 °C', diffTemp: '3 °C', warmer: false,
                humidity: { match: false, inside: '40 %', outside: '55 %', diff: '15 %', moreInside: false, contrast: true },
            })).toBe("Il fait 3 °C de moins à l'intérieur (27 °C à l'intérieur, 30 °C à l'extérieur), mais il y a 15 % d'humidité en moins (40 % à l'intérieur, 55 % à l'extérieur).");
        });

        it('collapses matching temperatures and humidities', () => {
            expect(cat.climateSummary({
                temperaturesMatch: true, insideTemp: '26 °C', outsideTemp: '26 °C', diffTemp: '0 °C', warmer: false,
                humidity: { match: true, inside: '53 %', outside: '53 %', diff: '0 %', moreInside: false, contrast: false },
            })).toBe("Il fait 26 °C à l'intérieur comme à l'extérieur, et l'humidité est de 53 % à l'intérieur comme à l'extérieur.");
        });

        it('names the inside side when temperatures match but humidity differs', () => {
            expect(cat.climateSummary({
                temperaturesMatch: true, insideTemp: '24 °C', outsideTemp: '24 °C', diffTemp: '0 °C', warmer: false,
                humidity: { match: false, inside: '40 %', outside: '35,2 %', diff: '4,8 %', moreInside: true, contrast: false },
            })).toBe("Il fait 24 °C à l'intérieur comme à l'extérieur, et il y a 4,8 % d'humidité en plus à l'intérieur (40 % à l'intérieur, 35,2 % à l'extérieur).");
        });

        it('omits the humidity clause when it is absent', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '26,6 °C', outsideTemp: '25 °C', diffTemp: '1,6 °C', warmer: true, humidity: null,
            })).toBe("Il fait 1,6 °C de plus à l'intérieur (26,6 °C à l'intérieur, 25 °C à l'extérieur).");
        });
    });

    describe('statusLine', () => {
        it('appends the climate as a second sentence', () => {
            expect(cat.statusLine('19:53 GMT', 'jeudi 16 juillet', "Il fait chaud à l'intérieur."))
                .toBe("Il est actuellement 19:53 GMT le jeudi 16 juillet chez moi à Londres. Il fait chaud à l'intérieur.");
        });

        it('shows just the time when there is no climate', () => {
            expect(cat.statusLine('19:53 GMT', 'jeudi 16 juillet', null))
                .toBe('Il est actuellement 19:53 GMT le jeudi 16 juillet chez moi à Londres.');
        });
    });

    it('formats relative time with Intl', () => {
        const label = cat.time.relativeTime(5, 'minute');
        expect(label).toContain('5');
        expect(label.toLowerCase()).toContain('il y a');
    });

    it('formats dates with Intl', () => {
        expect(cat.time.formatDate(DATE, 'UTC', false)).toMatch(/20.*nov/);
        expect(cat.time.formatDate(DATE, 'UTC', true)).toMatch(/lundi.*20.*novembre/);
    });

    it('builds the home-temperature link', () => {
        expect(cat.cv.homeTempLink('21 °C')).toBe('🏠 21 °C à la maison');
    });
});

describe('da-DK catalogue', () => {
    const cat = DA_DK;

    describe('climateSummary', () => {
        it('reports warmer inside and more humid inside (no contrast)', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '26,6 °C', outsideTemp: '25 °C', diffTemp: '1,6 °C', warmer: true,
                humidity: { match: false, inside: '52,8 %', outside: '42,6 %', diff: '10,2 %', moreInside: true, contrast: false },
            })).toBe('Der er 1,6 °C varmere indenfor (26,6 °C inde, 25 °C ude), og der er 10,2 % mere fugtigt (52,8 % inde, 42,6 % ude).');
        });

        it('reports cooler inside and less humid inside with a contrast', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '27 °C', outsideTemp: '30 °C', diffTemp: '3 °C', warmer: false,
                humidity: { match: false, inside: '40 %', outside: '55 %', diff: '15 %', moreInside: false, contrast: true },
            })).toBe('Der er 3 °C koldere indenfor (27 °C inde, 30 °C ude), men der er 15 % mindre fugtigt (40 % inde, 55 % ude).');
        });

        it('collapses matching temperatures and humidities', () => {
            expect(cat.climateSummary({
                temperaturesMatch: true, insideTemp: '26 °C', outsideTemp: '26 °C', diffTemp: '0 °C', warmer: false,
                humidity: { match: true, inside: '53 %', outside: '53 %', diff: '0 %', moreInside: false, contrast: false },
            })).toBe('Der er 26 °C både inde og ude, og luftfugtigheden er 53 % både inde og ude.');
        });

        it('names the inside side when temperatures match but humidity differs', () => {
            expect(cat.climateSummary({
                temperaturesMatch: true, insideTemp: '24 °C', outsideTemp: '24 °C', diffTemp: '0 °C', warmer: false,
                humidity: { match: false, inside: '40 %', outside: '35,2 %', diff: '4,8 %', moreInside: true, contrast: false },
            })).toBe('Der er 24 °C både inde og ude, og der er 4,8 % mere fugtigt indenfor (40 % inde, 35,2 % ude).');
        });

        it('omits the humidity clause when it is absent', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '26,6 °C', outsideTemp: '25 °C', diffTemp: '1,6 °C', warmer: true, humidity: null,
            })).toBe('Der er 1,6 °C varmere indenfor (26,6 °C inde, 25 °C ude).');
        });
    });

    describe('statusLine', () => {
        it('appends the climate as a second sentence', () => {
            expect(cat.statusLine('21:55 GMT+1', 'mandag den 20. juli', 'Der er varmt indenfor.'))
                .toBe('Klokken er 21:55 GMT+1 mandag den 20. juli i mit hjem i London. Der er varmt indenfor.');
        });

        it('shows just the time when there is no climate', () => {
            expect(cat.statusLine('21:55 GMT+1', 'mandag den 20. juli', null))
                .toBe('Klokken er 21:55 GMT+1 mandag den 20. juli i mit hjem i London.');
        });
    });

    it('formats relative time with Intl', () => {
        const label = cat.time.relativeTime(5, 'minute');
        expect(label).toContain('5');
        expect(label.toLowerCase()).toContain('min');
    });

    it('formats dates with Intl', () => {
        expect(cat.time.formatDate(DATE, 'UTC', false)).toMatch(/20\.?\s*nov/);
        expect(cat.time.formatDate(DATE, 'UTC', true)).toMatch(/mandag.*20.*november/);
    });

    it('builds the home-temperature link', () => {
        expect(cat.cv.homeTempLink('21 °C')).toBe('🏠 21 °C hjemme');
    });
});

describe('es-ES catalogue', () => {
    const cat = ES_ES;

    describe('climateSummary', () => {
        it('reports warmer inside and more humid inside (no contrast)', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '26,6 °C', outsideTemp: '25 °C', diffTemp: '1,6 °C', warmer: true,
                humidity: { match: false, inside: '52,8 %', outside: '42,6 %', diff: '10,2 %', moreInside: true, contrast: false },
            })).toBe('Dentro está 1,6 °C más cálido (26,6 °C dentro, 25 °C fuera), y hay 10,2 % más humedad (52,8 % dentro, 42,6 % fuera).');
        });

        it('reports cooler inside and less humid inside with a contrast', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '27 °C', outsideTemp: '30 °C', diffTemp: '3 °C', warmer: false,
                humidity: { match: false, inside: '40 %', outside: '55 %', diff: '15 %', moreInside: false, contrast: true },
            })).toBe('Dentro está 3 °C más fresco (27 °C dentro, 30 °C fuera), pero hay 15 % menos humedad (40 % dentro, 55 % fuera).');
        });

        it('collapses matching temperatures and humidities', () => {
            expect(cat.climateSummary({
                temperaturesMatch: true, insideTemp: '26 °C', outsideTemp: '26 °C', diffTemp: '0 °C', warmer: false,
                humidity: { match: true, inside: '53 %', outside: '53 %', diff: '0 %', moreInside: false, contrast: false },
            })).toBe('Hace 26 °C tanto dentro como fuera, y la humedad es del 53 % tanto dentro como fuera.');
        });

        it('names the inside side when temperatures match but humidity differs', () => {
            expect(cat.climateSummary({
                temperaturesMatch: true, insideTemp: '24 °C', outsideTemp: '24 °C', diffTemp: '0 °C', warmer: false,
                humidity: { match: false, inside: '40 %', outside: '35,2 %', diff: '4,8 %', moreInside: true, contrast: false },
            })).toBe('Hace 24 °C tanto dentro como fuera, y hay 4,8 % más humedad dentro (40 % dentro, 35,2 % fuera).');
        });

        it('omits the humidity clause when it is absent', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '26,6 °C', outsideTemp: '25 °C', diffTemp: '1,6 °C', warmer: true, humidity: null,
            })).toBe('Dentro está 1,6 °C más cálido (26,6 °C dentro, 25 °C fuera).');
        });
    });

    describe('statusLine', () => {
        it('appends the climate as a second sentence', () => {
            expect(cat.statusLine('19:53 GMT', 'jueves, 16 de julio', 'Hace calor dentro.'))
                .toBe('Ahora mismo son las 19:53 GMT el jueves, 16 de julio en mi casa de Londres. Hace calor dentro.');
        });

        it('shows just the time when there is no climate', () => {
            expect(cat.statusLine('19:53 GMT', 'jueves, 16 de julio', null))
                .toBe('Ahora mismo son las 19:53 GMT el jueves, 16 de julio en mi casa de Londres.');
        });
    });

    it('formats relative time with Intl', () => {
        const label = cat.time.relativeTime(5, 'minute');
        expect(label).toContain('5');
        expect(label.toLowerCase()).toContain('hace');
    });

    it('formats dates with Intl', () => {
        expect(cat.time.formatDate(DATE, 'UTC', false)).toMatch(/20.*nov/);
        expect(cat.time.formatDate(DATE, 'UTC', true)).toMatch(/lunes.*20.*noviembre/);
    });

    it('builds the home-temperature link', () => {
        expect(cat.cv.homeTempLink('21 °C')).toBe('🏠 21 °C en casa');
    });
});

describe('pt-PT catalogue', () => {
    const cat = PT_PT;

    describe('climateSummary', () => {
        it('reports warmer inside and more humid inside (no contrast)', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '26,6 °C', outsideTemp: '25 °C', diffTemp: '1,6 °C', warmer: true,
                humidity: { match: false, inside: '52,8 %', outside: '42,6 %', diff: '10,2 %', moreInside: true, contrast: false },
            })).toBe('Dentro está 1,6 °C mais quente (26,6 °C dentro, 25 °C fora), e há 10,2 % mais humidade (52,8 % dentro, 42,6 % fora).');
        });

        it('reports cooler inside and less humid inside with a contrast', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '27 °C', outsideTemp: '30 °C', diffTemp: '3 °C', warmer: false,
                humidity: { match: false, inside: '40 %', outside: '55 %', diff: '15 %', moreInside: false, contrast: true },
            })).toBe('Dentro está 3 °C mais fresco (27 °C dentro, 30 °C fora), mas há 15 % menos humidade (40 % dentro, 55 % fora).');
        });

        it('collapses matching temperatures and humidities', () => {
            expect(cat.climateSummary({
                temperaturesMatch: true, insideTemp: '26 °C', outsideTemp: '26 °C', diffTemp: '0 °C', warmer: false,
                humidity: { match: true, inside: '53 %', outside: '53 %', diff: '0 %', moreInside: false, contrast: false },
            })).toBe('Está 26 °C tanto dentro como fora, e a humidade é de 53 % tanto dentro como fora.');
        });

        it('names the inside side when temperatures match but humidity differs', () => {
            expect(cat.climateSummary({
                temperaturesMatch: true, insideTemp: '24 °C', outsideTemp: '24 °C', diffTemp: '0 °C', warmer: false,
                humidity: { match: false, inside: '40 %', outside: '35,2 %', diff: '4,8 %', moreInside: true, contrast: false },
            })).toBe('Está 24 °C tanto dentro como fora, e há 4,8 % mais humidade dentro (40 % dentro, 35,2 % fora).');
        });

        it('omits the humidity clause when it is absent', () => {
            expect(cat.climateSummary({
                temperaturesMatch: false, insideTemp: '26,6 °C', outsideTemp: '25 °C', diffTemp: '1,6 °C', warmer: true, humidity: null,
            })).toBe('Dentro está 1,6 °C mais quente (26,6 °C dentro, 25 °C fora).');
        });
    });

    describe('statusLine', () => {
        it('appends the climate as a second sentence', () => {
            expect(cat.statusLine('19:53 GMT', 'quinta-feira, 16 de julho', 'Está calor dentro.'))
                .toBe('Agora são 19:53 GMT de quinta-feira, 16 de julho na minha casa em Londres. Está calor dentro.');
        });

        it('shows just the time when there is no climate', () => {
            expect(cat.statusLine('19:53 GMT', 'quinta-feira, 16 de julho', null))
                .toBe('Agora são 19:53 GMT de quinta-feira, 16 de julho na minha casa em Londres.');
        });
    });

    it('formats relative time with Intl', () => {
        const label = cat.time.relativeTime(5, 'minute');
        expect(label).toContain('5');
        expect(label.toLowerCase()).toContain('há');
    });

    it('formats dates with Intl', () => {
        expect(cat.time.formatDate(DATE, 'UTC', false)).toContain('20');
        expect(cat.time.formatDate(DATE, 'UTC', true)).toMatch(/segunda-feira.*novembro/);
    });

    it('builds the home-temperature link', () => {
        expect(cat.cv.homeTempLink('21 °C')).toBe('🏠 21 °C em casa');
    });
});
