'use strict';

import { CLOCK_SPAN_ID, HOME_TEMP_TABLE_ID, WEATHER_TABLE_ID} from './index.const.js';

test('index.js', () => {
        let eventListeners = [];
        window.addEventListener = (...args) => {
                eventListeners.push(args);
        };
        const clockDom = document.createElement('span');
        clockDom.setAttribute('id', CLOCK_SPAN_ID);
        document.body.append(clockDom);
        const homeTempTableDom = document.createElement('table');
        homeTempTableDom.setAttribute('id', HOME_TEMP_TABLE_ID);
        document.body.append(homeTempTableDom);
        const weatherTableDom = document.createElement('table');
        weatherTableDom.setAttribute('id', WEATHER_TABLE_ID);
        document.body.append(weatherTableDom);

        require('./index.js');
        expect(eventListeners).toHaveLength(1);
        expect(eventListeners[0][0]).toBe('load');
        expect(typeof eventListeners[0][1]).toBe('function');
        eventListeners[0][1]();
        // @todo We need to add a lot of expects here
    }
);