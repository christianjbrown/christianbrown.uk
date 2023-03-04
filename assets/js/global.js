'use strict';

import Cookie from './cookie.js';
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

const cookiesDivDom = document.getElementById(COOKIES_DIV_ID);
const cookiesAcceptButtonDom = document.getElementById(COOKIES_ACCEPT_BUTTON_ID);
const cookiesDeclineButtonDom = document.getElementById(COOKIES_DECLINE_BUTTON_ID);

cookiesAcceptButtonDom.addEventListener('click',
    () => {
        cookiesDivDom.style.display = 'none';
        Cookie.setConsent(true);
        setOptionalCookies();
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
    () => {
        console.log('%c'+DEV_CONSOLE_LINE_1, DEV_CONSOLE_LINE_1_STYLE);
        console.log('%c'+DEV_CONSOLE_LINE_2, DEV_CONSOLE_LINE_2_STYLE);

        const params = new Proxy(
            new URLSearchParams(window.location.search),
            {
                /**
                 * @param {URLSearchParams} searchParams
                 * @param {string}          prop
                 *
                 * @returns {string}
                 */
                get: (searchParams, prop) => searchParams.get(prop)
            }
        );
        let wantsToSeeCookieMonster = params.showCookieConsent === '1';

        if (Cookie.needsConsent() || wantsToSeeCookieMonster) {
            const consent = Cookie.getConsent();
            if (consent === null || wantsToSeeCookieMonster) {
                cookiesDivDom.style.display = 'flex';
            } else if (consent === true) {
                setOptionalCookies();
            }
        } else {
            setOptionalCookies();
        }
    }
);

function setOptionalCookies() {
    setGoogleAnalyticsCookies();
}

function setGoogleAnalyticsCookies() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GOOGLE_ANALYTICS_ID);
}
