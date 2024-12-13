import {afterEach, beforeEach, describe, expect, test} from "@jest/globals";
import {WindDirectionLettersConverter} from "./WindDirectionLettersConverter";

describe('WindDirectionLettersConverter tests', () => {

    const windDirectionLettersConverter = new WindDirectionLettersConverter('NOZWX');
    const jestConsole = console;

    beforeEach(() => {
        global.console = require('console');
        Date.now = () => 10000;
    });

    afterEach(() => {
        global.console = jestConsole;
    });

    describe('Test convert letters to degrees.', () => {

        test('Convert N to degrees', () => {
            expect(windDirectionLettersConverter.convertToDegrees('N')).toEqual(0);
        });

        test('Convert ZOXO to degrees.', () => {
           expect(windDirectionLettersConverter.convertToDegrees('ZOXO')).toEqual(123.75)
        });

    });

    describe('Test degrees letters to letters.', () => {

        test('Convert 0 degrees to letters', () => {
            expect(windDirectionLettersConverter.convertToLetters(0)).toEqual('N');
        });

        test('Convert 5 degrees to letters', () => {
            expect(windDirectionLettersConverter.convertToLetters(5)).toEqual('N');
        });

        test('Convert 6 degrees to letters', () => {
            expect(windDirectionLettersConverter.convertToLetters(6)).toEqual('NXO');
        });

        test('Convert 11 degrees to letters', () => {
            expect(windDirectionLettersConverter.convertToLetters(6)).toEqual('NXO');
        });

        test('Convert undefined degrees to letters', () => {
            expect(windDirectionLettersConverter.convertToLetters(undefined)).toEqual('CALM');
        });
    });
});
