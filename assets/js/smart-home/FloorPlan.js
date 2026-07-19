'use strict';

import Temperature from './Temperature.js';
import Humidity from './Humidity.js';
import { averageTemperature, averageHumidity } from './averageReadings.js';

// Label anchor points as percentages of the floor-plan image, taken from the
// centre of each red room name in floor-plan-annotated.svg.
export const ROOM_ANCHORS = {
    'Hallway': {'x': 13.9, 'y': 31.4},
    'Kitchen': {'x': 33.5, 'y': 31.4},
    'Bathroom': {'x': 61.5, 'y': 20.6},
    'Study': {'x': 84, 'y': 32.4},
    'Living room': {'x': 25.2, 'y': 72.8},
    'Bedroom': {'x': 75.5, 'y': 77},
};

// The outside reading is shown at the two "Outside" markers (top and bottom),
// nudged out toward the edges from the annotated centres.
export const OUTSIDE_ANCHORS = [
    {'x': 50, 'y': 2.8},
    {'x': 50.5, 'y': 98},
];

// The floor headings, once part of the plan image but now drawn as overlay
// labels so they scale with the room readings (the embedded text stayed too
// small on mobile). Centres taken from floor-plan-reference.svg.
export const FLOOR_ANCHORS = {
    'Third floor': {'x': 24.8, 'y': 4.5},
    'Fourth floor': {'x': 73.8, 'y': 4.5},
};

export default class FloorPlan {
    #section;
    #dom;
    #roomAnchors;
    #outsideAnchors;
    #floorAnchors;

    /**
     * @param {HTMLElement} section The whole "Rooms" section, hidden until the
     *                              indoor data has loaded. Its `.floor-plan`
     *                              descendant holds the plan and its labels.
     * @param {Object}      roomAnchors
     * @param {Array}       outsideAnchors
     */
    constructor(section, roomAnchors = ROOM_ANCHORS, outsideAnchors = OUTSIDE_ANCHORS, floorAnchors = FLOOR_ANCHORS) {
        this.#section = section;
        this.#dom = section.querySelector('.floor-plan');
        this.#roomAnchors = roomAnchors;
        this.#outsideAnchors = outsideAnchors;
        this.#floorAnchors = floorAnchors;
    }

    /**
     * Renders the room and outside labels onto the plan. The whole section
     * stays hidden until the indoor (SmartThings) data has loaded — it is never
     * shown for weather data alone, or when the indoor data has failed to load.
     * Once shown, a room is only labelled when it appears in the indoor data,
     * and the outside reading is added as soon as the weather data arrives.
     *
     * @param {Object|null} homeData
     * @param {Object|null} weatherData
     */
    render(homeData, weatherData) {
        this.#clear();

        this.#section.hidden = !homeData;
        if (!homeData) {
            return;
        }

        // Floor headings are part of the plan, so they show whenever it does.
        for (const [name, anchor] of Object.entries(this.#floorAnchors)) {
            this.#addFloorLabel(anchor, name);
        }

        if (Array.isArray(homeData['devices'])) {
            const rooms = FloorPlan.#averageByRoom(homeData['devices']);
            for (const [roomName, anchor] of Object.entries(this.#roomAnchors)) {
                const room = rooms.get(roomName);
                if (room) {
                    this.#addLabel(anchor, roomName, room.temp, room.tempStale, room.humidity, room.humidityStale);
                }
            }
        }

        if (weatherData && 'temp' in weatherData) {
            for (const anchor of this.#outsideAnchors) {
                this.#addLabel(anchor, 'Outside', weatherData['temp'], false, weatherData['humidity'] ?? null, false);
            }
        }
    }

    /**
     * Removes any labels from a previous render.
     */
    #clear() {
        this.#dom.querySelectorAll('.floor-plan__label, .floor-plan__floor-label').forEach(
            (node) => node.remove()
        );
    }

    /**
     * Adds a static floor heading (e.g. "Third floor") at the given anchor.
     *
     * @param {Object} anchor
     * @param {String} text
     */
    #addFloorLabel(anchor, text) {
        const label = document.createElement('div');
        label.className = 'floor-plan__floor-label';
        label.style.left = anchor.x + '%';
        label.style.top = anchor.y + '%';
        label.textContent = text;

        this.#dom.append(label);
    }

    /**
     * Groups devices by room name and averages each room's temperature and
     * humidity (fresh readings preferred, stale used only as a fallback and
     * marked so). Rooms with no temperature reading are dropped.
     *
     * @param {Array} devices
     *
     * @return {Map}
     */
    static #averageByRoom(devices) {
        const grouped = new Map();
        for (const device of devices) {
            const roomName = device['roomName'];
            if (!roomName) {
                continue;
            }
            if (!grouped.has(roomName)) {
                grouped.set(roomName, []);
            }
            grouped.get(roomName).push(device);
        }

        const averaged = new Map();
        for (const [roomName, roomDevices] of grouped) {
            const temperature = averageTemperature(roomDevices);
            if (!temperature) {
                continue;
            }
            const humidity = averageHumidity(roomDevices);
            averaged.set(roomName, {
                'temp': temperature.value,
                'tempStale': temperature.stale,
                'humidity': humidity ? humidity.value : null,
                'humidityStale': humidity ? humidity.stale : false,
            });
        }

        return averaged;
    }

    /**
     * @param {Object}      anchor
     * @param {String}      name
     * @param {Number}      tempC
     * @param {Boolean}     tempStale
     * @param {Number|null} humidityPercent
     * @param {Boolean}     humidityStale
     */
    #addLabel(anchor, name, tempC, tempStale, humidityPercent, humidityStale) {
        const label = document.createElement('div');
        label.className = 'floor-plan__label';
        label.style.left = anchor.x + '%';
        label.style.top = anchor.y + '%';

        label.append(FloorPlan.#span(name, 'floor-plan__name'));
        label.append(FloorPlan.#span('🌡️ ' + (new Temperature(tempC)).formatC(), tempStale ? 'floor-plan__temp floor-plan__temp--muted' : 'floor-plan__temp'));
        if (humidityPercent !== null && humidityPercent !== undefined) {
            label.append(FloorPlan.#span('💧 ' + (new Humidity(humidityPercent)).formatPercent(), humidityStale ? 'floor-plan__humidity floor-plan__humidity--muted' : 'floor-plan__humidity'));
        }

        this.#dom.append(label);
    }

    /**
     * @param {String} text
     * @param {String} className
     *
     * @return {HTMLSpanElement}
     */
    static #span(text, className) {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = text;

        return span;
    }
}
