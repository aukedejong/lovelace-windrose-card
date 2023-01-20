import {WindRoseConfig} from "./WindRoseConfig";
import {WindDirectionCalculator} from "./WindDirectionCalculator";
import {WindRoseData} from "./WindRoseData";
import {WindSpeedConverter} from "./WindSpeedConverter";

export class WindRoseCalculator {
    readonly windSpeedConverter = new WindSpeedConverter();
    data = new WindRoseData();
    windDirections: WindDirectionCalculator[] = [];
    config: WindRoseConfig;
    modified = false;

    totalMeasurements = 0;
    maxMeasurementsDirection = 0;
    calmSpeedMeasurements = 0;

    constructor(config: WindRoseConfig) {
        this.config = config;
        const leaveDegrees = 360 / config.leaveCount;
        for (let i = 0; i < config.leaveCount; i++) {
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

    addDataPoint(direction: number, speed: number): void {
        if (this.config.directionCompensation !== 0) {
            direction = +direction + this.config.directionCompensation;
            if (direction < 0) {
                direction = 360 + direction;
            } else if (direction >= 360) {
                direction = direction - 360;
            }
        }
        for(const windDirection of this.windDirections) {
            if (windDirection.checkDirection(direction)) {
                windDirection.addSpeed(speed);
                this.totalMeasurements++;
            }
        }
        if (this.windSpeedConverter.getByMeterPerSecond(speed)?.getBft() == 0) {
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