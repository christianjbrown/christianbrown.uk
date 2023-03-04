'use strict'

import {
        COOKIES_ACCEPT_BUTTON_ID,
        COOKIES_DECLINE_BUTTON_ID,
        COOKIES_DIV_ID,
        DEV_CONSOLE_LINE_1,
        DEV_CONSOLE_LINE_1_STYLE,
        DEV_CONSOLE_LINE_2,
        DEV_CONSOLE_LINE_2_STYLE,
        GOOGLE_ANALYTICS_ID
} from './global.const.js';

test ('global.js',() => {
        let logs = [],
            windowEventListeners = [],
            cookieAcceptButtonEventListeners = [],
            cookieDeclineButtonEventListeners = []
        ;

        const cookiesAcceptButtonDom = document.createElement('button');
        cookiesAcceptButtonDom.setAttribute('id', COOKIES_ACCEPT_BUTTON_ID);
        document.body.append(cookiesAcceptButtonDom);
        const cookiesDeclineButtonDom = document.createElement('button');
        cookiesDeclineButtonDom.setAttribute('id', COOKIES_DECLINE_BUTTON_ID);
        document.body.append(cookiesDeclineButtonDom);
        const cookiesDivDom = document.createElement('div');
        cookiesDivDom.setAttribute('id', COOKIES_DIV_ID);
        document.body.append(cookiesDivDom);

        console.log = (...args) => {
                logs.push(args);
        };
        window.addEventListener = (...args) => {
                windowEventListeners.push(args);
        };
        cookiesAcceptButtonDom.addEventListener = (...args) => {
                cookieAcceptButtonEventListeners.push(args);
        };

        cookiesDeclineButtonDom.addEventListener = (...args) => {
                cookieDeclineButtonEventListeners.push(args);
        };

        require('./global.js');

        expect(windowEventListeners).toHaveLength(1);
        expect(windowEventListeners[0][0]).toBe('load');
        expect(typeof windowEventListeners[0][1]).toBe('function');
        windowEventListeners[0][1]();
        expect(logs).toHaveLength(2);
        expect(logs[0][0]).toBe('%c'+DEV_CONSOLE_LINE_1);
        expect(logs[0][1]).toBe(DEV_CONSOLE_LINE_1_STYLE);
        expect(logs[1][0]).toBe('%c'+DEV_CONSOLE_LINE_2);
        expect(logs[1][1]).toBe(DEV_CONSOLE_LINE_2_STYLE);
        // @todo We need to add a lot of expects here

        expect(cookieAcceptButtonEventListeners).toHaveLength(1);
        expect(cookieAcceptButtonEventListeners[0][0]).toBe('click');
        expect(typeof cookieAcceptButtonEventListeners[0][1]).toBe('function');
        // cookiesAcceptButtonDom[0][1]();
        // @todo We need to add a lot of expects here

        expect(cookieDeclineButtonEventListeners).toHaveLength(1);
        expect(cookieDeclineButtonEventListeners[0][0]).toBe('click');
        expect(typeof cookieDeclineButtonEventListeners[0][1]).toBe('function');
        // cookiesAcceptButtonDom[0][1]();
        // @todo We need to add a lot of expects here
    }
);