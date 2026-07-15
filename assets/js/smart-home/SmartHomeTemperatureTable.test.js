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
    it('renders a header, the average and each device sorted newest-first', () => {
        const { table, subject } = make();
        subject._renderUpdate({
            averageTempDegrees: 20,
            averageTempTimestamp: 1000,
            averageHumidity: 55,
            averageHumidityTimestamp: 900,
            devices: [
                {
                    name: 'Sensor A', roomName: 'Kitchen',
                    temperatureValue: 21, temperatureTimestamp: 2000, temperatureStale: false,
                    humidityValue: 50, humidityTimestamp: 1900, humidityStale: false,
                },
                {
                    name: 'Sensor B',
                    temperatureValue: 19, temperatureTimestamp: 3000, temperatureStale: true,
                },
            ],
        });

        const rows = table.querySelectorAll('tr');
        // header + average + 2 devices
        expect(rows).toHaveLength(4);
        expect(rows[1].textContent).toContain('Average');
        expect(rows[1].textContent).toContain('55%');
        // Sensor B has the newest temperature timestamp, so it sorts above Sensor A.
        expect(rows[2].textContent).toContain('Sensor B');
        expect(rows[3].textContent).toContain('Kitchen - Sensor A');
        expect(rows[3].textContent).toContain('50%');
    });

    it('handles a missing average humidity and devices without a room or humidity', () => {
        const { table, subject } = make();
        subject._renderUpdate({
            averageTempDegrees: 20,
            averageTempTimestamp: 1000,
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
        it('returns the smart-home temperature contract', () => {
            const { subject } = make();
            expect(subject._getContract()).toHaveProperty('devices');
            expect(subject._getContract()).toHaveProperty('averageTempDegrees');
        });
    });
});
