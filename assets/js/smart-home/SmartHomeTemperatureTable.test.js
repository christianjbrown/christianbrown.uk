import { describe, it, expect, beforeEach } from 'vitest';
import SmartHomeTemperatureTable from './SmartHomeTemperatureTable.js';

function make() {
    const table = document.createElement('table');
    const updateSpan = document.createElement('span');
    document.body.append(table, updateSpan);
    return { table, updateSpan, subject: new SmartHomeTemperatureTable(table, updateSpan, 'url') };
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
        expect(rows[1].textContent).toContain('23.0°c');
        expect(rows[1].textContent).toContain('55%');
        // 55% humidity reads as "Pleasant".
        expect(rows[1].textContent).toContain('Pleasant');
        // Sensor B has the newest temperature timestamp, so it sorts above Sensor A.
        expect(rows[2].textContent).toContain('Sensor B');
        expect(rows[3].textContent).toContain('Kitchen - Sensor A');
        expect(rows[3].textContent).toContain('50%');
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

    describe('_getContract', () => {
        it('requires the devices array and no longer any server-computed averages', () => {
            const { subject } = make();
            expect(subject._getContract()).toHaveProperty('devices');
            expect(subject._getContract()).not.toHaveProperty('averageTempDegrees');
        });
    });
});
