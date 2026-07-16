'use strict';

import Temperature from './Temperature.js';
import Humidity from './Humidity.js';

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

export default class FloorPlan {
    #dom;
    #roomAnchors;
    #outsideAnchors;

    /**
     * @param {HTMLElement} dom
     * @param {Object}      roomAnchors
     * @param {Array}       outsideAnchors
     */
    constructor(dom, roomAnchors = ROOM_ANCHORS, outsideAnchors = OUTSIDE_ANCHORS) {
        this.#dom = dom;
        this.#roomAnchors = roomAnchors;
        this.#outsideAnchors = outsideAnchors;
    }

    /**
     * Renders the room and outside labels onto the plan. A room is only
     * labelled when it appears in the indoor data; if that data is missing no
     * room labels are shown at all. The outside reading is likewise only shown
     * when the weather data is present.
     *
     * @param {Object|null} homeData
     * @param {Object|null} weatherData
     */
    render(homeData, weatherData) {
        this.#clear();

        if (homeData && Array.isArray(homeData['devices'])) {
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
        this.#dom.querySelectorAll('.floor-plan-label').forEach(
            (node) => node.remove()
        );
    }

    /**
     * Groups devices by room name and averages their temperature and humidity.
     * A reading is treated as stale only when every device contributing to it
     * is stale. Rooms with no temperature reading are dropped.
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
                grouped.set(roomName, {'temps': [], 'tempStale': [], 'humidities': [], 'humidityStale': []});
            }
            const room = grouped.get(roomName);
            if (typeof device['temperatureValue'] === 'number') {
                room.temps.push(device['temperatureValue']);
                room.tempStale.push(device['temperatureStale'] === true);
            }
            if (typeof device['humidityValue'] === 'number') {
                room.humidities.push(device['humidityValue']);
                room.humidityStale.push(device['humidityStale'] === true);
            }
        }

        const averaged = new Map();
        for (const [roomName, room] of grouped) {
            if (room.temps.length === 0) {
                continue;
            }
            averaged.set(roomName, {
                'temp': FloorPlan.#average(room.temps),
                'tempStale': room.tempStale.every(Boolean),
                'humidity': room.humidities.length ? FloorPlan.#average(room.humidities) : null,
                'humidityStale': room.humidities.length ? room.humidityStale.every(Boolean) : false,
            });
        }

        return averaged;
    }

    /**
     * @param {Array<Number>} values
     *
     * @return {Number}
     */
    static #average(values) {
        return values.reduce((sum, value) => sum + value, 0) / values.length;
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
        label.className = 'floor-plan-label';
        label.style.left = anchor.x + '%';
        label.style.top = anchor.y + '%';

        label.append(FloorPlan.#span(name, 'floor-plan-name'));
        label.append(FloorPlan.#span('🌡️ ' + (new Temperature(tempC)).formatC(), tempStale ? 'floor-plan-temp muted' : 'floor-plan-temp'));
        if (humidityPercent !== null && humidityPercent !== undefined) {
            label.append(FloorPlan.#span('💧 ' + (new Humidity(humidityPercent)).formatPercent(), humidityStale ? 'floor-plan-humidity muted' : 'floor-plan-humidity'));
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
