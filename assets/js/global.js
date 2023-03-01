'use strict';

import Cookie from './cookie.js';

const DROIDS = `
                                                                                                                        _
_|_ |_   _   _  _    _. ._ _   ._   _ _|_  _|_ |_   _    _| ._ _  o  _|  _      _     /._ _   |  _   _  |  o ._   _   _|_ _  ._
 |_ | | (/_ _> (/_  (_| | (/_  | | (_) |_   |_ | | (/_  (_| | (_) | (_| _>  \\/ (_) |_| | (/_  | (_) (_) |< | | | (_|   | (_) |
                                                                            /                                     _|
`;

const cookiesDialog = document.getElementById('cookies');
document.getElementById('cookies-accept').addEventListener('click',
    () => {
        cookiesDialog.style.display = 'none';
        Cookie.setConsent(true);
        setOptionalCookies();
    }
);
document.getElementById('cookies-decline').addEventListener('click',
    () => {
        cookiesDialog.style.display = 'none';
        Cookie.setConsent(false);
    }
);

window.addEventListener('load',
    () => {
        console.log('%c'+DROIDS, 'color: purple; font-weight: bold;');
        console.log('%c but maybe you\'re looking for an engineering manager? you\'ve come to right place!', 'color: #75923C; font-weight: bold;');

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
                cookiesDialog.style.display = 'flex';
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
    gtag('config', 'G-9Z9L9Z6QHQ');
}
