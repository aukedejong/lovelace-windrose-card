import {WindSpeedConverter} from "./WindSpeedConverter";
import {WindBarData} from "./WindBarData";

export class WindBarCalculator {

    readonly windSpeedConverter = new WindSpeedConverter();
    speeds: number[] = [];
    modified = false;

    speedRangePercentages: number[] = []

    addSpeeds(speeds: number[]) {
        this.speeds = this.speeds.concat(speeds);
        this.modified = true;
    }

    calculate(): WindBarData {
        if (this.modified) {
            this.calculateSpeedRangePercentages();
        }
        return new WindBarData(this.speedRangePercentages);
    }

    private calculateSpeedRangePercentages(): void {
        const speedRangeCounts = Array(13).fill(0);
        for (const speed of this.speeds) {
            const windBft = this.windSpeedConverter.getByMeterPerSecond(speed)?.getBft();
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
        // console.log('BAR - Calculated speed range percentages', this.speedRangePercentages, this.speeds);
    }
}