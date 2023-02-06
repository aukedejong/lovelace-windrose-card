export class MeasurementMatcher {

    constructor(private readonly directionData: HistoryData[],
                private readonly speedData: HistoryData[],
                private readonly timeDiff: number) {
    }

    match(): DirectionSpeed[] {
        const matchedData: DirectionSpeed[] = [];
        this.directionData.forEach((direction) => {
            const speed = this.findMatchingSpeed(direction.lu);
            if (speed) {
                if (speed.s === '' || speed.s === null || isNaN(+speed.s)) {
                    console.log("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                } else {
                    matchedData.push(new DirectionSpeed(direction.s, +speed.s));
                }
            } else {
                console.log('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
            }
        })
        return matchedData;
    }

    private findMatchingSpeed(timestamp: number): HistoryData | undefined {
        return this.speedData.find(
            (speed) => speed.lu > timestamp - this.timeDiff && speed.lu < timestamp + this.timeDiff);
    }

}

interface HistoryData {
    a: any;
    lu: number;
    s: string;
}

export class DirectionSpeed {

    constructor(
        public direction: number | string,
        public speed: number) {
    }
}