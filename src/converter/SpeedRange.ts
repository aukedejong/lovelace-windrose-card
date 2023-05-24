export class SpeedRange {
    constructor(
        public readonly range: number,
        public readonly minSpeed: number,
        public readonly maxSpeed: number,
        public readonly color: string) {
    }

    isRangeMatch(speed: number): boolean {
        return speed >= this.minSpeed && (speed < this.maxSpeed || this.maxSpeed === -1);
    }
}