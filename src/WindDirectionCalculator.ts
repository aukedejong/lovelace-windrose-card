import {WindRoseConfig} from "./WindRoseConfig";
import {WindDirectionData} from "./WindDirectionData";
import {WindSpeedConverter} from "./WindSpeedConverter";

export class WindDirectionCalculator {
    readonly windSpeedConverter: WindSpeedConverter;
    data = new WindDirectionData();
    speeds: number[] = [];
    speedRangeCounts: number[] = [];
    speedRangeCount: number = 0;
    config: WindRoseConfig;

    speedRangeFunction: (speed: number) => number;
    speedConverterFunction: (speed: number) => number;

    constructor(minDegrees: number, centerDegrees: number, maxDegrees: number, config: WindRoseConfig,
                windSpeedConverter: WindSpeedConverter) {
        this.data.centerDegrees = centerDegrees;
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.speedRangeFunction = this.windSpeedConverter.getRangeFunction();
        this.speedConverterFunction = this.windSpeedConverter.getSpeedConverter();
        this.speedRangeCount = this.windSpeedConverter.getSpeedRanges().length;
        if (minDegrees < 0) {
            this.data.minDegrees = minDegrees + 360;
        } else {
            this.data.minDegrees = minDegrees;
        }
        this.data.maxDegrees = maxDegrees;
    }

    clear() {
        this.speeds = [];
        this.speedRangeCounts = [];
        this.data.speedRangePercentages = [];
    }

    checkDirection(direction: number): boolean {
        if (this.data.minDegrees > this.data.maxDegrees) {
            return direction > this.data.minDegrees || direction <= this.data.maxDegrees;
        }
        return direction > this.data.minDegrees && direction <= this.data.maxDegrees;
    }

    addSpeed(speed: number): void {
        this.speeds.push(speed);
    }

    calculateDirectionPercentage(maxMeasurements: number) {
        this.data.directionPercentage = this.speeds.length / (maxMeasurements / 100);
    }

    calculateSpeedPercentages(): number[] {
        const speedRangeCounts = Array(this.speedRangeCount).fill(0);
        let speedAboveZeroCount = 0;
        for (const speed of this.speeds) {
            const speedRangeIndex = this.speedRangeFunction(speed);
            if (speedRangeIndex !== undefined && speedRangeIndex > 0) {
                speedRangeCounts[speedRangeIndex]++;
                speedAboveZeroCount++;
            }
        }
        if (speedAboveZeroCount === 0) {
            return Array(this.speedRangeCount).fill(0);
        }
        this.data.speedRangePercentages = [];
        for (const speedRangeCount of speedRangeCounts) {
            this.data.speedRangePercentages.push(speedRangeCount / (speedAboveZeroCount / 100));
        }
        return this.data.speedRangePercentages;
    }
}