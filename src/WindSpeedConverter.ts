
export class SpeedUnit {
    public speedRanges: SpeedRange[] = [];
    constructor(
        public readonly name: string,
        public readonly toMpsFunc: (speed: number) => number,
        public readonly fromMpsFunc: (speed: number) => number,
        public readonly speedRangeStep: number | undefined,
        public readonly speedRangeMax: number | undefined) {
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

export class WindSpeedConverter {

    readonly bft = new SpeedUnit("Beaufort",
        (speed: number) => speed,
        (speed: number) => speed, undefined, undefined);

    readonly mps = new SpeedUnit("m/s",
        (speed: number) => speed,
        (speed: number) => speed, 5, 30);

    readonly kph = new SpeedUnit("km/h",
        (speed: number) => speed / 3.6,
        (speed: number) => speed * 3.6, 10, 100);

    readonly mph = new SpeedUnit("m/h",
        (speed: number) => speed / 2.2369,
        (speed: number) => speed * 2.2369, 10, 70);

    readonly fps = new SpeedUnit("ft/s",
        (speed: number) => speed / 3.2808399,
        (speed: number) => speed * 3.2808399, 10, 100);

    readonly knots = new SpeedUnit("knots",
        (speed: number) => speed / 1.9438444924406,
        (speed: number) => speed * 1.9438444924406, 5, 60);

    readonly inputSpeedUnit: SpeedUnit;
    readonly outputSpeedUnit: SpeedUnit;

    constructor(private readonly inputUnit: string,
                private readonly outputUnit: string,
                private readonly rangeStep?: number,
                private readonly rangeMax?: number) {
        this.inputSpeedUnit = this.getSpeedUnit(this.inputUnit);
        this.outputSpeedUnit = this.getSpeedUnit(this.outputUnit);

        if (outputUnit === 'bft') {
            this.outputSpeedUnit.speedRanges = this.generateBeaufortSpeedRanges();

        } else if (rangeStep && rangeMax) {
            this.outputSpeedUnit.speedRanges = this.generateSpeedRanges(rangeStep, rangeMax);

        } else {
            this.outputSpeedUnit.speedRanges = this.generateSpeedRanges(this.outputSpeedUnit.speedRangeStep!,
                this.outputSpeedUnit.speedRangeMax!);
        }
        console.log('Output: ', this.outputSpeedUnit);
    }

    getOutputSpeedUnit(): SpeedUnit {
        return this.outputSpeedUnit;
    }

    getSpeedConverter(): (speed: number) => number {
        if (this.inputUnit === this.outputUnit) {
            return (inputSpeed: number) => inputSpeed;
        } else if (this.inputUnit === 'mps') {
            return this.outputSpeedUnit.fromMpsFunc;
        }
        const toMpsFunction = this.inputSpeedUnit.toMpsFunc;
        const fromMpsFunction = this.outputSpeedUnit.fromMpsFunc;
        return (speed: number) => fromMpsFunction(toMpsFunction(speed));
    }

    getRangeFunction(): (speed: number) => number {
        return (speed: number) => {
            const speedRange = this.outputSpeedUnit.speedRanges.find(speedRange => speedRange.isRangeMatch(speed));
            if (speedRange) {
                return speedRange.range;
            }
            throw new Error("Speed is not in a speedrange: " + speed + " unit: " + this.outputUnit);
        }
    }

    getRangeCount(): number {
        return this.outputSpeedUnit.speedRanges.length;
    }

    private getSpeedUnit(unit: string): SpeedUnit {
        switch (unit) {
            case 'bft': return this.bft;
            case 'mps': return this.mps;
            case 'kph': return this.kph;
            case 'mph': return this.mph;
            case 'fps': return this.fps;
            case 'knots': return this.knots;
            default: throw new Error("Unknown speed unit: " + unit);
        }
    }

    private generateSpeedRanges(step: number, max: number): SpeedRange[] {
        const speedRanges = [] as SpeedRange[];
        let currentSpeed = 0;
        let range = 0;
        while (currentSpeed <= max - step) {
            speedRanges.push(new SpeedRange(range, currentSpeed, currentSpeed + step));
            range++;
            currentSpeed += step;
        }
        speedRanges.push(new SpeedRange(range, currentSpeed, -1));
        return speedRanges;
    }

    private generateBeaufortSpeedRanges(): SpeedRange[] {
        return [
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
    }
}
