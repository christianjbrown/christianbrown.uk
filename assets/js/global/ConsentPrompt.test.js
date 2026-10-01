import { describe, it, expect, vi } from 'vitest';

import ConsentPrompt from './ConsentPrompt.js';

const CATALOGUE = { cookies: {} };

function build(consent) {
    const dialog = { open: vi.fn() };
    const localiser = { localise: vi.fn() };
    const telemetry = { enable: vi.fn() };
    const prompt = new ConsentPrompt({ getConsent: () => consent }, dialog, localiser, telemetry, Promise.resolve(CATALOGUE));

    return { prompt, dialog, localiser, telemetry };
}

describe('ConsentPrompt', () => {
    it('localises then opens the dialog when consent is undecided', async () => {
        const { prompt, dialog, localiser, telemetry } = build(null);

        await prompt.run();

        expect(localiser.localise).toHaveBeenCalledWith(CATALOGUE);
        expect(dialog.open).toHaveBeenCalledTimes(1);
        expect(telemetry.enable).not.toHaveBeenCalled();
    });

    it('enables telemetry when consent was already granted', async () => {
        const { prompt, dialog, telemetry } = build(true);

        await prompt.run();

        expect(telemetry.enable).toHaveBeenCalledTimes(1);
        expect(dialog.open).not.toHaveBeenCalled();
    });

    it('does nothing when consent was previously declined', async () => {
        const { prompt, dialog, localiser, telemetry } = build(false);

        await prompt.run();

        expect(dialog.open).not.toHaveBeenCalled();
        expect(localiser.localise).not.toHaveBeenCalled();
        expect(telemetry.enable).not.toHaveBeenCalled();
    });
});
