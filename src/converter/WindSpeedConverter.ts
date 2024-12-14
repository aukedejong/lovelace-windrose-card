import {SpeedRange} from "../speed-range/SpeedRange";
import {SpeedUnit} from "./SpeedUnit";
import {Log} from "../util/Log";
import {SpeedUnits} from "./SpeedUnits";
import {SpeedRangeFactory} from "../speed-range/SpeedRangeFactory";

export class WindSpeedConverter {

    readonly outputSpeedUnit: SpeedUnit;

    constructor(private readonly outputUnit: string,
                readonly rangeBeaufort?: boolean,
                readonly rangeStep?: number,
                readonly rangeMax?: number,
                readonly speedRanges?: SpeedRange[]) {

        this.outputSpeedUnit = SpeedUnits.getSpeedUnit(this.outputUnit);

        this.outputSpeedUnit.speedRanges = SpeedRangeFactory.generateSpeedRanges(
            this.outputSpeedUnit, rangeBeaufort, rangeStep, rangeMax, speedRanges);

        Log.trace('Speed ranges: ', this.outputSpeedUnit.speedRanges);
    }

    getOutputSpeedUnit(): SpeedUnit {
        return this.outputSpeedUnit;
    }

    getSpeedConverter(inputUnit: string): (speed: number) => number {
        if (inputUnit === this.outputUnit) {
            return (inputSpeed: number) => inputSpeed;
        } else if (inputUnit === 'mps') {
            return this.outputSpeedUnit.fromMpsFunc;
        }
        const inputSpeedUnit = SpeedUnits.getSpeedUnit(inputUnit);
        const toMpsFunction = inputSpeedUnit.toMpsFunc;
        const fromMpsFunction = this.outputSpeedUnit.fromMpsFunc;
        return (speed: number) => fromMpsFunction(toMpsFunction(speed));
    }

    getRangeFunction(): (speed: number) => number {
        return (speed: number) => {
            const speedRange = this.outputSpeedUnit.speedRanges.find((speedRange: SpeedRange) => speedRange.isRangeMatch(speed));
            if (speedRange) {
                return speedRange.range;
            }
            throw new Error("Speed is not in a speedrange: " + speed + " unit: " + this.outputUnit);
        }
    }

    getSpeedRanges(): SpeedRange[] {
        return this.outputSpeedUnit.speedRanges;
    }
}
