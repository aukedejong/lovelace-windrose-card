import {afterEach, beforeEach, describe, expect, test} from "@jest/globals";
import {WindDirectionLettersConverter} from "./WindDirectionLettersConverter";

describe('WindDirectionLettersConverter tests', () => {

    const jestConsole = console;

    beforeEach(() => {
        global.console = require('console');
        Date.now = () => 10000;
    });

    afterEach(() => {
        global.console = jestConsole;
    });


    describe('Test directions width default direction letters', () => {

        const windDirectionLettersConverter = new WindDirectionLettersConverter(undefined);

        describe('Test convert letters to degrees.', () => {

            test('Convert N to degrees', () => {
                expect(windDirectionLettersConverter.convertToDegrees('N')).toEqual(0);
            });

            test('Convert ZOO to degrees.', () => {
                expect(windDirectionLettersConverter.convertToDegrees('SSE')).toEqual(157.50);
            });

        });

        describe('Test invalid degrees letters to letters.', () => {

            test('Convert abcd degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters('abcd')).toEqual('CALM');
            });

            test('Convert -230 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(-234)).toEqual('CALM');
            });

            test('Convert empty string degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters('')).toEqual('CALM');
            });

        });

        describe('Test degrees letters to letters.', () => {

            test('Convert 354 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(354)).toEqual('N');
            });

            test('Convert 355 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(355)).toEqual('N');
            });

            test('Convert 359 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(359)).toEqual('N');
            });

            test('Convert 0 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(0)).toEqual('N');
            });

            test('Convert 5 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(5)).toEqual('N');
            });

            test('Convert 6 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(6)).toEqual('N');
            });

            test('Convert 11 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(6)).toEqual('N');
            });

            test('Convert undefined degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(undefined)).toEqual('CALM');
            });
        });
    });

    describe('Test directions width 4 direction letters', () => {

        const windDirectionLettersConverter = new WindDirectionLettersConverter('NOZW');

        describe('Test convert letters to degrees.', () => {

            test('Convert N to degrees', () => {
                expect(windDirectionLettersConverter.convertToDegrees('N')).toEqual(0);
            });

            test('Convert ZOO to degrees.', () => {
                expect(windDirectionLettersConverter.convertToDegrees('ZZO')).toEqual(157.50);
            });

        });

        describe('Test degrees letters to letters.', () => {

            test('Convert 348 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(348)).toEqual('NNW');
            });

            test('Convert 349 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(349)).toEqual('N');
            });

            test('Convert 359 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(359)).toEqual('N');
            });

            test('Convert 0 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(0)).toEqual('N');
            });

            test('Convert 11 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(11)).toEqual('N');
            });

            test('Convert 12 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(12)).toEqual('NNO');
            });

            test('Convert 33 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(33)).toEqual('NNO');
            });

            test('Convert 34 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(34)).toEqual('NO');
            });

            test('Convert undefined degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(undefined)).toEqual('CALM');
            });
        });
    });

    describe('Test directions width 5 direction letters', () => {

        const windDirectionLettersConverter = new WindDirectionLettersConverter('NOZWX');

        describe('Test convert letters to degrees.', () => {

            test('Convert N to degrees', () => {
                expect(windDirectionLettersConverter.convertToDegrees('N')).toEqual(0);
            });

            test('Convert ZOXO to degrees.', () => {
                expect(windDirectionLettersConverter.convertToDegrees('ZOXO')).toEqual(123.75)
            });

        });

        describe('Test degrees letters to letters.', () => {

            test('Convert 354 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(354)).toEqual('NXW');
            });

            test('Convert 355 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(355)).toEqual('N');
            });

            test('Convert 359 degrees to letters', () => {
                expect(windDirectionLettersConverter.convertToLetters(359)).toEqual('N');
            });

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

});
