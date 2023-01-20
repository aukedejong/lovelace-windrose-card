export class WindRoseConfig {

    constructor(
        public outerRadius: number,
        public centerRadius: number,
        public centerX: number,
        public centerY: number,
        public leaveCount: number,
        public leaveArc: number,
        public cardinalDirectionLetters: string,
        public directionCompensation: number) {
    }

}