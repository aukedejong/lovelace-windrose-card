import {afterEach, beforeEach, describe, expect, test} from "@jest/globals";
import {FullTimeMatcher} from "./FullTimeMatcher";
import {Measurement} from "../../measurement-provider/Measurement";


describe('FullTimeMatcher tests', () => {

    const fullTimeMatcher = new FullTimeMatcher();
    let dateFuncBackup: () => number;
    const jestConsole = console;

    beforeEach(() => {
        global.console = require('console');
        dateFuncBackup = Date.now;
        Date.now = () => 10000;
    });

    afterEach(() => {
        Date.now = dateFuncBackup;
        global.console = jestConsole;
    });

    test('Merge empty history data', () => {
        const direction: Measurement[] = [];
        const speed: Measurement[] = [];
        const merged = fullTimeMatcher.match(direction, speed);

        expect(merged.getMeasurements()).toEqual([]);
    });

    test('Merge data, complete match', () => {
        const direction: Measurement[] = [
            {startTime: 1, endTime: 2, value: '10'},
            {startTime: 2, endTime: 3, value: '20'},
            {startTime: 3, endTime: 4, value: '30'},
            {startTime: 4, endTime: 5, value: '40'},
            {startTime: 5, endTime: 6, value: '50'},
        ];
        const speed: Measurement[] = [
            {startTime: 1, endTime: 2, value: '100'},
            {startTime: 2, endTime: 3, value: '200'},
            {startTime: 3, endTime: 4, value: '300'},
            {startTime: 4, endTime: 5, value: '400'},
            {startTime: 5, endTime: 6, value: '500'},
        ];
        const merged = fullTimeMatcher.match(direction, speed);

        expect(merged.getMeasurements()).toEqual([
            { "direction": "10", "seconds": 1, "speed": 100 },
            { "direction": "20", "seconds": 1, "speed": 200 },
            { "direction": "30", "seconds": 1, "speed": 300 },
            { "direction": "40", "seconds": 1, "speed": 400 },
            { "direction": "50", "seconds": 5, "speed": 500 },
        ]);
    });

    test('Merge data, direction start later, speed stop early', () => {
        const direction: Measurement[] = [
            {startTime: 2, endTime: 4, value: '100'},
            {startTime: 4, endTime: 5, value: '200'},
            {startTime: 5, endTime: 9, value: '300'},
            {startTime: 9, endTime: 10, value: '400'},
        ];
        const speed: Measurement[] = [
            {startTime: 1, endTime: 2, value: '10'},
            {startTime: 2, endTime: 4, value: '20'},
            {startTime: 4, endTime: 5, value: '30'},
        ];
        const merged = fullTimeMatcher.match(direction, speed);
        expect(merged.getMeasurements()).toEqual([
            { "direction": undefined, "seconds": 1, "speed": 10 },
            { "direction": "100", "seconds": 2, "speed": 20 },
            { "direction": "200", "seconds": 1, "speed": 30 },
            { "direction": "300", "seconds": 4, "speed": 30 },
            { "direction": "400", "seconds": 1, "speed": 30 },
        ]);
    });

    test('Merge data, less speed measurements', () => {
        const direction: Measurement[] = [
            { startTime: 1, endTime: 2, value: '10' },
            { startTime: 2, endTime: 3, value: '10' },
            { startTime: 3, endTime: 4, value: '10' },
            { startTime: 4, endTime: 5, value: '10' },
            { startTime: 5, endTime: 6, value: '10' },
        ];
        const speed: Measurement[] = [
            { startTime: 1, endTime: 3, value: '10' },
            { startTime: 3, endTime: 5, value: '10' },
            { startTime: 5, endTime: 6, value: '10' },
        ];
        const merged = fullTimeMatcher.match(direction, speed);

        expect(merged.getMeasurements()).toEqual([
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 5, "speed": 10 },
        ]);
    });

    test('Merge data, less direction measurements', () => {
        const direction: Measurement[] = [
            {startTime: 1, endTime: 3, value: '10'},
            {startTime: 3, endTime: 5, value: '10'},
            {startTime: 5, endTime: 6, value: '10'},
        ];
        const speed: Measurement[] = [
            {startTime: 1, endTime: 2, value: '10'},
            {startTime: 2, endTime: 3, value: '10'},
            {startTime: 3, endTime: 4, value: '10'},
            {startTime: 4, endTime: 5, value: '10'},
            {startTime: 5, endTime: 6, value: '10'} ,
        ];
        const merged = fullTimeMatcher.match(direction, speed);

        expect(merged.getMeasurements()).toEqual([
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 5, "speed": 10 },
        ]);
    });

    test('Merge data, undefined measurements', () => {
        const direction: Measurement[] = [
            {startTime: 1, endTime: 2, value: '100'},
            {startTime: 2, endTime: 3, value: '200'},
            {startTime: 3, endTime: 4, value: ''},
            {startTime: 4, endTime: 5, value: '300'},
            {startTime: 5, endTime: 6, value: '400'},
        ];
        const speed: Measurement[] = [
            {startTime: 1, endTime: 2, value: '10'},
            {startTime: 2, endTime: 3, value: '20'},
            {startTime: 3, endTime: 4, value: '30'},
            {startTime: 4, endTime: 5, value: ''},
            {startTime: 5, endTime: 6, value: '50'},
        ];
        const merged = fullTimeMatcher.match(direction, speed);

        expect(merged.getMeasurements()).toEqual([
            { "direction": "100", "seconds": 1, "speed": 10 },
            { "direction": "200", "seconds": 1, "speed": 20 },
            { "direction": "200", "seconds": 1, "speed": 30 },
            { "direction": "300", "seconds": 1, "speed": 30 },
            { "direction": "400", "seconds": 5, "speed": 50 },
        ]);
    });
});
