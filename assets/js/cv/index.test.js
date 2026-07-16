import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { ctor, updateMock } = vi.hoisted(() => ({
    ctor: vi.fn(),
    updateMock: vi.fn(() => Promise.resolve()),
}));

vi.mock('./HomeTemperatureLink.js', () => ({
    default: class {
        constructor(...args) {
            ctor(...args);
        }
        update() {
            return updateMock();
        }
    },
}));

async function importOn(host) {
    vi.stubGlobal('location', { host });
    vi.resetModules();
    return import('./index.js');
}

beforeEach(() => {
    ctor.mockClear();
    updateMock.mockClear();
    document.body.innerHTML = '';
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
});

describe('cv/index.js', () => {
    it('constructs the link with the prod url and updates it when the element exists', async () => {
        document.body.innerHTML = '<a id="cv-home-temp" hidden></a>';
        const { initHomeTemperatureLink } = await importOn('christianbrown.uk');

        initHomeTemperatureLink();

        expect(ctor).toHaveBeenCalledTimes(1);
        expect(ctor.mock.calls[0][0].id).toBe('cv-home-temp');
        expect(ctor.mock.calls[0][1]).toBe('https://cdn.christianbrown.uk/get-smartthings-climate');
        expect(updateMock).toHaveBeenCalledTimes(1);
    });

    it('uses the dev url on the local jekyll host', async () => {
        document.body.innerHTML = '<a id="cv-home-temp" hidden></a>';
        const { initHomeTemperatureLink } = await importOn('127.0.0.1:4000');

        initHomeTemperatureLink();

        expect(ctor.mock.calls[0][1]).toBe('http://127.0.0.1:8080');
    });

    it('does nothing when the element is absent', async () => {
        const { initHomeTemperatureLink } = await importOn('christianbrown.uk');

        initHomeTemperatureLink();

        expect(ctor).not.toHaveBeenCalled();
        expect(updateMock).not.toHaveBeenCalled();
    });
});
