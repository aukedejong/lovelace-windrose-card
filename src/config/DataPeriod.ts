export class DataPeriod {
    constructor(
        public readonly hourstoShow: number | undefined,
        public readonly fromHourOfDay: number | undefined,
        public readonly timeInterval: number,
        public readonly logMeasurementCounts: boolean) {
    }
}
