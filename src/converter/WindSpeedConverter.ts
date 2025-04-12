import {SpeedUnit} from "./SpeedUnit";
import {SpeedUnits} from "./SpeedUnits";

export class WindSpeedConverter {

    constructor(private readonly outputSpeedUnit: SpeedUnit,
                private readonly compensationFactor: number = 1,
                private readonly compensationAbsolute: number = 0) {
    }

    getSpeedConverterFunc(inputUnit: string): (speed: number) => number {
        if (this.compensationFactor !== 1 || this.compensationAbsolute !== 0) {
            const compensationFunc = (speed: number) => {
                let newSpeed = speed + this.compensationAbsolute;
                if (newSpeed < 0) {
                    return 0;
                }
                newSpeed *= this.compensationFactor;
                return newSpeed;
            }
            if (inputUnit === this.outputSpeedUnit.name) {
                return (inputSpeed: number) => compensationFunc(inputSpeed);
            } else if (inputUnit === 'mps') {
                return (inputSpeed: number) => compensationFunc(this.outputSpeedUnit.fromMpsFunc(inputSpeed));
            }
            const inputSpeedUnit = SpeedUnits.getSpeedUnit(inputUnit);
            const toMpsFunction = inputSpeedUnit.toMpsFunc;
            const fromMpsFunction = this.outputSpeedUnit.fromMpsFunc;
            return (speed: number) => compensationFunc(fromMpsFunction(toMpsFunction(speed)));
        }

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
