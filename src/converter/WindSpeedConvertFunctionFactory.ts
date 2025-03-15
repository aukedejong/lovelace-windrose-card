import {SpeedUnit} from "./SpeedUnit";
import {Log} from "../util/Log";

export class WindSpeedConvertFunctionFactory {

    readonly bft = new SpeedUnit('Beaufort',
        ['bft', 'beaufort'],
        (speed: number) => {
            switch (speed) {
                case 0: return 0;
                case 1: return 1;
                case 2: return 2.5;
                case 3: return 4;
                case 4: return 6.5;
                case 5: return 9;
                case 6: return 12;
                case 7: return 15.5;
                case 8: return 18.5;
                case 9: return 22.5;
                case 10: return 26.5;
                case 11: return 30;
                case 12: return 34;
                default: return 0; //throw new Error("Incorrect Beaufort speed: " + speed);
            }
        },
        (speed: number) => {
            if (speed < 0) {
                throw new Error("Windspeed can't be negative");
            }
            if (speed < 0.3) return 0;  // Kalm
            if (speed < 1.6) return 1;  // Zwakke wind
            if (speed < 3.4) return 2;  // Zwakke wind
            if (speed < 5.5) return 3;  // Matige wind
            if (speed < 8.0) return 4;  // Matige wind
            if (speed < 10.8) return 5; // Vrij krachtige wind
            if (speed < 13.9) return 6; // Krachtige wind
            if (speed < 17.2) return 7; // Harde wind
            if (speed < 20.8) return 8; // Stormachtige wind
            if (speed < 24.5) return 9; // Storm
            if (speed < 28.5) return 10; // Zware storm
            if (speed < 32.7) return 11; // Zeer zware storm
            return 12;
        },
        undefined, undefined);

    readonly mps = new SpeedUnit('m/s',
        ['mps', 'm/s'],
        (speed: number) => speed,
        (speed: number) => speed, 5, 30);

    readonly kph = new SpeedUnit('km/h',
        ['kph', 'km/h'],
        (speed: number) => speed / 3.6,
        (speed: number) => speed * 3.6, 10, 100);

    readonly mph = new SpeedUnit('m/h',
        ['mph', 'm/h', 'mi/h'],
        (speed: number) => speed / 2.2369,
        (speed: number) => speed * 2.2369, 10, 70);

    readonly fps = new SpeedUnit('ft/s',
        ['fps', 'ft/s'],
        (speed: number) => speed / 3.2808399,
        (speed: number) => speed * 3.2808399, 10, 100);

    readonly knots = new SpeedUnit('knots',
        ['knots', 'kts', 'knts', 'kn'],
        (speed: number) => speed / 1.9438444924406,
        (speed: number) => speed * 1.9438444924406, 5, 60);
    readonly units: SpeedUnit[] = [this.bft, this.mps, this.kph, this.mph, this.fps,this.knots];

    getConverterFunction(inputUnit: string, outputUnit: string): (speed: number) => number {
        const inputSpeedUnit = this.getSpeedUnit(inputUnit);
        const outputSpeedUnit = this.getSpeedUnit(outputUnit);

        const toMpsFunction = inputSpeedUnit.toMpsFunc;
        const fromMpsFunction = outputSpeedUnit.fromMpsFunc;
        return (speed: number) => fromMpsFunction(toMpsFunction(speed));
    }

    speedUnitRecognized(unit: string): boolean {
        if (unit === null || unit === undefined || unit === '') {
            return false;
        }
        const speedUnit = this.units.find(speedUnit => speedUnit.configs.includes(unit));
        return speedUnit !== undefined;
    }

    private getSpeedUnit(unit: string): SpeedUnit {
        const speedUnit = this.units.find(speedUnit => speedUnit.configs.includes(unit));
        if (speedUnit === undefined) {
            throw new Error("Unknown speed unit: " + unit);
        } else {
            Log.debug(`Matched speedunit ${speedUnit.name}`);
        }
        return speedUnit;
    }
}
