import { describe, it, expect, vi } from 'vitest';

import ConsentDecisions from './ConsentDecisions.js';

function build() {
    const calls = [];
    const dialog = { close: vi.fn(() => calls.push('close')) };
    const cookie = {
        setConsent: vi.fn((accept) => calls.push(`setConsent:${accept}`)),
        deleteAll: vi.fn(() => calls.push('deleteAll')),
    };
    const telemetry = { enable: vi.fn(() => calls.push('enable')) };

    return { decisions: new ConsentDecisions(dialog, cookie, telemetry), calls, telemetry };
}

describe('ConsentDecisions', () => {
    it('accepting closes the dialog, stores consent and enables telemetry', () => {
        const { decisions, calls } = build();

        decisions.accept();

        expect(calls).toEqual(['close', 'setConsent:true', 'enable']);
    });

    it('declining closes the dialog, clears cookies and records the refusal without enabling telemetry', () => {
        const { decisions, calls, telemetry } = build();

        decisions.decline();

        expect(calls).toEqual(['close', 'deleteAll', 'setConsent:false']);
        expect(telemetry.enable).not.toHaveBeenCalled();
    });
});
