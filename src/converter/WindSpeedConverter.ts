import {SpeedUnit} from "./SpeedUnit";
import {SpeedUnits} from "./SpeedUnits";

export class WindSpeedConverter {

    constructor(private readonly outputSpeedUnit: SpeedUnit) {
    }

    getSpeedConverterFunc(inputUnit: string): (speed: number) => number {
        if (inputUnit === this.outputSpeedUnit.name) {
            return (inputSpeed: number) => inputSpeed;
        } else if (inputUnit === 'mps') {
            return this.outputSpeedUnit.fromMpsFunc;
        }
        const inputSpeedUnit = SpeedUnits.getSpeedUnit(inputUnit);
        const toMpsFunction = inputSpeedUnit.toMpsFunc;
        const fromMpsFunction = this.outputSpeedUnit.fromMpsFunc;
        return (speed: number) => fromMpsFunction(toMpsFunction(speed));
    }
}
