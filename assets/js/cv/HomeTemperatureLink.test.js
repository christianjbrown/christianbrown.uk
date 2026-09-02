import { describe, it, expect, beforeEach, vi } from 'vitest';

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

vi.mock('../DataFetcher.js', () => ({
    default: class {
        constructor(url, contract) {
            this.url = url;
            this.contract = contract;
        }

        fetch() {
            return fetchMock();
        }
    },
}));

import HomeTemperatureLink from './HomeTemperatureLink.js';

// The link as the build ships it: visible, and already carrying the page's name
// as its label.
const SHIPPED_LABEL = '🏠 Smart home';

function makeDom() {
    const dom = document.createElement('a');
    dom.textContent = SHIPPED_LABEL;
    document.body.append(dom);
    return dom;
}

beforeEach(() => {
    document.body.innerHTML = '';
    fetchMock.mockReset();
});

describe('HomeTemperatureLink', () => {
    it('averages the device temperatures and relabels the link on success', async () => {
        const dom = makeDom();
        fetchMock.mockResolvedValue([
            { temperatureValue: 26.0, temperatureTimestamp: 100, temperatureStale: false },
            { temperatureValue: 27.2, temperatureTimestamp: 200, temperatureStale: false },
        ]);

        await new HomeTemperatureLink(dom, 'url').update();

        expect(dom.textContent).toBe('🏠 26.6°C at home');
        expect(dom.hidden).toBe(false);
    });

    // The point of the fallback: a feed that is down must not take the only route
    // from the homepage to the smart-home page with it.
    it('keeps the shipped label, and the link, on failure', async () => {
        const dom = makeDom();
        fetchMock.mockRejectedValue(new Error('nope'));

        await new HomeTemperatureLink(dom, 'url').update();

        expect(dom.textContent).toBe(SHIPPED_LABEL);
        expect(dom.hidden).toBe(false);
    });

    it('keeps the shipped label when no device has a usable temperature', async () => {
        const dom = makeDom();
        fetchMock.mockResolvedValue([
            { temperatureValue: null, temperatureTimestamp: 100, temperatureStale: false },
        ]);

        await new HomeTemperatureLink(dom, 'url').update();

        expect(dom.textContent).toBe(SHIPPED_LABEL);
        expect(dom.hidden).toBe(false);
    });
});
