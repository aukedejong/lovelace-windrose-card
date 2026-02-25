import {WindCounts} from "../counter/WindCounts";
import {Log} from "../util/Log";
import {WindRoseData} from "./WindRoseData";
import {RoseConfig} from "../config/RoseConfig";

export class PercentageCalculator {

    constructor(private roseConfig: RoseConfig) {}

    calculate(windCounts: WindCounts): WindRoseData {
        const maxDirectionTotal = Math.max(...windCounts.directionTotals);
        Log.trace("Max direction total:", maxDirectionTotal);

        const speedRangePercentages = this.calculateSpeedRangePercentages(windCounts.speedRangeCounts, windCounts.total);
        Log.trace("Speed range percentages:", speedRangePercentages);

        const directionSpeedRangePercentages = this.calculateDirectionSpeedRangePercentages(
            windCounts.directionSpeedRangeCounts, windCounts.directionTotals);
        Log.trace("Direction speed range percentages:", directionSpeedRangePercentages);

        const directionPercentages = this.calculateDirectionPercentages(windCounts.directionTotals, windCounts.total);
        Log.trace("Direction percentages:", directionPercentages);

        const directionDegrees: number[] = windCounts.speedRangeDegrees;
        Log.trace("Direction degrees:", directionDegrees);

        let circleData: number[];
        if (this.roseConfig.circleCount && this.roseConfig.outerCirclePercentage) {
            circleData = this.roseConfig.circleLegendConfig();
        } else {
            circleData = this.calculateCirclePercentages(maxDirectionTotal, windCounts.total);
        }
        Log.trace("Number of circles:", circleData[0]);
        Log.trace("Percentage per circle:", circleData[1]);
        Log.trace("Max circle percentage:", circleData[2]);

        return new WindRoseData(speedRangePercentages, directionSpeedRangePercentages, directionPercentages,
            directionDegrees, circleData[0], circleData[1], circleData[2]);
    }

    private calculateSpeedRangePercentages(speedRangeCounts: number[], total: number): number[] {
        const onePercent = total / 100;
        let speedRangePercentages: number[] = [];
        if (onePercent > 0) {
            for (const speedRangeCount of speedRangeCounts) {
                speedRangePercentages.push(speedRangeCount / onePercent);
            }
        } else {
            speedRangePercentages = new Array(speedRangeCounts.length).fill(0);
        }
        return speedRangePercentages;
    }

    private calculateDirectionSpeedRangePercentages(directionSpeedRangeCounts: number[][], directionTotals: number[]): number[][] {
        const directionSpeedRangePercentages: number[][] = [];
        for (let index = 0; index < directionTotals.length; index++) {
            const speedRangePercentages: number[] = [];
            const onePerc = directionTotals[index] / 100;
            for (const speedRangeCount of directionSpeedRangeCounts[index]) {
                if (onePerc === 0) {
                    speedRangePercentages.push(0);
                } else {
                    speedRangePercentages.push(speedRangeCount / onePerc);
                }
            }
            directionSpeedRangePercentages.push(speedRangePercentages);
        }
        return directionSpeedRangePercentages;
    }

    private calculateDirectionPercentages(directionTotals: number[], total: number): number[] {
        const onePercTotal = total / 100;
        let directionPercentages: number[] = [];
        if (onePercTotal > 0) {
            for (const directionTotal of directionTotals) {
                directionPercentages.push(directionTotal / onePercTotal);
            }
        } else {
            directionPercentages = new Array(directionTotals.length).fill(0);
        }
        return directionPercentages
    }

    private calculateCirclePercentages(maxDirectionTotal: number, total: number): number[] {
        if (total === 0) {
            return [5, 10, 50];
        }
        const maxRosePercentage = maxDirectionTotal / (total / 100);
        let percentagePerCircle = 0;
        let numberOfCircles = 0;
        if (maxRosePercentage === 0) {
            percentagePerCircle = 25;
            numberOfCircles = 4;
        } else if (maxRosePercentage > 0 && maxRosePercentage <= 30) {
            percentagePerCircle = Math.ceil(maxRosePercentage / 6);
            numberOfCircles = Math.ceil(maxRosePercentage / percentagePerCircle);
        } else {
            percentagePerCircle = Math.ceil(maxRosePercentage / 5);
            numberOfCircles = 5;
        }
        return [numberOfCircles, percentagePerCircle, numberOfCircles * percentagePerCircle];
    }
}
