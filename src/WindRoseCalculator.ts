import {WindRoseConfig} from "./WindRoseConfig";
import {WindDirectionCalculator} from "./WindDirectionCalculator";
import {WindRoseData} from "./WindRoseData";
import {WindSpeedConverter} from "./WindSpeedConverter";
import {WindDirectionConverter} from "./WindDirectionConverter";

export class WindRoseCalculator {

    readonly windSpeedConverter = new WindSpeedConverter();
    readonly windDirectionConverter = new WindDirectionConverter();

    data = new WindRoseData();
    windDirections: WindDirectionCalculator[] = [];
    config: WindRoseConfig;
    modified = false;

    totalMeasurements = 0;
    maxMeasurementsDirection = 0;
    calmSpeedMeasurements = 0;

    speedRangeFunction: (speed: number) => number;
    speedConverterFunction: (speed: number) => number;

    constructor(config: WindRoseConfig) {
        this.config = config;
        this.speedRangeFunction = this.windSpeedConverter.getRangeFunction(this.config.outputUnit);
        this.speedConverterFunction = this.windSpeedConverter.getSpeedConverter(this.config.inputUnit,
            this.config.outputUnit);
        const leaveDegrees = 360 / config.windDirectionCount;
        for (let i = 0; i < config.windDirectionCount; i++) {
            const degrees = (i * leaveDegrees);
            const minDegrees = degrees - (leaveDegrees / 2);
            const maxDegrees = degrees + (leaveDegrees / 2);
            this.windDirections.push(new WindDirectionCalculator(minDegrees, degrees, maxDegrees, this.config));
        }
    }

    clear() {
        this.totalMeasurements = 0;
        this.data.percentagePerCircle = 0;
        this.data.numberOfCircles = 0;
        this.data.calmSpeedPercentage = 0;
        for (const windDirection of this.windDirections) {
            windDirection.clear();
        }
    }

    addDataPoint(direction: number | string, speed: number): void {
        const convertedSpeed = this.speedConverterFunction(speed);
        let degrees = 0;
        if (this.config.windDirectionUnit === 'letters') {
            degrees = this.windDirectionConverter.getDirection(direction as string);
            if (isNaN(degrees)) {
                throw new Error("Could not convert direction " + direction + " to degrees.");
            }
        } else {
            degrees = direction as number;
        }
        if (this.config.directionCompensation !== 0) {
            degrees = +degrees + this.config.directionCompensation;
            if (degrees < 0) {
                degrees = 360 + degrees;
            } else if (degrees >= 360) {
                degrees = degrees - 360;
            }
        }
        for(const windDirection of this.windDirections) {
            if (windDirection.checkDirection(degrees)) {
                windDirection.addSpeed(convertedSpeed);
                this.totalMeasurements++;
            }
        }
        if (this.speedRangeFunction(convertedSpeed) == 0) {
            this.calmSpeedMeasurements++;
        }
        this.modified = true;
    }

    calculate(): WindRoseData {
        this.maxMeasurementsDirection = Math.max(...this.windDirections.map(windDirection => windDirection.speeds.length));

        for(const windDirection of this.windDirections) {
            windDirection.calculateDirectionPercentage(this.maxMeasurementsDirection);
        }
        this.calculateSpeedPercentages();
        this.calculateWindRosePercentages();

        this.data.windDirections = this.windDirections.map(windDirection => windDirection.data);
        //console.log(this.calmSpeedMeasurements, this.totalMeasurements);
        this.data.calmSpeedPercentage = this.calmSpeedMeasurements / (this.totalMeasurements / 100);
        return this.data;
    }

    private calculateWindRosePercentages(): void {
        const maxRosePercentage = this.maxMeasurementsDirection / (this.totalMeasurements / 100);
        if (maxRosePercentage <= 30) {
            this.data.percentagePerCircle = Math.ceil(maxRosePercentage / 6);
            this.data.numberOfCircles = Math.ceil(maxRosePercentage / this.data.percentagePerCircle);
        } else {
            this.data.percentagePerCircle = Math.ceil(maxRosePercentage / 5);
            this.data.numberOfCircles = 5;
        }
    }

    private calculateSpeedPercentages(): void {
        for (const windDirection of this.windDirections) {
            windDirection.calculateSpeedPercentages();
        }
    }
}