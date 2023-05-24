export class WindDirection {

    constructor(
        readonly minDegrees: number,
        readonly maxDegrees: number
    ) {}

    checkDirection(direction: number): boolean {
        if (this.minDegrees < 0) {
            return (direction - 360) > this.minDegrees || direction <= this.maxDegrees;
        }
        return direction > this.minDegrees && direction <= this.maxDegrees;
    }
}