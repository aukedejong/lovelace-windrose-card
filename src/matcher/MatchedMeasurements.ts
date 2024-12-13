import {DirectionSpeed} from "./DirectionSpeed";

export class MatchedMeasurements {

    private readonly directionSpeeds: DirectionSpeed[] = [];

    private total: number = 0;
    private count: number = 0;
    private minSpeed: number = 0;
    private maxSpeed: number = 0;

    add(direction: number | string, speed: number, time: number = 1) {
        this.directionSpeeds.push(new DirectionSpeed(direction, speed, time));
        if (speed < this.minSpeed) {
            this.minSpeed = speed;
        }
        if (speed > this.maxSpeed) {
            this.maxSpeed = speed;
        }
        this.total += speed;
        this.count++;
    }

    getMeasurements(): DirectionSpeed[] {
        return this.directionSpeeds;
    }

    getMinSpeed(): number {
        return this.minSpeed;
    }

    getMaxSpeed(): number {
        return this.maxSpeed;
    }

    getAverageSpeed(): number {
        return this.total / this.count;
    }

    getMeasurementCount(): number {
        return this.count;
    }
}
