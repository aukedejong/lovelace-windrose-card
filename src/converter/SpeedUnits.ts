import {SpeedUnit} from "./SpeedUnit";
import {Log} from "../util/Log";

export class SpeedUnits {

    static readonly bft = new SpeedUnit('Beaufort',
        ['bft', 'Beaufort'],
        (speed: number) => {
            switch (speed) {
                case 0: return 0;
                case 1: return 0.9; //0.3–1.5 m/s
                case 2: return 2.45; //1.6–3.3 m/s
                case 3: return 4.4; //3.4–5.4 m/s
                case 4: return 6.7; //5.5–7.9 m/s
                case 5: return 9.35; //8–10.7 m/s
                case 6: return 12.3; //10.8–13.8 m/s
                case 7: return 15.5; //13.9–17.1 m/s
                case 8: return 18.95; //17.2–20.7 m/s
                case 9: return 22.6; //20.8–24.4 m/s
                case 10: return 26.45; //24.5–28.4 m/s
                case 11: return 30.55; //28.5–32.6 m/s
                case 12: return 35; //≥ 32.7 m/s
                default: return 0; //throw new Error("Incorrect Beaufort speed: " + speed);
            }
        },
        (speed: number) => speed, undefined,
        undefined);

    static readonly mps = new SpeedUnit('m/s',
        ['mps', 'm/s'],
        (speed: number) => speed,
        (speed: number) => speed, 5, 30);

    static readonly kph = new SpeedUnit('km/h',
        ['kph', 'km/h'],
        (speed: number) => speed / 3.6,
        (speed: number) => speed * 3.6, 10, 100);

    static readonly mph = new SpeedUnit('m/h',
        ['mph', 'm/h'],
        (speed: number) => speed / 2.2369,
        (speed: number) => speed * 2.2369, 10, 70);

    static readonly fps = new SpeedUnit('ft/s',
        ['fps', 'ft/s'],
        (speed: number) => speed / 3.2808399,
        (speed: number) => speed * 3.2808399, 10, 100);

    static readonly knots = new SpeedUnit('knots',
        ['knots', 'kts', 'knts', 'kn', 'knot'],
        (speed: number) => speed / 1.9438444924406,
        (speed: number) => speed * 1.9438444924406, 5, 60);

    static readonly units: SpeedUnit[] = [this.bft, this.mps, this.kph, this.mph, this.fps,this.knots];

    static getSpeedUnit(unit: string): SpeedUnit {
        const speedUnit = this.units.find(speedUnit => speedUnit.configs.includes(unit));
        if (speedUnit === undefined) {
            throw new Error("Unknown speed unit: " + unit);
        } else {
            Log.debug(`Matched speedunit ${speedUnit.name}`);
        }
        return speedUnit;
    }

}
