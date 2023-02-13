export class WindSpeedConverter {

    getSpeedConverter(inputUnit: string, outputUnit: string): (speed: number) => number {
        if (inputUnit === outputUnit) {
            return (inputSpeed: number) => inputSpeed;
        } else if (inputUnit === 'mps') {
            return SpeedUnits.getSpeedUnit(outputUnit).fromMpsFunc;
        }
        const toMpsFunction = SpeedUnits.getSpeedUnit(inputUnit).toMpsFunc;
        const fromMpsFunction = SpeedUnits.getSpeedUnit(outputUnit).fromMpsFunc;
        return (speed: number) => fromMpsFunction(toMpsFunction(speed));
    }

    getRangeFunction(outputUnit: string): (speed: number) => number {
        const speedRanges = SpeedUnits.getSpeedUnit(outputUnit).speedRanges;
        return (speed: number) => {
            const speedRange = speedRanges.find(speedRange => speedRange.isRangeMatch(speed));
            if (speedRange) {
                return speedRange.range;
            }
            throw new Error("Speed is not in a speedrange: " + speed + " unit: " + outputUnit);
        }
    }
}

export class SpeedUnit {
    constructor(
        public readonly name: string,
        public readonly toMpsFunc: (speed: number) => number,
        public readonly fromMpsFunc: (speed: number) => number,
        public readonly speedRanges: SpeedRange[]) {
    }
}

export class SpeedRange {
    constructor(
        public readonly range: number,
        public readonly minSpeed: number,
        public readonly maxSpeed: number) {
    }

    isRangeMatch(speed: number): boolean {
        //console.log(this.minSpeed, speed, this.maxSpeed,  speed >= this.minSpeed && (speed < this.maxSpeed || this.maxSpeed === -1));
        return speed >= this.minSpeed && (speed < this.maxSpeed || this.maxSpeed === -1);
    }
}

export class SpeedUnits {
    static speedRangesBft = [
        new SpeedRange(0, 0, 0.3),
        new SpeedRange(1, 0.3, 1.6),
        new SpeedRange(2, 1.6, 3.4),
        new SpeedRange(3, 3.4, 5.5),
        new SpeedRange(4, 5.5, 8),
        new SpeedRange(5, 8, 10.8),
        new SpeedRange(6, 10.8, 13.9),
        new SpeedRange(7, 13.9, 17.2),
        new SpeedRange(8, 17.2, 20.8),
        new SpeedRange(9, 20.8, 24.5),
        new SpeedRange(10, 24.5, 28.5),
        new SpeedRange(11, 28.5, 32.7),
        new SpeedRange(12, 32.7, -1)
    ];
    static speedRangesMps = [
        new SpeedRange(0, 0, 1),
        new SpeedRange(1, 1, 2),
        new SpeedRange(2, 2, 4),
        new SpeedRange(3, 4, 6),
        new SpeedRange(4, 6, 8),
        new SpeedRange(5, 8, 11),
        new SpeedRange(6, 11, 14),
        new SpeedRange(7, 14, 17),
        new SpeedRange(8, 17, 20),
        new SpeedRange(9, 20, 25),
        new SpeedRange(10, 25, 29),
        new SpeedRange(11, 29, 33),
        new SpeedRange(12, 33, -1)
    ];
    static speedRangesMph = [
        new SpeedRange(0, 0, 5),
        new SpeedRange(1, 5, 10),
        new SpeedRange(1, 10, 15),
        new SpeedRange(2, 15, 20),
        new SpeedRange(3, 20, 30),
        new SpeedRange(4, 30, 40),
        new SpeedRange(5, 40, 50),
        new SpeedRange(6, 50, 60),
        new SpeedRange(7, 60, 70),
        new SpeedRange(8, 70, -1),
    ];
    static speedRangesKph = [
        new SpeedRange(0, 0, 10),
        new SpeedRange(2, 10, 20),
        new SpeedRange(3, 20, 30),
        new SpeedRange(4, 30, 40),
        new SpeedRange(5, 40, 50),
        new SpeedRange(6, 50, 60),
        new SpeedRange(7, 60, 70),
        new SpeedRange(7, 70, 80),
        new SpeedRange(8, 80, -1),
    ];
    static speedRangesFps = [
        new SpeedRange(0, 0, 5),
        new SpeedRange(1, 5, 10),
        new SpeedRange(2, 10, 20),
        new SpeedRange(4, 20, 30),
        new SpeedRange(5, 30, 40),
        new SpeedRange(6, 40, 50),
        new SpeedRange(7, 50, 60),
        new SpeedRange(7, 60, 70),
        new SpeedRange(8, 70, 80),
        new SpeedRange(9, 80, 90),
        new SpeedRange(10, 90, -1),
    ];
    static speedRangesKnots = [
        new SpeedRange(0, 0, 5),
        new SpeedRange(1, 5, 10),
        new SpeedRange(2, 10, 15),
        new SpeedRange(3, 15, 20),
        new SpeedRange(4, 20, 30),
        new SpeedRange(5, 30, 40),
        new SpeedRange(6, 40, 50),
        new SpeedRange(7, 50, 60),
        new SpeedRange(8, 60, -1),
    ];

    static bft = new SpeedUnit("Beaufort",
        (speed: number) => speed,
        (speed: number) => speed,
        SpeedUnits.speedRangesBft
        )
    
    static mps = new SpeedUnit("m/s",
        (speed: number) => speed,
        (speed: number) => speed,
        SpeedUnits.speedRangesMps
        );
    static kph = new SpeedUnit("km/h",
        (speed: number) => speed / 3.6,
        (speed: number) => speed * 3.6,
        SpeedUnits.speedRangesKph);

    static mph = new SpeedUnit("m/h",
        (speed: number) => speed / 2.2369,
        (speed: number) => speed * 2.2369,
        SpeedUnits.speedRangesMph);

    static fps = new SpeedUnit("ft/s",
        (speed: number) => speed / 3.2808399,
        (speed: number) => speed * 3.2808399,
        SpeedUnits.speedRangesFps);

    static knots = new SpeedUnit("knots",
        (speed: number) => speed / 1.9438444924406,
        (speed: number) => speed * 1.9438444924406,
        SpeedUnits.speedRangesKnots);

    static getSpeedUnit(unit: string): SpeedUnit {
        switch (unit) {
            case 'bft': return SpeedUnits.bft;
            case 'mps': return SpeedUnits.mps;
            case 'kph': return SpeedUnits.kph;
            case 'mph': return SpeedUnits.mph;
            case 'fps': return SpeedUnits.fps;
            case 'knots': return SpeedUnits.knots;
            default: throw new Error("Unknown speed unit: " + unit);
        }
    }
}

