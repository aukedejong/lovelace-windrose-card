import {SegmentPosition} from "./SegmentPosition";
import {SpeedRange} from "../speed-range/SpeedRange";

export class WindBarRangeCalcUtil {

    public static determineSegmentCount(percentageData: number[], full: boolean): number {
        if (full) {
            return percentageData.length;
        }
        for (let i = percentageData.length - 1; i >= 0; i--) {
            if (percentageData[i] > 0) {
                return i + 1;
            }
        }
        return percentageData.length;
    }

    public static calcFixedSizeSegments(speedRanges: SpeedRange[], start: number, length: number, positionMinus: boolean, segmentCount: number): SegmentPosition[] {
        const segmentPositions: SegmentPosition[] = [];
        const segmentSize = length / segmentCount;

        let startPos = start;
        let prevSppedRange: SpeedRange;
        speedRanges.forEach((speedRange, index) => {
            if (index + 1 > segmentCount) {
                return;
            }
            if (speedRange.maxSpeed > 0) { //Not last segment
                const endPos = positionMinus ? startPos - segmentSize : startPos + segmentSize;
                const scale = segmentSize / (speedRange.maxSpeed - speedRange.minSpeed);
                const segmentPosition = new SegmentPosition(startPos, endPos, speedRange.minSpeed, speedRange.maxSpeed, scale, true);
                segmentPositions.push(segmentPosition);
                startPos = endPos;
            } else {
                const endPos = positionMinus ? start - length : start + length;
                const maxSpeedLastSegment = speedRange.minSpeed + (prevSppedRange.maxSpeed - prevSppedRange.minSpeed);
                const scale = segmentSize / (maxSpeedLastSegment - speedRange.minSpeed);
                const segmentPosition = new SegmentPosition(startPos, endPos, speedRange.minSpeed, maxSpeedLastSegment, scale, false);
                segmentPositions.push(segmentPosition);
                startPos = endPos;
            }
            prevSppedRange = speedRange;
        });

        return segmentPositions;
    }

    public static calcRelativeSegments(speedRanges: SpeedRange[], start: number, length: number, positionMinus: boolean, segmentCount: number): SegmentPosition[] {
        const segmentPositions: SegmentPosition[] = [];
        const segmentLength = length / segmentCount;
        let scale: number;
        let maxSpeed = 0;
        if (segmentCount < speedRanges.length) {
            scale = length / speedRanges[segmentCount - 1].maxSpeed;
        } else {
            const leftOverSpace = length - segmentLength; //Last segments has no max speed, so gets fixed width.
            maxSpeed = speedRanges[speedRanges.length - 1].minSpeed;
            scale = leftOverSpace / maxSpeed;
        }

        let startPos = start;
        speedRanges.forEach((speedRange, index) => {
            if (index + 1 > segmentCount) {
                return;
            }
            if (speedRange.maxSpeed > 0) { //Not last segment
                const segmentLength = ((speedRange.maxSpeed - speedRange.minSpeed) * scale);
                const endPos = positionMinus ? startPos - segmentLength :  startPos + segmentLength;
                const segmentPosition = new SegmentPosition(startPos, endPos, speedRange.minSpeed, speedRange.maxSpeed, scale, true);
                segmentPositions.push(segmentPosition);
                startPos = endPos;
            } else {
                const endPos = positionMinus ? start - length : start + length;
                const maxSpeedLastSegment = (maxSpeed / (segmentCount - 1)) * segmentCount;
                const segmentPosition = new SegmentPosition(startPos, endPos, speedRange.minSpeed, maxSpeedLastSegment, scale, false);
                segmentPositions.push(segmentPosition);
                startPos = endPos;
            }
        });
        return segmentPositions;
    }

    public static calcPercentageSegments(speedRanges: SpeedRange[], start: number, length: number, positionMinus: boolean, segmentCount: number, speedRangePercentages: number[]): SegmentPosition[] {
        const segmentPositions: SegmentPosition[] = [];

        const minSegmentLength = length / 20;
        let countZeroPercentage = 0;
        for (let i = 0; i < segmentCount; i++) {
            if (speedRangePercentages[i] === 0) {
                countZeroPercentage++;
            }
        }
        const lengthToDistribute = length - (minSegmentLength * countZeroPercentage);
        let startPos = start;
        for (let i = 0; i < segmentCount; i++) {

            let segmentLength = 0;
            if (speedRangePercentages[i] === 0) {
                segmentLength = minSegmentLength;
            } else {
                segmentLength = (lengthToDistribute / 100) * speedRangePercentages[i];
            }
            const endPos = positionMinus ? startPos - segmentLength : startPos + segmentLength;
            const scale = segmentLength / (speedRanges[i].maxSpeed - speedRanges[i].minSpeed);
            const segmentPosition = new SegmentPosition(startPos, endPos, speedRanges[i].minSpeed, speedRanges[i].maxSpeed, scale, speedRanges[i].maxSpeed === 0);
            segmentPositions.push(segmentPosition);
            startPos = endPos;
        }
        return segmentPositions;
    }

}
