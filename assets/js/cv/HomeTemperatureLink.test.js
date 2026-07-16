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

function makeDom() {
    const dom = document.createElement('a');
    dom.hidden = true;
    document.body.append(dom);
    return dom;
}

beforeEach(() => {
    document.body.innerHTML = '';
    fetchMock.mockReset();
});

describe('HomeTemperatureLink', () => {
    it('fills in and reveals the link on success', async () => {
        const dom = makeDom();
        fetchMock.mockResolvedValue({ averageTempDegrees: 26.6 });

        await new HomeTemperatureLink(dom, 'url').update();

        expect(dom.textContent).toBe('🏠 26.6°c at home');
        expect(dom.hidden).toBe(false);
    });

    it('leaves the link hidden and empty on failure (no fallback)', async () => {
        const dom = makeDom();
        fetchMock.mockRejectedValue(new Error('nope'));

        await new HomeTemperatureLink(dom, 'url').update();

        expect(dom.textContent).toBe('');
        expect(dom.hidden).toBe(true);
    });
});
