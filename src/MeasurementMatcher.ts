export class MeasurementMatcher {

    constructor(private readonly directionData: HistoryData[],
                private readonly speedData: HistoryData[]) {
    }

    match(): DirectionSpeed[] {
        const matchedData: DirectionSpeed[] = [];
        this.directionData.forEach((direction) => {
            let speed = this.findMatchingSpeed(direction.lu);
            if (speed) {
                matchedData.push(new DirectionSpeed(direction.s, speed.s));
            }
        })
        return matchedData;
    }

    private findMatchingSpeed(timestamp: number): HistoryData | undefined {
        return this.speedData.find((speed) => {
            return speed.lu > timestamp - 1 && speed.lu < timestamp + 1;
        });
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
        public speed: string) {
    }
}