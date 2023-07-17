
export class WindBarConfig {

    constructor(
        public label: string,
        public orientation: string,
        public full: boolean,
        public renderRelativeScale: boolean,
        public outputUnitLabel: string | undefined,
        public speedRangeBeaufort: boolean,

        public barBorderColor: string,
        public barUnitNameColor: string,
        public barNameColor: string,
        public barUnitValuesColor: string,
        public barPercentagesColor: string,
        ) {
    }
}