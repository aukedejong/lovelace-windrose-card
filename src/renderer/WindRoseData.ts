export class WindRoseData {

    constructor(
        readonly speedRangePercentages: number[],
        readonly directionSpeedRangePercentages: number[][],
        readonly directionPercentages: number[],
        readonly directionDegrees: number[],
        readonly circleCount: number,
        readonly percentagePerCircle: number,
        readonly maxCirclePercentage: number
    ) {}
}