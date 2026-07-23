import { describe, it, expect, afterEach } from 'vitest';
import { readChartColors } from './chartColors.js';

const PROPS = ['--cc-inside', '--cc-inside-fill', '--cc-outside', '--cc-grid', '--cc-axis', '--cc-text'];

afterEach(() => {
    PROPS.forEach((prop) => document.documentElement.style.removeProperty(prop));
});

describe('chartColors', () => {
    it('reads every chart token off the document root, trimmed', () => {
        document.documentElement.style.setProperty('--cc-inside', '  #75923c ');
        document.documentElement.style.setProperty('--cc-inside-fill', 'rgba(117,146,60,.18)');
        document.documentElement.style.setProperty('--cc-outside', '#555');
        document.documentElement.style.setProperty('--cc-grid', '#aaa');
        document.documentElement.style.setProperty('--cc-axis', '#aaa');
        document.documentElement.style.setProperty('--cc-text', '#222');

        expect(readChartColors()).toEqual({
            inside: '#75923c',
            insideFill: 'rgba(117,146,60,.18)',
            outside: '#555',
            grid: '#aaa',
            axis: '#aaa',
            text: '#222',
        });
    });

    it('accepts an explicit root element', () => {
        const el = document.createElement('div');
        el.style.setProperty('--cc-inside', '#a3c76d');
        document.body.appendChild(el);

        expect(readChartColors(el).inside).toBe('#a3c76d');

        el.remove();
    });
});
