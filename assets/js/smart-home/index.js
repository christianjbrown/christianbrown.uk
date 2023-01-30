'use strict';

import Time from './time.js';
import SmartHomeFetchWrapper from './smart-home-fetch-wrapper.js';
import WeatherFetchWrapper from './weather-fetch-wrapper.js';

function updateTime() {
    const timeSpan = document.querySelector('#time');
    timeSpan.textContent = (new Time()).formatHour();
}

window.addEventListener('load',
    function() {
        const metWeatherFetchWrapper = new WeatherFetchWrapper();
        const smartHomeFetchWrapper = new SmartHomeFetchWrapper();

        metWeatherFetchWrapper.update();
        smartHomeFetchWrapper.update();
        updateTime();

        setInterval(
            function() {
                updateTime();
                smartHomeFetchWrapper.update();
            },
            60 * 1000
        );

        setInterval(metWeatherFetchWrapper.update,5 * 60 * 1000);
    }
);
