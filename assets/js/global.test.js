// 'use strict'
//
// test ('global.js',() => {
//         let infos = [], eventListeners = [];
//         console.info = (...args) => {
//                 infos.push(args);
//         };
//         window.addEventListener = (...args) => {
//                 eventListeners.push(args);
//         };
//         require('./global.js');
//         expect(infos).toHaveLength(0);
//         expect(eventListeners).toHaveLength(1);
//         expect(eventListeners[0][0]).toBe('load');
//         expect(typeof eventListeners[0][1]).toBe('function');
//         eventListeners[0][1]();
//         expect(infos).toHaveLength(6);
//     }
// );