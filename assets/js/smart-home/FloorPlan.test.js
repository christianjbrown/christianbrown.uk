import { describe, it, expect, beforeEach } from 'vitest';
import FloorPlan from './FloorPlan.js';

const ROOM_ANCHORS = {
    'Living room': {'x': 25, 'y': 70},
    'Study': {'x': 80, 'y': 30},
    'Bathroom': {'x': 60, 'y': 20},
};
const OUTSIDE_ANCHORS = [{'x': 50, 'y': 3}, {'x': 50, 'y': 97}];

let container;

function make() {
    container = document.createElement('div');
    document.body.append(container);
    return new FloorPlan(container, ROOM_ANCHORS, OUTSIDE_ANCHORS);
}

function labels() {
    return [...container.querySelectorAll('.floor-plan-label')];
}

function labelFor(name) {
    return labels().find((label) => label.textContent.startsWith(name));
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('FloorPlan', () => {
    it('labels only rooms present in the data, averaging their devices', () => {
        const subject = make();
        subject.render({
            devices: [
                {roomName: 'Living room', temperatureValue: 26.6, temperatureStale: false, humidityValue: 53, humidityStale: false},
                {roomName: 'Living room', temperatureValue: 27.0, temperatureStale: false, humidityValue: 51, humidityStale: false},
                {roomName: 'Study', temperatureValue: 26.9, temperatureStale: false},
                {roomName: 'Kitchen', temperatureValue: 24.5, temperatureStale: false, humidityValue: 48, humidityStale: false},
                {temperatureValue: 22, temperatureStale: false},
                {roomName: 'Empty', temperatureValue: null, humidityValue: null},
            ],
        }, null);

        // Living room + Study only: Kitchen has no anchor, Bathroom no data,
        // Empty has no reading, and the device with no room is skipped.
        expect(labels()).toHaveLength(2);

        const livingRoom = labelFor('Living room');
        expect(livingRoom.querySelector('.floor-plan-temp').textContent).toContain('26.8°c');
        expect(livingRoom.querySelector('.floor-plan-humidity').textContent).toContain('52%');
        expect(livingRoom.style.left).toBe('25%');
        expect(livingRoom.style.top).toBe('70%');

        const study = labelFor('Study');
        expect(study.querySelector('.floor-plan-temp').textContent).toContain('26.9°c');
        // No humidity reported -> no humidity line.
        expect(study.querySelector('.floor-plan-humidity')).toBeNull();
    });

    it('mutes a room whose readings are all stale', () => {
        const subject = make();
        subject.render({
            devices: [
                {roomName: 'Living room', temperatureValue: 27.3, temperatureStale: true, humidityValue: 50, humidityStale: true},
            ],
        }, null);

        const livingRoom = labelFor('Living room');
        expect(livingRoom.querySelector('.floor-plan-temp').classList.contains('muted')).toBe(true);
        expect(livingRoom.querySelector('.floor-plan-humidity').classList.contains('muted')).toBe(true);
    });

    it('keeps a room fresh when only some of its devices are stale', () => {
        const subject = make();
        subject.render({
            devices: [
                {roomName: 'Living room', temperatureValue: 27.3, temperatureStale: true, humidityValue: 50, humidityStale: true},
                {roomName: 'Living room', temperatureValue: 26.0, temperatureStale: false, humidityValue: 52, humidityStale: false},
            ],
        }, null);

        const livingRoom = labelFor('Living room');
        expect(livingRoom.querySelector('.floor-plan-temp').classList.contains('muted')).toBe(false);
        expect(livingRoom.querySelector('.floor-plan-humidity').classList.contains('muted')).toBe(false);
    });

    it('places an outside label at each outside anchor', () => {
        const subject = make();
        subject.render(null, {temp: 26.7, humidity: 39.3});

        const outside = labels();
        expect(outside).toHaveLength(2);
        expect(outside[0].textContent).toContain('Outside');
        expect(outside[0].querySelector('.floor-plan-temp').textContent).toContain('26.7°c');
        expect(outside[0].querySelector('.floor-plan-humidity').textContent).toContain('39%');
        expect(outside[0].style.top).toBe('3%');
        expect(outside[1].style.top).toBe('97%');
    });

    it('shows the outside temperature even when its humidity is missing', () => {
        const subject = make();
        subject.render(null, {temp: 26.7});

        const outside = labelFor('Outside');
        expect(outside.querySelector('.floor-plan-temp').textContent).toContain('26.7°c');
        expect(outside.querySelector('.floor-plan-humidity')).toBeNull();
    });

    it('renders nothing without data, and ignores payloads with no devices/temp', () => {
        const subject = make();
        subject.render(null, null);
        expect(labels()).toHaveLength(0);

        subject.render({}, {});
        expect(labels()).toHaveLength(0);
    });

    it('clears previous labels on re-render', () => {
        const subject = make();
        subject.render({devices: [{roomName: 'Living room', temperatureValue: 26, temperatureStale: false}]}, {temp: 20});
        expect(labels()).toHaveLength(3);

        subject.render(null, null);
        expect(labels()).toHaveLength(0);
    });

    it('defaults to the real anchors when none are given', () => {
        const dom = document.createElement('div');
        document.body.append(dom);
        const subject = new FloorPlan(dom);
        subject.render({devices: [{roomName: 'Kitchen', temperatureValue: 24, temperatureStale: false}]}, {temp: 20});

        // Kitchen is one of the real room anchors, plus two outside labels.
        expect(dom.querySelectorAll('.floor-plan-label')).toHaveLength(3);
        expect([...dom.querySelectorAll('.floor-plan-label')].some((l) => l.textContent.startsWith('Kitchen'))).toBe(true);
    });
});
