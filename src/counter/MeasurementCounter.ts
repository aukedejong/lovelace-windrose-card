import {WindRoseConfig} from "../config/WindRoseConfig";
import {WindSpeedConverter} from "../converter/WindSpeedConverter";
import {WindDirectionConverter} from "../converter/WindDirectionConverter";
import {WindCounts} from "./WindCounts";
import {Log} from "../util/Log";
import {WindDirection} from "./WindDirection";

export class MeasurementCounter {

    private readonly windSpeedConverter: WindSpeedConverter;
    private readonly windDirectionConverter: WindDirectionConverter;

    private windDirections: WindDirection[] = [];
    private config: WindRoseConfig;

    private windData = new WindCounts();

    private speedRangeFunction: (speed: number) => number;
    private speedConverterFunction!: (speed: number) => number;

    constructor(config: WindRoseConfig, windSpeedConverter: WindSpeedConverter) {
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.windDirectionConverter = new WindDirectionConverter(config.windDirectionLetters);
        this.speedRangeFunction = this.windSpeedConverter.getRangeFunction();
        const leaveDegrees = 360 / config.windDirectionCount;
        for (let i = 0; i < config.windDirectionCount; i++) {
            const degrees = (i * leaveDegrees);
            const minDegrees = degrees - (leaveDegrees / 2);
            const maxDegrees = degrees + (leaveDegrees / 2);
            this.windDirections.push(new WindDirection(minDegrees, maxDegrees));
            this.windData.speedRangeDegrees.push(degrees);
        }
    }

    init(inputSpeedUnit: string) {
        this.windData.init(this.windSpeedConverter.getSpeedRanges().length, this.config.windDirectionCount);
        this.speedConverterFunction = this.windSpeedConverter.getSpeedConverter(inputSpeedUnit);
    }

    getMeasurementCounts(): WindCounts {
        Log.debug('Wind counts: ', this.windData);
        return this.windData;
    }

    addWindMeasurements(direction: number | string, speed: number): void {
        const convertedSpeed = this.speedConverterFunction(speed);
        const speedRangeIndex = this.speedRangeFunction(convertedSpeed)

        const convertedDirection = this.convertDirection(direction);
        if (convertedDirection === undefined) {
            return;
        }
        const compensatedDirection = this.compensateDirection(convertedDirection);
        const windDirectionIndex = this.windDirections.findIndex(
            windDirection => windDirection.checkDirection(compensatedDirection));

        Log.trace("Wind measurement: ", direction, speed, windDirectionIndex, speedRangeIndex);

        this.windData.add(windDirectionIndex, speedRangeIndex);
    }

    private convertDirection(direction: number | string): number | undefined {
        let degrees = 0;
        if (this.config.windDirectionUnit === 'letters') {
            degrees = this.windDirectionConverter.getDirection(direction as string);
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
        return degrees;
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