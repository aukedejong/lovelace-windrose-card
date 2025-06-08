import {DirectionSpeed} from "./DirectionSpeed";

export class MatchedMeasurements {

    private readonly directionSpeeds: DirectionSpeed[] = [];

    public total: number = 0;
    public minSpeed: number = 0;
    public maxSpeed: number = 0;

    public firstDateTime: number = Date.now() / 1000;
    public lastDateTime: number = 0;

    add(direction: number | string, speed: number, time: number, seconds: number = 1) {
        this.directionSpeeds.push(new DirectionSpeed(direction, speed, seconds));
        if (speed < this.minSpeed) {
            this.minSpeed = speed;
        }
        if (speed > this.maxSpeed) {
            this.maxSpeed = speed;
        }
        console.log('First', this.firstDateTime, this.lastDateTime, time);
        if (time < this.firstDateTime) {
            this.firstDateTime = time;
        }
        if (time > this.lastDateTime) {
            this.lastDateTime = time;
        }
        this.total += speed;
    }

    getMeasurements(): DirectionSpeed[] {
        return this.directionSpeeds;
    }

    getAverageSpeed(): number {
        return this.total / this.directionSpeeds.length;
    }

    getMeasurementCount(): number {
        return this.directionSpeeds.length;
    }

    getInfo(): string {
        return `Matches:    ${this.directionSpeeds.length} - min: ${this.minSpeed} - max: ${this.maxSpeed} - average: ${this.getAverageSpeed()}`;
    }
}
