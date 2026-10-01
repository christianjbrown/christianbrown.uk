import { describe, it, expect } from 'vitest';

import LocalHostPolicy from './LocalHostPolicy.js';

const policyFor = (hostname) => new LocalHostPolicy({ location: { hostname } });

describe('LocalHostPolicy', () => {
    it.each([
        'localhost',
        'app.localhost',
        '0.0.0.0',
        '[::1]', // location.hostname brackets IPv6 loopback
        '127.0.0.1',
        '127.255.255.254',
    ])('treats %s as a local development host', (hostname) => {
        expect(policyFor(hostname).isLocal()).toBe(true);
    });

    it.each([
        'christianbrown.uk',
        'www.christianbrown.uk',
        'localhost.example.com',
        '128.0.0.1',
    ])('treats %s as production', (hostname) => {
        expect(policyFor(hostname).isLocal()).toBe(false);
    });

    it('reads the location each time it is asked', () => {
        const win = { location: { hostname: 'christianbrown.uk' } };
        const policy = new LocalHostPolicy(win);

        expect(policy.isLocal()).toBe(false);
        win.location = { hostname: 'localhost' };
        expect(policy.isLocal()).toBe(true);
    });
});
