import {ColorUtil} from "./ColorUtil";

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
        public readonly maxSpeed: number,
        public readonly color: string) {
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
                private readonly rangeMax?: number,
                private readonly speedRanges?: SpeedRange[]) {

        this.inputSpeedUnit = this.getSpeedUnit(this.inputUnit);
        this.outputSpeedUnit = this.getSpeedUnit(this.outputUnit);

        if (outputUnit === 'bft') {
            this.outputSpeedUnit.speedRanges = this.generateBeaufortSpeedRanges(inputUnit);

        } else if (speedRanges && speedRanges.length > 0) {
            this.outputSpeedUnit.speedRanges = speedRanges;

        } else if (rangeStep && rangeMax) {
            this.outputSpeedUnit.speedRanges = this.generateSpeedRanges(rangeStep, rangeMax);

        } else {
            this.outputSpeedUnit.speedRanges = this.generateSpeedRanges(this.outputSpeedUnit.speedRangeStep!,
                this.outputSpeedUnit.speedRangeMax!);
        }
        //console.log('Speed ranges: ', this.outputSpeedUnit.speedRanges);
    }

    getOutputSpeedUnit(): SpeedUnit {
        return this.outputSpeedUnit;
    }

    getSpeedConverter(): (speed: number) => number {
        if (this.inputUnit === this.outputUnit || this.outputUnit === 'bft') {
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

    getSpeedRanges(): SpeedRange[] {
        return this.outputSpeedUnit.speedRanges;
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
        const colors = new ColorUtil().getColorArray(Math.floor(max / step) + 1);
        const speedRanges = [] as SpeedRange[];
        let currentSpeed = 0;
        let range = 0;
        while (currentSpeed <= max - step) {
            speedRanges.push(new SpeedRange(range, currentSpeed, currentSpeed + step, colors[range]));
            range++;
            currentSpeed += step;
        }
        speedRanges.push(new SpeedRange(range, currentSpeed, -1, colors[range]));
        return speedRanges;
    }

    private generateBeaufortSpeedRanges(inputUnit: string): SpeedRange[] {
        const colors = new ColorUtil().getColorArray(13);
        if (inputUnit === 'mps') {
            return [
                new SpeedRange(0, 0, 0.5, colors[0]),
                new SpeedRange(1, 0.5, 1.6, colors[1]),
                new SpeedRange(2, 1.6, 3.4, colors[2]),
                new SpeedRange(3, 3.4, 5.5, colors[3]),
                new SpeedRange(4, 5.5, 8, colors[4]),
                new SpeedRange(5, 8, 10.8, colors[5]),
                new SpeedRange(6, 10.8, 13.9, colors[6]),
                new SpeedRange(7, 13.9, 17.2, colors[7]),
                new SpeedRange(8, 17.2, 20.8, colors[8]),
                new SpeedRange(9, 20.8, 24.5, colors[9]),
                new SpeedRange(10, 24.5, 28.5, colors[10]),
                new SpeedRange(11, 28.5, 32.7, colors[11]),
                new SpeedRange(12, 32.7, -1, colors[12])
            ];
        } else if (inputUnit === 'kph') {
            return [
                new SpeedRange(0, 0, 2, colors[0]),
                new SpeedRange(1, 2, 6, colors[1]),
                new SpeedRange(2, 6, 12, colors[2]),
                new SpeedRange(3, 12, 20, colors[3]),
                new SpeedRange(4, 20, 29, colors[4]),
                new SpeedRange(5, 29, 39, colors[5]),
                new SpeedRange(6, 39, 50, colors[6]),
                new SpeedRange(7, 50, 62, colors[7]),
                new SpeedRange(8, 62, 75, colors[8]),
                new SpeedRange(9, 75, 89, colors[9]),
                new SpeedRange(10, 89, 103, colors[10]),
                new SpeedRange(11, 103, 118, colors[11]),
                new SpeedRange(12, 118, -1, colors[12])
            ];
        } else if (inputUnit === 'mph') {
            return [
                new SpeedRange(0, 0, 1, colors[0]),
                new SpeedRange(1, 1, 4, colors[1]),
                new SpeedRange(2, 4, 8, colors[2]),
                new SpeedRange(3, 8, 13, colors[3]),
                new SpeedRange(4, 13, 19, colors[4]),
                new SpeedRange(5, 19, 25, colors[5]),
                new SpeedRange(6, 25, 32, colors[6]),
                new SpeedRange(7, 32, 39, colors[7]),
                new SpeedRange(8, 39, 47, colors[8]),
                new SpeedRange(9, 47, 55, colors[9]),
                new SpeedRange(10, 55, 64, colors[10]),
                new SpeedRange(11, 64, 73, colors[11]),
                new SpeedRange(12, 73, -1, colors[12])
            ];
        } else if (inputUnit === 'fps') {
            return [
                new SpeedRange(0, 0, 1.6, colors[0]),
                new SpeedRange(1, 1.6, 5.2, colors[1]),
                new SpeedRange(2, 5.2, 11.2, colors[2]),
                new SpeedRange(3, 11.2, 18, colors[3]),
                new SpeedRange(4, 18, 26.2, colors[4]),
                new SpeedRange(5, 26.2, 35.4, colors[5]),
                new SpeedRange(6, 35.4, 45.6, colors[6]),
                new SpeedRange(7, 45.6, 56.4, colors[7]),
                new SpeedRange(8, 56.4, 68.2, colors[8]),
                new SpeedRange(9, 68.2, 80.4, colors[9]),
                new SpeedRange(10, 80.4, 93.5, colors[10]),
                new SpeedRange(11, 93.5, 107, colors[11]),
                new SpeedRange(12, 107, -1, colors[12])
            ];
        } else if (inputUnit === 'knots') {
            return [
                new SpeedRange(0, 0, 1, colors[0]),
                new SpeedRange(1, 1, 4, colors[1]),
                new SpeedRange(2, 4, 7, colors[2]),
                new SpeedRange(3, 7, 11, colors[3]),
                new SpeedRange(4, 11, 17, colors[4]),
                new SpeedRange(5, 17, 22, colors[5]),
                new SpeedRange(6, 22, 28, colors[6]),
                new SpeedRange(7, 28, 34, colors[7]),
                new SpeedRange(8, 34, 41, colors[8]),
                new SpeedRange(9, 41, 48, colors[9]),
                new SpeedRange(10, 48, 56, colors[10]),
                new SpeedRange(11, 56, 64, colors[11]),
                new SpeedRange(12, 64, -1, colors[12])
            ];
        }
        throw new Error("No Bft reanges for input speed unit:: " + inputUnit);
    }
}
