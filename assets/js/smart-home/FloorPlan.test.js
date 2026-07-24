import { describe, it, expect, beforeEach } from 'vitest';
import FloorPlan from './FloorPlan.js';
import DE_DE from '../i18n/messages.de-DE.js';

const ROOM_ANCHORS = {
    'Living room': {'x': 25, 'y': 70},
    'Study': {'x': 80, 'y': 30},
    'Bathroom': {'x': 60, 'y': 20},
};
const OUTSIDE_ANCHORS = [{'x': 50, 'y': 3}, {'x': 50, 'y': 97}];
const FLOOR_ANCHORS = {'Third floor': {'x': 25, 'y': 4}, 'Fourth floor': {'x': 74, 'y': 4}};

let section;
let container;

function make(roomAnchors = ROOM_ANCHORS, outsideAnchors = OUTSIDE_ANCHORS, floorAnchors = FLOOR_ANCHORS, catalogue) {
    section = document.createElement('div');
    section.className = 'floor-plan-section';
    section.hidden = true;
    container = document.createElement('div');
    container.className = 'floor-plan';
    section.append(container);
    document.body.append(section);
    return new FloorPlan(section, roomAnchors, outsideAnchors, floorAnchors, catalogue);
}

function labels() {
    return [...container.querySelectorAll('.floor-plan__label')];
}

function floorLabels() {
    return [...container.querySelectorAll('.floor-plan__floor-label')];
}

function labelFor(name) {
    return labels().find((label) => label.textContent.startsWith(name));
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('FloorPlan', () => {
    it('reveals the section, labels every anchored room, and averages the readings for those in the data', () => {
        const subject = make();
        subject.render([
            {roomName: 'Living room', temperatureValue: 26.6, temperatureStale: false, humidityValue: 53, humidityStale: false},
            {roomName: 'Living room', temperatureValue: 27.0, temperatureStale: false, humidityValue: 51, humidityStale: false},
            {roomName: 'Study', temperatureValue: 26.9, temperatureStale: false},
            {roomName: 'Kitchen', temperatureValue: 24.5, temperatureStale: false, humidityValue: 48, humidityStale: false},
            {temperatureValue: 22, temperatureStale: false},
            {roomName: 'Empty', temperatureValue: null, humidityValue: null},
        ], null);

        expect(section.hidden).toBe(false);
        // All three anchored rooms are labelled: Living room and Study carry
        // readings; Bathroom has no sensor, so it shows its name only. Kitchen
        // and Empty aren't anchored, and the device with no room is skipped.
        expect(labels()).toHaveLength(3);

        const livingRoom = labelFor('Living room');
        expect(livingRoom.querySelector('.floor-plan__temp').textContent).toContain('26.8°c');
        expect(livingRoom.querySelector('.floor-plan__humidity').textContent).toContain('52%');
        expect(livingRoom.style.left).toBe('25%');
        expect(livingRoom.style.top).toBe('70%');

        const study = labelFor('Study');
        expect(study.querySelector('.floor-plan__temp').textContent).toContain('26.9°c');
        // No humidity reported -> no humidity line.
        expect(study.querySelector('.floor-plan__humidity')).toBeNull();

        // Bathroom has no sensor: its name shows, with neither reading.
        const bathroom = labelFor('Bathroom');
        expect(bathroom.querySelector('.floor-plan__name').textContent).toBe('Bathroom');
        expect(bathroom.querySelector('.floor-plan__temp')).toBeNull();
        expect(bathroom.querySelector('.floor-plan__humidity')).toBeNull();
    });

    it('draws the floor headings at their anchors whenever the plan is shown', () => {
        const subject = make();
        subject.render([{roomName: 'Study', temperatureValue: 20, temperatureStale: false}], null);

        const floors = floorLabels();
        expect(floors.map((floor) => floor.textContent)).toEqual(['Third floor', 'Fourth floor']);
        const third = floors.find((floor) => floor.textContent === 'Third floor');
        expect(third.style.left).toBe('25%');
        expect(third.style.top).toBe('4%');
    });

    it('clears the floor headings on re-render and omits them while the plan is hidden', () => {
        const subject = make();
        subject.render([], null);
        expect(floorLabels()).toHaveLength(2);

        subject.render(null, null);
        expect(section.hidden).toBe(true);
        expect(floorLabels()).toHaveLength(0);
    });

    it('keeps the section hidden until the indoor data has loaded', () => {
        const subject = make();

        // Weather only -> still hidden, nothing rendered.
        subject.render(null, {temp: 26.7, humidity: 39.3});
        expect(section.hidden).toBe(true);
        expect(labels()).toHaveLength(0);

        // No data at all -> hidden.
        subject.render(null, null);
        expect(section.hidden).toBe(true);

        // Indoor data arrives -> revealed.
        subject.render([{roomName: 'Study', temperatureValue: 20, temperatureStale: false}], null);
        expect(section.hidden).toBe(false);
        expect(labelFor('Study')).not.toBeUndefined();
    });

    it('mutes a room whose readings are all stale', () => {
        const subject = make();
        subject.render([
            {roomName: 'Living room', temperatureValue: 27.3, temperatureStale: true, humidityValue: 50, humidityStale: true},
        ], null);

        const livingRoom = labelFor('Living room');
        expect(livingRoom.querySelector('.floor-plan__temp').classList.contains('floor-plan__temp--muted')).toBe(true);
        expect(livingRoom.querySelector('.floor-plan__humidity').classList.contains('floor-plan__humidity--muted')).toBe(true);
    });

    it('keeps a room fresh when only some of its devices are stale', () => {
        const subject = make();
        subject.render([
            {roomName: 'Living room', temperatureValue: 27.3, temperatureStale: true, humidityValue: 50, humidityStale: true},
            {roomName: 'Living room', temperatureValue: 26.0, temperatureStale: false, humidityValue: 52, humidityStale: false},
        ], null);

        const livingRoom = labelFor('Living room');
        expect(livingRoom.querySelector('.floor-plan__temp').classList.contains('floor-plan__temp--muted')).toBe(false);
        expect(livingRoom.querySelector('.floor-plan__humidity').classList.contains('floor-plan__humidity--muted')).toBe(false);
    });

    it('adds an outside label at each anchor once the indoor data is present', () => {
        const subject = make();
        subject.render([], {temp: 26.7, humidity: 39.3});

        const outside = labels().filter((label) => label.textContent.startsWith('Outside'));
        expect(outside).toHaveLength(2);
        expect(outside[0].querySelector('.floor-plan__temp').textContent).toContain('26.7°c');
        expect(outside[0].querySelector('.floor-plan__humidity').textContent).toContain('39%');
        expect(outside[0].style.top).toBe('3%');
        expect(outside[1].style.top).toBe('97%');
    });

    it('shows the outside temperature even when its humidity is missing', () => {
        const subject = make();
        subject.render([], {temp: 26.7});

        const outside = labelFor('Outside');
        expect(outside.querySelector('.floor-plan__temp').textContent).toContain('26.7°c');
        expect(outside.querySelector('.floor-plan__humidity')).toBeNull();
    });

    it('labels every anchored room by name when there are no readings at all', () => {
        const subject = make();
        subject.render([], {});
        expect(section.hidden).toBe(false);
        // No devices and weather with no temp: each anchored room still shows
        // its name, with no readings and no outside label.
        expect(labels()).toHaveLength(3);
        labels().forEach((label) => {
            expect(label.querySelector('.floor-plan__temp')).toBeNull();
            expect(label.querySelector('.floor-plan__humidity')).toBeNull();
        });
    });

    it('clears previous labels and re-hides on losing the indoor data', () => {
        const subject = make();
        subject.render([{roomName: 'Living room', temperatureValue: 26, temperatureStale: false}], {temp: 20});
        // Living room (with readings) + Study + Bathroom (name only) + 2 outside.
        expect(labels()).toHaveLength(5);

        subject.render(null, null);
        expect(labels()).toHaveLength(0);
        expect(section.hidden).toBe(true);
    });

    it('falls back to the anchor key when the catalogue has no floor label for it', () => {
        // A floor anchor whose key isn't in any catalogue's `floor` map renders
        // its key verbatim rather than blank.
        const subject = make(ROOM_ANCHORS, OUTSIDE_ANCHORS, { 'Attic': { 'x': 50, 'y': 1 } });
        subject.render([{ roomName: 'Study', temperatureValue: 20, temperatureStale: false }], null);

        expect(floorLabels().map((floor) => floor.textContent)).toEqual(['Attic']);
    });

    it('displays mapped room names for the locale (joining on the raw API name)', () => {
        const subject = make(ROOM_ANCHORS, OUTSIDE_ANCHORS, FLOOR_ANCHORS, DE_DE);
        subject.render([
            { roomName: 'Living room', temperatureValue: 26, temperatureStale: false },
            { roomName: 'Study', temperatureValue: 25, temperatureStale: false },
        ], null);

        // Joined on the raw 'Living room'/'Study' names, displayed localised.
        expect(labelFor('Wohnzimmer')).not.toBeUndefined();
        expect(labelFor('Arbeitszimmer')).not.toBeUndefined();
    });

    it('defaults to the real anchors when none are given', () => {
        section = document.createElement('div');
        container = document.createElement('div');
        container.className = 'floor-plan';
        section.append(container);
        document.body.append(section);
        const subject = new FloorPlan(section);
        subject.render([{roomName: 'Kitchen', temperatureValue: 24, temperatureStale: false}], {temp: 20});

        // All six real room anchors are labelled (Kitchen with its reading, the
        // rest name-only), plus two outside labels.
        expect(labels()).toHaveLength(8);
        expect(labels().some((l) => l.textContent.startsWith('Kitchen'))).toBe(true);
    });
});
