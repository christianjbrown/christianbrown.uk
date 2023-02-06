'use strict';

import Time from './time.js';
import WeatherTable from './weather-table.js';
import HomeTemperatureTable from './home-temperature-table.js'

const WEATHER_API_IS_DEV = false;
const WEATHER_API_URL_PROD = 'https://christianbrown.global.ssl.fastly.net/get-met-office-temps';
const WEATHER_API_URL_DEV = 'http://localhost:8080/';
const WEATHER_API_URL = WEATHER_API_IS_DEV ? WEATHER_API_URL_DEV : WEATHER_API_URL_PROD;
const WEATHER_TABLE_SELECTOR = '#weather-table';

const HOME_TEMP_API_IS_DEV = false;
const HOME_TEMP_API_URL_PROD = 'https://christianbrown.global.ssl.fastly.net/get-smart-home-temps';
const HOME_TEMP_API_URL_DEV = 'http://localhost:8080/';
const HOME_TEMP_API_URL = HOME_TEMP_API_IS_DEV ? HOME_TEMP_API_URL_DEV : HOME_TEMP_API_URL_PROD;
const HOME_TEMP_TABLE_SELECTOR = '#home-temperature-table';

async function updateTime() {
    const timeSpan = document.querySelector('#time');
    timeSpan.textContent = (new Time()).formatHour();
}

window.addEventListener('load',
    async () => {
        const weatherTableDom = document.querySelector(WEATHER_TABLE_SELECTOR);
        const weatherTable = new WeatherTable(weatherTableDom, WEATHER_API_URL);
        const smartHomeTableDom = document.querySelector(HOME_TEMP_TABLE_SELECTOR);
        const smartHomeTable = new HomeTemperatureTable(smartHomeTableDom, HOME_TEMP_API_URL);

        await Promise.all(
            [
                weatherTable.update(),
                smartHomeTable.update(),
                updateTime(),
            ]
        );

        setInterval(
            async () => {
                await Promise.all(
                    [
                        smartHomeTable.update(),
                        updateTime(),
                    ]
                );
            },
            60 * 1000
        );
        setInterval(weatherTable.update,5 * 60 * 1000);
    }
);
