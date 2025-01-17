export class SpeedUnit {

    constructor(
        public readonly name: string,
        public readonly configs: string[],
        public readonly toMpsFunc: (speed: number) => number,
        public readonly fromMpsFunc: (speed: number) => number,
        public readonly speedRangeStep: number | undefined,
        public readonly speedRangeMax: number | undefined) {
    }
}
