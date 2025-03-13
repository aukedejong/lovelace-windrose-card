export class SegmentPosition {

    public readonly center: number;

    constructor(public readonly start: number,
                public readonly end: number,
                public readonly minSpeed: number,
                public readonly maxSpeed: number,
                public readonly scale: number,
                public readonly showLastLabel: boolean) {

        this.center =  start + ((end - start) / 2);
    }

    calcPosition(speed: number, minus = false) {
        if (speed < this.minSpeed) {
            throw new Error('Wrong speed range for current direction arrow, report bug');
        } else if (speed > this.maxSpeed) {
            return this.end;
        }
        if (minus) {
            return this.start - ((speed - this.minSpeed) * this.scale);
        }
        return this.start + ((speed - this.minSpeed) * this.scale);
    }
}
