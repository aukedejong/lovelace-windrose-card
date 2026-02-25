import {WindCounts} from "../counter/WindCounts";
import {WindRoseData} from "./WindRoseData";
import {PercentageCalculator} from "./PercentageCalculator";
import {RoseConfig} from "../config/RoseConfig";

export class PercentageCalculatorCenterCalm extends PercentageCalculator {

    constructor(roseConfig: RoseConfig) {
        super(roseConfig);
    }

    calculate(windCounts: WindCounts): WindRoseData {

        for (let i = 0; i < windCounts.directionTotals.length; i++) {
            windCounts.directionSpeedRangeCounts[i][0] = 0;
            const directionTotal = windCounts.directionSpeedRangeCounts[i].reduce(
                (sum, current) => sum + current, 0);
            windCounts.directionTotals[i] = directionTotal;
        }

        return super.calculate(windCounts);
    }

}
