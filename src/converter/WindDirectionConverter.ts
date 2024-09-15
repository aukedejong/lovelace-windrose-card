import {WindDirectionLettersConverter} from "./WindDirectionLettersConverter";
import {Log} from "../util/Log";
import {WindRoseConfig} from "../config/WindRoseConfig";

export class WindDirectionConverter {

    private windDirectionLettersConverter: WindDirectionLettersConverter;

    constructor(private readonly config: WindRoseConfig) {

        this.windDirectionLettersConverter = new WindDirectionLettersConverter(config.cardinalDirectionLetters);
    }

    public convertDirection(direction: number | string): number | undefined {
        let degrees = 0;
        if (this.config.windDirectionUnit === 'letters') {
            degrees = this.windDirectionLettersConverter.getDirection(direction as string);
            if (isNaN(degrees)) {
                Log.info("Could not convert direction " + direction + " to degrees.");
                return undefined;
            }
        } else {
            if (isNaN(direction as number)) {
                Log.info("Direction " + direction + " is not a number.");
                return undefined;
            }
            degrees = direction as number;
        }
        return this.compensateDirection(degrees);
    }

    private compensateDirection(degrees: number) {
        let compensatedDegrees = degrees;
        if (this.config.directionCompensation !== 0) {
            compensatedDegrees = +compensatedDegrees + this.config.directionCompensation;
            if (compensatedDegrees < 0) {
                compensatedDegrees = 360 + compensatedDegrees;
            } else if (compensatedDegrees >= 360) {
                compensatedDegrees = compensatedDegrees - 360;
            }
        }
        return compensatedDegrees;
    }
}
