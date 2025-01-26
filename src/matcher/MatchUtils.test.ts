import {beforeEach, describe, expect, test} from "@jest/globals";
import {Measurement} from "../measurement-provider/Measurement";
import {MatchUtils} from "./MatchUtils";


describe('MatchUtils tests', () => {

    let measurements: Measurement[];

    beforeEach(() => {
        global.console = require('console');
        measurements = [
            {startTime: 1, endTime: 2, value: '1.0'},
            {startTime: 2, endTime: 3, value: '2.0'},
            {startTime: 3, endTime: 4, value: '3.0'},
            {startTime: 4, endTime: 5, value: '4.0'},
            {startTime: 5, endTime: 6, value: '5.0'},
            {startTime: 1736451283.656883, endTime: 1736451256.114, value: '6.0'}
        ];
        Date.now = () => 10000;
    });

    test('find measurement, first', () => {
        const m = MatchUtils.findMeasurementAtTime(1.5, measurements);
        console.log('M', m);
        expect(m?.value).toEqual("1.0");
    });

    test('find measurement, border first', () => {
        const m = MatchUtils.findMeasurementAtTime(3, measurements);
        console.log('M', m);
        expect(m?.value).toEqual("2.0");
    });

    test('find measurement, border last', () => {
        const m = MatchUtils.findMeasurementAtTime(4, measurements);
        console.log('M', m);
        expect(m?.value).toEqual("3.0");
    });

    test('find measurement last', () => {
        const m = MatchUtils.findMeasurementAtTime(5.5, measurements);
        console.log('M', m);
        expect(m?.value).toEqual("5.0");
    });
});
