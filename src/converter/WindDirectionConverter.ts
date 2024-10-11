import {WindDirectionLettersConverter} from "./WindDirectionLettersConverter";
import {Log} from "../util/Log";
import {WindRoseConfig} from "../config/WindRoseConfig";

export class WindDirectionConverter {

    private windDirectionLettersConverter: WindDirectionLettersConverter;

    constructor(private readonly config: WindRoseConfig) {

        this.windDirectionLettersConverter = new WindDirectionLettersConverter(config.windDirectionLetters);
    }

    public convertDirection(direction: number | string | undefined): number | undefined {
        let degrees: number | undefined;
        if (direction === undefined || direction === null || direction === '') {
            return undefined;

        } else if (Number.isNaN(Number(direction))) {
            degrees = this.windDirectionLettersConverter.getDirection(direction as string);
            if (isNaN(degrees as any)) {
                Log.info("Could not convert direction " + direction + " to degrees.");
                return undefined;
            }
        } else {
            degrees = +direction;
        }
        if (degrees === undefined) {
            return undefined;
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
