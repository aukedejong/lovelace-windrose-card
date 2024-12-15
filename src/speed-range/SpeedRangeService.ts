import {SpeedRange} from "./SpeedRange";
import {SpeedRangeFactory} from "./SpeedRangeFactory";
import {WindSpeedEntity} from "../config/WindSpeedEntity";
import {SpeedUnit} from "../converter/SpeedUnit";

export class SpeedRangeService {

    private readonly outputSpeedUnit: SpeedUnit
    private readonly speedRanges: SpeedRange[];

    constructor(outputSpeedUnit: SpeedUnit, windSpeedEntity: WindSpeedEntity) {
        this.outputSpeedUnit = outputSpeedUnit;
        this.speedRanges = SpeedRangeFactory.generateSpeedRanges(outputSpeedUnit, windSpeedEntity);
    }

    getRangeCount(): number {
        return this.speedRanges.length;
    }

    getSpeedRanges(): SpeedRange[] {
        return this.speedRanges;
    }

    determineSpeedRangeIndex(speed: number): number {
        const speedRange = this.speedRanges.find((speedRange: SpeedRange) => speedRange.isRangeMatch(speed));
        if (speedRange) {
            return speedRange.range;
        }
        throw new Error("Speed is not in a speedrange: " + speed + " unit: " + this.outputSpeedUnit.name);
    }

}
