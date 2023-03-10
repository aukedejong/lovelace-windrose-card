import {WindSpeedConverter} from "./WindSpeedConverter";
import {WindBarData} from "./WindBarData";
import {WindBarConfig} from "./WindBarConfig";

export class WindBarCalculator {

    readonly windSpeedConverter: WindSpeedConverter;
    readonly config: WindBarConfig;
    speeds: number[] = [];
    modified = false;

    speedRangePercentages: number[] = []

    speedRangeFunction: (speed: number) => number;
    speedConverterFunction: (speed: number) => number;
    rangeCount: number;

    constructor(config: WindBarConfig, windSpeedConverter: WindSpeedConverter) {
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.speedRangeFunction = this.windSpeedConverter.getRangeFunction()
        this.speedConverterFunction = this.windSpeedConverter.getSpeedConverter();
        this.rangeCount = this.windSpeedConverter.getSpeedRanges().length;
    }

    addSpeeds(speeds: number[]) {
        for (const speed of speeds) {
            this.speeds.push(this.speedConverterFunction(speed));
        }
        this.modified = true;
    }

    calculate(): WindBarData {
        if (this.modified) {
            this.calculateSpeedRangePercentages();
        }
        return new WindBarData(this.speedRangePercentages);
    }

    private calculateSpeedRangePercentages(): void {
        const speedRangeCounts = Array(this.rangeCount).fill(0);
        for (const speed of this.speeds) {
            const windBft = this.speedRangeFunction(speed);
            if (windBft !== undefined && windBft >= 0) {
                speedRangeCounts[windBft]++;
            } else {
                console.log('Error: bft conversion failed, ', speed);
            }
        }
        this.speedRangePercentages = [];
        for (const speedRangeCount of speedRangeCounts) {
            this.speedRangePercentages.push(speedRangeCount / (this.speeds.length / 100));
        }
    }
}