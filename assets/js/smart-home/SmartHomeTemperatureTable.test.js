import { describe, it, expect, beforeEach } from 'vitest';
import SmartHomeTemperatureTable from './SmartHomeTemperatureTable.js';
import DE_DE from '../i18n/messages.de-DE.js';

function make(catalogue) {
    const table = document.createElement('table');
    const updateSpan = document.createElement('span');
    document.body.append(table, updateSpan);
    return { table, updateSpan, subject: new SmartHomeTemperatureTable(table, updateSpan, 'url', catalogue) };
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('SmartHomeTemperatureTable', () => {
    it('renders the title header, the computed average and each device sorted newest-first', () => {
        const { table, subject } = make();
        subject._renderHeader();
        subject._renderUpdate({
            devices: [
                {
                    name: 'Sensor A', roomName: 'Kitchen',
                    temperatureValue: 22, temperatureTimestamp: 2000, temperatureStale: false,
                    humidityValue: 50, humidityTimestamp: 1900, humidityStale: false,
                },
                {
                    name: 'Sensor B',
                    temperatureValue: 24, temperatureTimestamp: 3000, temperatureStale: false,
                    humidityValue: 60, humidityTimestamp: 1800, humidityStale: false,
                },
            ],
        });

        const rows = table.querySelectorAll('tr');
        // header + average + 2 devices
        expect(rows).toHaveLength(4);
        expect(rows[0].textContent).toContain('🏠 Inside climate');
        expect(rows[1].textContent).toContain('Average');
        // Averaged from the devices: (22 + 24) / 2 and (50 + 60) / 2.
        expect(rows[1].textContent).toContain('23°c');
        expect(rows[1].textContent).toContain('55%');
        // 55% humidity reads as "Pleasant".
        expect(rows[1].textContent).toContain('Pleasant');
        // Sensor B has the newest temperature timestamp, so it sorts above Sensor A.
        expect(rows[2].textContent).toContain('Sensor B');
        expect(rows[3].textContent).toContain('Kitchen - Sensor A');
        expect(rows[3].textContent).toContain('50%');
    });

    it('shows its own muted "Updated" line (under the table) when given the envelope timestamp', () => {
        const { updateSpan, subject } = make();
        subject._renderHeader();
        subject._renderUpdate(
            {
                devices: [
                    { name: 'Sensor', temperatureValue: 21, temperatureTimestamp: 2000, temperatureStale: false },
                ],
            },
            Math.floor(Date.now() / 1000) - 120,
        );

        const freshness = updateSpan.querySelector('span.update-time__freshness');
        expect(freshness).not.toBeNull();
        expect(freshness.textContent).toMatch(/^Updated .* ago$/);
    });

    it('leaves the update span empty when no envelope timestamp is given', () => {
        const { updateSpan, subject } = make();
        subject._renderHeader();
        subject._renderUpdate({
            devices: [
                { name: 'Sensor', temperatureValue: 21, temperatureTimestamp: 2000, temperatureStale: false },
            ],
        });

        expect(updateSpan.textContent).toBe('');
    });

    it('renders the title header even when the update fails to load', () => {
        const { subject } = make();
        subject._renderHeader();
        expect(document.querySelector('table').textContent).toContain('🏠 Inside climate');
    });

    it('handles a missing average humidity and devices without a room or humidity', () => {
        const { table, subject } = make();
        subject._renderHeader();
        subject._renderUpdate({
            devices: [
                { name: 'Bare', temperatureValue: 21, temperatureTimestamp: 2000, temperatureStale: false },
            ],
        });

        const rows = table.querySelectorAll('tr');
        expect(rows[1].textContent).toContain('Average');
        // No average humidity and no device humidity -> muted dashes.
        expect(table.textContent).toContain('—');
        // No roomName -> the label is just the device name.
        expect(rows[2].textContent).toContain('Bare');
        expect(rows[2].textContent).not.toContain(' - ');
    });

    it('maps room and device names for the locale, falling back to the API value', () => {
        const { table, subject } = make(DE_DE);
        subject._renderHeader();
        subject._renderUpdate({
            devices: [
                { name: 'Button', roomName: 'Living room', temperatureValue: 22, temperatureTimestamp: 2000, temperatureStale: false },
                { name: 'Sensor X', roomName: 'Attic', temperatureValue: 21, temperatureTimestamp: 1000, temperatureStale: false },
            ],
        });

        // Mapped room + device.
        expect(table.textContent).toContain('Wohnzimmer - Taster');
        // Unmapped room and device fall back to the raw API values.
        expect(table.textContent).toContain('Attic - Sensor X');
    });

    describe('_getContract', () => {
        it('requires the devices array and no longer any server-computed averages', () => {
            const { subject } = make();
            expect(subject._getContract()).toHaveProperty('devices');
            expect(subject._getContract()).not.toHaveProperty('averageTempDegrees');
        });
    });
});
