import {afterEach, beforeEach, describe, expect, test} from "@jest/globals";
import {WindBarRangeCalcUtil} from "./WindBarRangeCalcUtil";
import {SpeedRange} from "../speed-range/SpeedRange";

describe('WindBarRangeCalcUtil tests', () => {

    const jestConsole = console;

    beforeEach(() => {
        global.console = require('console');
        Date.now = () => 10000;
    });

    afterEach(() => {
        global.console = jestConsole;
    });

    describe('determinSegmentCount', () => {

        test('4 of 6 segments, full', () => {
            const percentages = [0, 10, 0, 10, 0, 0];
            expect(WindBarRangeCalcUtil.determineSegmentCount(percentages, true)).toEqual(6);
        });

        test('4 of 6 segments, not full', () => {
            const percentages = [0, 10, 0, 10, 0, 0];
            expect(WindBarRangeCalcUtil.determineSegmentCount(percentages, false)).toEqual(4);
        });

        test('4 of 4 segments, full', () => {
            const percentages = [0, 10, 0, 10];
            expect(WindBarRangeCalcUtil.determineSegmentCount(percentages, true)).toEqual(4);
        });

        test('4 of 4 segments, not full', () => {
            const percentages = [0, 10, 0, 10];
            expect(WindBarRangeCalcUtil.determineSegmentCount(percentages, false)).toEqual(4);
        });

        test('0 of 4 segments, full', () => {
            const percentages = [0, 0, 0, 0];
            expect(WindBarRangeCalcUtil.determineSegmentCount(percentages, true)).toEqual(4);
        });

        test('0 of 4 segments, not full', () => {
            const percentages = [0, 0, 0, 0];
            expect(WindBarRangeCalcUtil.determineSegmentCount(percentages, false)).toEqual(4);
        });

        test('0 of 0 segments, full', () => {
            const percentages: number[] = [];
            expect(WindBarRangeCalcUtil.determineSegmentCount(percentages, true)).toEqual(0);
        });

        test('0 of 0 segments, not full', () => {
            const percentages: number[] = [];
            expect(WindBarRangeCalcUtil.determineSegmentCount(percentages, false)).toEqual(0);
        });
    });

    describe('calcAbsoluteSegments tests', () => {

        describe('calcFixedSizeSegments, show all segments tests', () => {

            test('Segment calculation equal segments, start 0', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 20, ''),
                    new SpeedRange(0, 20, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcFixedSizeSegments(speedRanges, 0, 4, false, 4);

                console.log('Segments', segments);
                expect(segments.length).toEqual(4);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);
                expect(segments[2].minSpeed).toEqual(20);
                expect(segments[3].minSpeed).toEqual(30);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(20);
                expect(segments[2].maxSpeed).toEqual(30);
                expect(segments[3].maxSpeed).toEqual(40);

                expect(segments[0].start).toEqual(0);
                expect(segments[1].start).toEqual(1);
                expect(segments[2].start).toEqual(2);
                expect(segments[3].start).toEqual(3);

                expect(segments[0].end).toEqual(1);
                expect(segments[1].end).toEqual(2);
                expect(segments[2].end).toEqual(3);
                expect(segments[3].end).toEqual(4);

                expect(segments[0].scale).toEqual(0.1);
                expect(segments[1].scale).toEqual(0.1);
                expect(segments[2].scale).toEqual(0.1);
                expect(segments[3].scale).toEqual(0.1);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
                expect(segments[2].showLastLabel).toBeTruthy();
                expect(segments[3].showLastLabel).toBeFalsy();
            });

            test('Segment calculation non equals ranges, start 0', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 25, ''),
                    new SpeedRange(0, 25, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcFixedSizeSegments(speedRanges, 0, 40, false, 4);

                console.log('Segments', segments);
                expect(segments.length).toEqual(4);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);
                expect(segments[2].minSpeed).toEqual(25);
                expect(segments[3].minSpeed).toEqual(30);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(25);
                expect(segments[2].maxSpeed).toEqual(30);
                expect(segments[3].maxSpeed).toEqual(35);

                expect(segments[0].start).toEqual(0);
                expect(segments[1].start).toEqual(10);
                expect(segments[2].start).toEqual(20);
                expect(segments[3].start).toEqual(30);

                expect(segments[0].end).toEqual(10);
                expect(segments[1].end).toEqual(20);
                expect(segments[2].end).toEqual(30);
                expect(segments[3].end).toEqual(40);

                expect(segments[0].scale).toEqual(1);
                expect(segments[1].scale).toEqual(0.6666666666666666);
                expect(segments[2].scale).toEqual(2);
                expect(segments[3].scale).toEqual(2);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
                expect(segments[2].showLastLabel).toBeTruthy();
                expect(segments[3].showLastLabel).toBeFalsy();
            });

            test('Segment calculation non equals ranges, start 10', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 25, ''),
                    new SpeedRange(0, 25, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcFixedSizeSegments(speedRanges, 10, 40, false, 4);

                console.log('Segments', segments);
                expect(segments.length).toEqual(4);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);
                expect(segments[2].minSpeed).toEqual(25);
                expect(segments[3].minSpeed).toEqual(30);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(25);
                expect(segments[2].maxSpeed).toEqual(30);
                expect(segments[3].maxSpeed).toEqual(35);

                expect(segments[0].start).toEqual(10);
                expect(segments[1].start).toEqual(20);
                expect(segments[2].start).toEqual(30);
                expect(segments[3].start).toEqual(40);

                expect(segments[0].end).toEqual(20);
                expect(segments[1].end).toEqual(30);
                expect(segments[2].end).toEqual(40);
                expect(segments[3].end).toEqual(50);

                expect(segments[0].scale).toEqual(1);
                expect(segments[1].scale).toEqual(0.6666666666666666);
                expect(segments[2].scale).toEqual(2);
                expect(segments[3].scale).toEqual(2);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
                expect(segments[2].showLastLabel).toBeTruthy();
                expect(segments[3].showLastLabel).toBeFalsy();
            });

            test('Segment calculation non equals ranges, start 10, minus true', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 25, ''),
                    new SpeedRange(0, 25, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcFixedSizeSegments(speedRanges, 50, 40, true, 4);

                console.log('Segments', segments);
                expect(segments.length).toEqual(4);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);
                expect(segments[2].minSpeed).toEqual(25);
                expect(segments[3].minSpeed).toEqual(30);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(25);
                expect(segments[2].maxSpeed).toEqual(30);
                expect(segments[3].maxSpeed).toEqual(35);

                expect(segments[0].start).toEqual(50);
                expect(segments[1].start).toEqual(40);
                expect(segments[2].start).toEqual(30);
                expect(segments[3].start).toEqual(20);

                expect(segments[0].end).toEqual(40);
                expect(segments[1].end).toEqual(30);
                expect(segments[2].end).toEqual(20);
                expect(segments[3].end).toEqual(10);

                expect(segments[0].scale).toEqual(1);
                expect(segments[1].scale).toEqual(0.6666666666666666);
                expect(segments[2].scale).toEqual(2);
                expect(segments[3].scale).toEqual(2);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
                expect(segments[2].showLastLabel).toBeTruthy();
                expect(segments[3].showLastLabel).toBeFalsy();
            });
        });

        describe('calcFixedsizeSegments, show not all segments tests', () => {

            test('Segment calculation equal segments, start 0, not full', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 20, ''),
                    new SpeedRange(0, 20, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcFixedSizeSegments(speedRanges, 0, 4, false, 2);

                console.log('Segments', segments);
                expect(segments.length).toEqual(2);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(20);

                expect(segments[0].start).toEqual(0);
                expect(segments[1].start).toEqual(2);

                expect(segments[0].end).toEqual(2);
                expect(segments[1].end).toEqual(4);

                expect(segments[0].scale).toEqual(0.2);
                expect(segments[1].scale).toEqual(0.2);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
            });

            test('Segment calculation non equals ranges, start 0, not full', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 25, ''),
                    new SpeedRange(0, 25, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcFixedSizeSegments(speedRanges, 0, 40, false, 2);

                console.log('Segments', segments);
                expect(segments.length).toEqual(2);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(25);

                expect(segments[0].start).toEqual(0);
                expect(segments[1].start).toEqual(20);

                expect(segments[0].end).toEqual(20);
                expect(segments[1].end).toEqual(40);

                expect(segments[0].scale).toEqual(2);
                expect(segments[1].scale).toEqual(1.3333333333333333);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
            });

            test('Segment calculation non equals ranges, start 10, not full', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 25, ''),
                    new SpeedRange(0, 25, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcFixedSizeSegments(speedRanges, 10, 40, false, 2);

                console.log('Segments', segments);
                expect(segments.length).toEqual(2);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(25);

                expect(segments[0].start).toEqual(10);
                expect(segments[1].start).toEqual(30);

                expect(segments[0].end).toEqual(30);
                expect(segments[1].end).toEqual(50);

                expect(segments[0].scale).toEqual(2);
                expect(segments[1].scale).toEqual(1.3333333333333333);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
            });
        })

    });

    describe('calcRelativeSegments tests', () => {

        describe('calcRelativeSegments, show not all segments tests', () => {

            test('Segment calculation equal segments, start 0, not full', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 20, ''),
                    new SpeedRange(0, 20, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcRelativeSegments(speedRanges, 0, 4, false, 2);

                console.log('Segments', segments);
                expect(segments.length).toEqual(2);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(20);

                expect(segments[0].start).toEqual(0);
                expect(segments[1].start).toEqual(2);

                expect(segments[0].end).toEqual(2);
                expect(segments[1].end).toEqual(4);

                expect(segments[0].scale).toEqual(0.2);
                expect(segments[1].scale).toEqual(0.2);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
            });

            test('Segment calculation non equals segments, start 0, not full', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 25, ''),
                    new SpeedRange(0, 25, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcRelativeSegments(speedRanges, 0, 25, false, 2);

                console.log('Segments', segments);
                expect(segments.length).toEqual(2);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(25);

                expect(segments[0].start).toEqual(0);
                expect(segments[1].start).toEqual(10);

                expect(segments[0].end).toEqual(10);
                expect(segments[1].end).toEqual(25);

                expect(segments[0].scale).toEqual(1);
                expect(segments[1].scale).toEqual(1);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
            });

            test('Segment calculation non equals segments, start 10, not full', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 25, ''),
                    new SpeedRange(0, 25, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcRelativeSegments(speedRanges, 10, 25, false, 2);

                console.log('Segments', segments);
                expect(segments.length).toEqual(2);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(25);

                expect(segments[0].start).toEqual(10);
                expect(segments[1].start).toEqual(20);

                expect(segments[0].end).toEqual(20);
                expect(segments[1].end).toEqual(35);

                expect(segments[0].scale).toEqual(1);
                expect(segments[1].scale).toEqual(1);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
            });
        });

        describe('calcRelativeSegments, show all segments tests', () => {

            test('Segment calculation equal segments, start 0', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 20, ''),
                    new SpeedRange(0, 20, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcRelativeSegments(speedRanges, 0, 4, false, 4);

                console.log('Segments', segments);
                expect(segments.length).toEqual(4);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);
                expect(segments[2].minSpeed).toEqual(20);
                expect(segments[3].minSpeed).toEqual(30);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(20);
                expect(segments[2].maxSpeed).toEqual(30);
                expect(segments[3].maxSpeed).toEqual(40);

                expect(segments[0].start).toEqual(0);
                expect(segments[1].start).toEqual(1);
                expect(segments[2].start).toEqual(2);
                expect(segments[3].start).toEqual(3);

                expect(segments[0].end).toEqual(1);
                expect(segments[1].end).toEqual(2);
                expect(segments[2].end).toEqual(3);
                expect(segments[3].end).toEqual(4);

                expect(segments[0].scale).toEqual(0.1);
                expect(segments[1].scale).toEqual(0.1);
                expect(segments[2].scale).toEqual(0.1);
                expect(segments[3].scale).toEqual(0.1);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
                expect(segments[2].showLastLabel).toBeTruthy();
                expect(segments[3].showLastLabel).toBeFalsy();
            });

            test('Segment calculation non equals segments, start 0', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 25, ''),
                    new SpeedRange(0, 25, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcRelativeSegments(speedRanges, 0, 40, false, 4);

                console.log('Segments', segments);
                expect(segments.length).toEqual(4);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);
                expect(segments[2].minSpeed).toEqual(25);
                expect(segments[3].minSpeed).toEqual(30);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(25);
                expect(segments[2].maxSpeed).toEqual(30);
                expect(segments[3].maxSpeed).toEqual(40);

                expect(segments[0].start).toEqual(0);
                expect(segments[1].start).toEqual(10);
                expect(segments[2].start).toEqual(25);
                expect(segments[3].start).toEqual(30);

                expect(segments[0].end).toEqual(10);
                expect(segments[1].end).toEqual(25);
                expect(segments[2].end).toEqual(30);
                expect(segments[3].end).toEqual(40);

                expect(segments[0].scale).toEqual(1);
                expect(segments[1].scale).toEqual(1);
                expect(segments[2].scale).toEqual(1);
                expect(segments[3].scale).toEqual(1);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
                expect(segments[2].showLastLabel).toBeTruthy();
                expect(segments[3].showLastLabel).toBeFalsy();
            });

            test('Segment calculation non equals segments, start 10', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 25, ''),
                    new SpeedRange(0, 25, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcRelativeSegments(speedRanges, 10, 40, false, 4);

                console.log('Segments', segments);
                expect(segments.length).toEqual(4);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);
                expect(segments[2].minSpeed).toEqual(25);
                expect(segments[3].minSpeed).toEqual(30);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(25);
                expect(segments[2].maxSpeed).toEqual(30);
                expect(segments[3].maxSpeed).toEqual(40);

                expect(segments[0].start).toEqual(10);
                expect(segments[1].start).toEqual(20);
                expect(segments[2].start).toEqual(35);
                expect(segments[3].start).toEqual(40);

                expect(segments[0].end).toEqual(20);
                expect(segments[1].end).toEqual(35);
                expect(segments[2].end).toEqual(40);
                expect(segments[3].end).toEqual(50);

                expect(segments[0].scale).toEqual(1);
                expect(segments[1].scale).toEqual(1);
                expect(segments[2].scale).toEqual(1);
                expect(segments[3].scale).toEqual(1);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
                expect(segments[2].showLastLabel).toBeTruthy();
                expect(segments[3].showLastLabel).toBeFalsy();
            });

            test('Segment calculation non equals segments, start 10, minus true', () => {
                const speedRanges = [
                    new SpeedRange(0, 0, 10, ''),
                    new SpeedRange(0, 10, 25, ''),
                    new SpeedRange(0, 25, 30, ''),
                    new SpeedRange(0, 30, -1, '')
                ];
                const segments = WindBarRangeCalcUtil.calcRelativeSegments(speedRanges, 50, 40, true, 4);

                console.log('Segments', segments);
                expect(segments.length).toEqual(4);
                expect(segments[0].minSpeed).toEqual(0);
                expect(segments[1].minSpeed).toEqual(10);
                expect(segments[2].minSpeed).toEqual(25);
                expect(segments[3].minSpeed).toEqual(30);

                expect(segments[0].maxSpeed).toEqual(10);
                expect(segments[1].maxSpeed).toEqual(25);
                expect(segments[2].maxSpeed).toEqual(30);
                expect(segments[3].maxSpeed).toEqual(40);

                expect(segments[0].start).toEqual(50);
                expect(segments[1].start).toEqual(40);
                expect(segments[2].start).toEqual(25);
                expect(segments[3].start).toEqual(20);

                expect(segments[0].end).toEqual(40);
                expect(segments[1].end).toEqual(25);
                expect(segments[2].end).toEqual(20);
                expect(segments[3].end).toEqual(10);

                expect(segments[0].scale).toEqual(1);
                expect(segments[1].scale).toEqual(1);
                expect(segments[2].scale).toEqual(1);
                expect(segments[3].scale).toEqual(1);

                expect(segments[0].showLastLabel).toBeTruthy();
                expect(segments[1].showLastLabel).toBeTruthy();
                expect(segments[2].showLastLabel).toBeTruthy();
                expect(segments[3].showLastLabel).toBeFalsy();
            });

        });

    });

});
