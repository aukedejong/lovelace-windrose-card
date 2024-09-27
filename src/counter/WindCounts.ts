import {Log} from "../util/Log";

export class WindCounts {

    total = 0;
    speedRangeDegrees: number[] = [];
    speedRangeCounts: number[] = [];

    directionTotals: number[] = [];
    directionSpeedRangeCounts: number[][] = [];

    init(speedRangeCount: number, directionCount: number) {
        this.total = 0;
        this.speedRangeCounts = new Array(speedRangeCount).fill(0);
        this.directionTotals = new Array(directionCount).fill(0);
        this.directionSpeedRangeCounts = new Array(directionCount).fill([]);
        for (let i = 0; i < this.directionSpeedRangeCounts.length; i++) {
            this.directionSpeedRangeCounts[i] = new Array(speedRangeCount).fill(0);
        }
    }

    add(windDirectionIndex: number, speedRangeIndex: number) {
        this.total++;
        this.speedRangeCounts[speedRangeIndex]++;
        this.directionTotals[windDirectionIndex]++;
        Log.debug("Add " + windDirectionIndex + " - " + speedRangeIndex, this.directionSpeedRangeCounts);
        this.directionSpeedRangeCounts[windDirectionIndex][speedRangeIndex]++;
    }
}
