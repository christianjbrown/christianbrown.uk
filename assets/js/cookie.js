'use strict';

export default class Cookie
{
    needs
    /**
     * @param {string} name
     *
     * @returns {string}
     */
    get(name) {
        let c = document.cookie.match(`(?:(?:^|.*; *)${name} *= *([^;]*).*$)|^.*$`)[1]
        if (c) return decodeURIComponent(c)
    }

    /**
     * @param {string} name
     * @param {string} value
     * @param {Object} opts
     */
    set(name, value, opts = []) {
        // opts['max-age'] = days * 60 * 60 * 24;
        opts = Object.entries(opts).reduce(
            (accumulatedStr, [k, v]) => `${accumulatedStr}; ${k}=${v}`, ''
        )
        document.cookie = name+'='+encodeURIComponent(value)+opts
    }

    /**
     * @param {string} name
     * @param {Array}  opts
     */
    delete(name, opts) {
        this.set(name, '', {'max-age': -1, ...opts});
    }
}
