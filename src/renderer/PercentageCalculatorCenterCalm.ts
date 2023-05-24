import {WindCounts} from "../counter/WindCounts";
import {WindRoseData} from "./WindRoseData";
import {PercentageCalculator} from "./PercentageCalculator";

export class PercentageCalculatorCenterCalm extends PercentageCalculator {

    calculate(windCounts: WindCounts): WindRoseData {
        windCounts.directionSpeedRangeCounts.forEach((speedRangeCounts: number[]) => speedRangeCounts[0] = 0);
        return super.calculate(windCounts);
    }

}