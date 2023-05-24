
export class WindBarConfig {

    constructor(
        public label: string,
        public orientation: string,
        public full: boolean,
        public inputUnit: string,
        public outputUnit: string,
        public outputUnitLabel: string | undefined,

        public barBorderColor: string,
        public barUnitNameColor: string,
        public barNameColor: string,
        public barUnitValuesColor: string,
        public barPercentagesColor: string,
        ) {
    }
}