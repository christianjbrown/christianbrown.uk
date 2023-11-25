'use strict';

import Cookie from './Cookie.js';
import {
    COOKIES_ACCEPT_BUTTON_ID,
    COOKIES_DECLINE_BUTTON_ID,
    COOKIES_DIV_ID,
    DEV_CONSOLE_LINE_1,
    DEV_CONSOLE_LINE_1_STYLE,
    DEV_CONSOLE_LINE_2,
    DEV_CONSOLE_LINE_2_STYLE,
    GOOGLE_ANALYTICS_ID
} from '/config/global.const.js';

const cookiesDivDom = document.getElementById(COOKIES_DIV_ID);
const cookiesAcceptButtonDom = document.getElementById(COOKIES_ACCEPT_BUTTON_ID);
const cookiesDeclineButtonDom = document.getElementById(COOKIES_DECLINE_BUTTON_ID);

cookiesAcceptButtonDom.addEventListener('click',
    () => {
        cookiesDivDom.style.display = 'none';
        Cookie.setConsent(true);
        setCookies();
    }
);
cookiesDeclineButtonDom.addEventListener('click',
    () => {
        cookiesDivDom.style.display = 'none';
        Cookie.deleteAll();
        Cookie.setConsent(false);
    }
);

window.addEventListener('load',
    async() => {
        console.log('%c'+DEV_CONSOLE_LINE_1, DEV_CONSOLE_LINE_1_STYLE);
        console.log('%c'+DEV_CONSOLE_LINE_2, DEV_CONSOLE_LINE_2_STYLE);

        const needsConsent = await Cookie.needsConsent();
        if (needsConsent) {
            const consent= Cookie.getConsent();
            if (consent === null) {
                cookiesDivDom.style.display = 'flex';
            } else if (consent === true) {
                setCookies();
            }
        } else {
            setCookies();
        }
    }
);

function setCookies() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GOOGLE_ANALYTICS_ID);
}
