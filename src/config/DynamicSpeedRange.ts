export class DynamicSpeedRange {

    constructor(public readonly average_below: number,
                public readonly step: number,
                public readonly max: number) {
    }
}
