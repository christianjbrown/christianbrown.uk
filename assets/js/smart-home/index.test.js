'use strict'

test ('index.js',() => {
        let eventListeners = [];
        window.addEventListener = (...args) => {
                eventListeners.push(args);
        };
        require('./index.js');
        expect(eventListeners).toHaveLength(1);
        expect(eventListeners[0][0]).toBe('load');
        expect(typeof eventListeners[0][1]).toBe('function');
        eventListeners[0][1]()
    }
);