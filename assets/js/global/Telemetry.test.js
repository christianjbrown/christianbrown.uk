import { describe, it, expect, vi } from 'vitest';

import Telemetry from './Telemetry.js';

function build(isLocal) {
    const analytics = { enable: vi.fn() };
    const errorReporter = { enable: vi.fn().mockResolvedValue(undefined) };
    const telemetry = new Telemetry({ isLocal: () => isLocal }, analytics, errorReporter);

    return { telemetry, analytics, errorReporter };
}

describe('Telemetry', () => {
    it('enables analytics and error reporting on a production host', () => {
        const { telemetry, analytics, errorReporter } = build(false);

        telemetry.enable();

        expect(analytics.enable).toHaveBeenCalledTimes(1);
        expect(errorReporter.enable).toHaveBeenCalledTimes(1);
    });

    it('enables neither on a local development host', () => {
        const { telemetry, analytics, errorReporter } = build(true);

        telemetry.enable();

        expect(analytics.enable).not.toHaveBeenCalled();
        expect(errorReporter.enable).not.toHaveBeenCalled();
    });
});
