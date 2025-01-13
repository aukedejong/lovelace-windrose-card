import {afterEach, beforeEach, describe, expect, test} from "@jest/globals";
import {FullTimeMatcher} from "./FullTimeMatcher";


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
        const direction: HistoryData[] = [];
        const speed: HistoryData[] = [];
        const merged = fullTimeMatcher.matchHistoryHistory(direction, speed);

        expect(merged.getMeasurements()).toEqual([]);
    });

    test('Merge data, complete match', () => {
        const direction: HistoryData[] = [
            {lu: 1, s: '10'},
            {lu: 2, s: '10'},
            {lu: 3, s: '10'},
            {lu: 4, s: '10'},
            {lu: 5, s: '10'},
        ];
        const speed: HistoryData[] = [
            {lu: 1, s: '10'},
            {lu: 2, s: '10'},
            {lu: 3, s: '10'},
            {lu: 4, s: '10'},
            {lu: 5, s: '10'},
        ];
        const merged = fullTimeMatcher.matchHistoryHistory(direction, speed);

        expect(merged.getMeasurements()).toEqual([
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 5, "speed": 10 },
        ]);
    });

    test('Merge data, direction start later, speed stop early', () => {
        const direction: HistoryData[] = [
            {lu: 2, s: '100'},
            {lu: 4, s: '200'},
            {lu: 5, s: '300'},
            {lu: 9, s: '400'},
        ];
        const speed: HistoryData[] = [
            {lu: 1, s: '10'},
            {lu: 2, s: '20'},
            {lu: 4, s: '30'},
        ];
        const merged = fullTimeMatcher.matchHistoryHistory(direction, speed);
        expect(merged.getMeasurements()).toEqual([
            { "direction": undefined, "seconds": 1, "speed": 10 },
            { "direction": "100", "seconds": 2, "speed": 20 },
            { "direction": "200", "seconds": 1, "speed": 30 },
            { "direction": "300", "seconds": 4, "speed": 30 },
            { "direction": "400", "seconds": 1, "speed": 30 },
        ]);
    });

    test('Merge data, less speed measurements', () => {
        const direction: HistoryData[] = [
            { lu: 1, s: '10' },
            { lu: 2, s: '10' },
            { lu: 3, s: '10' },
            { lu: 4, s: '10' },
            { lu: 5, s: '10' },
        ];
        const speed: HistoryData[] = [
            { lu: 1, s: '10' },
            { lu: 3, s: '10' },
            { lu: 5, s: '10' },
        ];
        const merged = fullTimeMatcher.matchHistoryHistory(direction, speed);

        expect(merged.getMeasurements()).toEqual([
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 5, "speed": 10 },
        ]);
    });

    test('Merge data, less direction measurements', () => {
        const direction: HistoryData[] = [
            {lu: 1, s: '10'},
            {lu: 3, s: '10'},
            {lu: 5, s: '10'},
        ];
        const speed: HistoryData[] = [
            {lu: 1, s: '10'},
            {lu: 2, s: '10'},
            {lu: 3, s: '10'},
            {lu: 4, s: '10'},
            {lu: 5, s: '10'},
        ];
        const merged = fullTimeMatcher.matchHistoryHistory(direction, speed);

        expect(merged.getMeasurements()).toEqual([
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 1, "speed": 10 },
            { "direction": "10", "seconds": 5, "speed": 10 },
        ]);
    });

    test('Merge data, undefined measurements', () => {
        const direction: HistoryData[] = [
            {lu: 1, s: '100'},
            {lu: 2, s: '200'},
            {lu: 3, s: ''},
            {lu: 4, s: '300'},
            {lu: 5, s: '400'},
        ];
        const speed: HistoryData[] = [
            {lu: 1, s: '10'},
            {lu: 2, s: '20'},
            {lu: 3, s: '30'},
            {lu: 4, s: ''},
            {lu: 5, s: '50'},
        ];
        const merged = fullTimeMatcher.matchHistoryHistory(direction, speed);

        expect(merged.getMeasurements()).toEqual([
            { "direction": "100", "seconds": 1, "speed": 10 },
            { "direction": "200", "seconds": 1, "speed": 20 },
            { "direction": "200", "seconds": 1, "speed": 30 },
            { "direction": "300", "seconds": 1, "speed": 30 },
            { "direction": "400", "seconds": 5, "speed": 50 },
        ]);
    });
});
