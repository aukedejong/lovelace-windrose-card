import {afterEach, beforeEach, describe, expect, test} from "@jest/globals";
import {PeriodCodeHelper} from "./PeriodCodeHelper";

describe('PeriodCodeHelper tests', () => {

    const jestConsole = console;

    beforeEach(() => {
        global.console = require('console');
        Date.now = () => 10000;
    });

    afterEach(() => {
        global.console = jestConsole;
    });

    describe('Check correct period codes', () => {

        test('Simple code', () => {
           expect(PeriodCodeHelper.check('', '+2h')).toBeTruthy();
        });

        test('Two units code', () => {
            expect(PeriodCodeHelper.check('', '+2h-3w')).toBeTruthy();
        });

        test('Two units, minus add plus', () => {
            expect(PeriodCodeHelper.check('', '-2y-1q')).toBeTruthy(); //-2y-1q
        });
    });

    describe('Check to hours', () => {

        test('Hours to hours', () => {
            expect(PeriodCodeHelper.toHours('+2h')).toEqual(2);
        });

        test('Days to hours', () => {
            expect(PeriodCodeHelper.toHours('-2d')).toEqual(-48);
        });

        test('Weeks to hours', () => {
            expect(PeriodCodeHelper.toHours('+2w')).toEqual(14 * 24);
        });

        test('Months to hours', () => {
            expect(PeriodCodeHelper.toHours('+2m')).toEqual(31 * 24 * 2);
        });

        test('Combi to hours', () => {
            expect(PeriodCodeHelper.toHours('+2m+1d+4h')).toEqual(31 * 24 * 2 + 24 + 4);
        });
    });

    describe('Check incorrect period codes', () => {

        test('Simple code', () => {
            expect(() => PeriodCodeHelper.check('cfgName', '2h')).toThrow('WindRoseCard: wrong cfgName code, example \'-2w-5h\' means minus 2 weeks and 5 hours');
        });

        test('Two units code, wrong sign', () => {
            expect(() => PeriodCodeHelper.check('cfgName', '=2h-3w')).toThrow('WindRoseCard: wrong cfgName code, example \'-2w-5h\' means minus 2 weeks and 5 hours');
        });

        test('Two units, wrong unit', () => {
            expect(() => PeriodCodeHelper.check('cfgName', '-2z-1q')).toThrow('WindRoseCard: wrong cfgName code, example \'-2w-5h\' means minus 2 weeks and 5 hours');
        });

        test('Two units, forgotten value', () => {
            expect(() => PeriodCodeHelper.check('cfgName', '-2z-q')).toThrow('WindRoseCard: wrong cfgName code, example \'-2w-5h\' means minus 2 weeks and 5 hours');
        });

        test('Two units, forgotten sign', () => {
            expect(() => PeriodCodeHelper.check('cfgName', '-2d2q')).toThrow('WindRoseCard: wrong cfgName code, example \'-2w-5h\' means minus 2 weeks and 5 hours');
        });

        test('Empty', () => {
            expect(PeriodCodeHelper.check('cfgName', '')).toBeFalsy();
        });

        test('Undefined', () => {
            expect(PeriodCodeHelper.check('cfgName', undefined)).toBeFalsy();
        });
    });

    describe('Move date', () => {

        test('+2h', () => {
            expect(PeriodCodeHelper.move("+2h", new Date(2026,2,15)))
                .toEqual(new Date(2026,2,15, 2, 0, 0));
        });

        test('+3d', () => {
            expect(PeriodCodeHelper.move("+3d", new Date(2026,1,1)))
                .toEqual(new Date(2026,1,4));
        });

        test('+4w', () => {
            expect(PeriodCodeHelper.move("+4w", new Date(2026,6,1)))
                .toEqual(new Date(2026,6,29));
        });

        test('+3m', () => {
            expect(PeriodCodeHelper.move("+3m", new Date(2026,2,10)))
                .toEqual(new Date(2026,5, 10));
        });

        test('+1q', () => {
            expect(PeriodCodeHelper.move("+1q", new Date(2026,2,10)))
                .toEqual(new Date(2026,5,10));
        });

        test('+3y', () => {
            expect(PeriodCodeHelper.move("+3y", new Date(2026,2,10)))
                .toEqual(new Date(2029,2,10));
        });

        test('+2h+3d', () => {
            expect(PeriodCodeHelper.move("+2h+3d", new Date(2026,2,10)))
                .toEqual(new Date(2026,2,13, 2, 0, 0));
        });

        test('-10h+3d', () => {
            expect(PeriodCodeHelper.move("-10h+3d", new Date(2026,2,10, 5, 0, 0)))
                .toEqual(new Date(2026,2,12, 19, 0, 0));
        });

    });

});
