export class Measurement {

    constructor(public readonly startTime: number,
                public endTime: number,
                public readonly value: string) {
    }

    public static getHistoryValue: (data: HistoryData) => string;

    public static getStatsValue: (data: StatisticsData) => string;

    public static fromHistory: (data: HistoryData) => Measurement;

    public static fromStats: (data: StatisticsData) => Measurement;

    public static init(attribute: string | undefined, stats: boolean) {
        if (stats) {
            Measurement.fromStats = (stat: StatisticsData) => {
                return new Measurement(stat.start / 1000, stat.end / 1000, stat.mean);
            };
            Measurement.getStatsValue = (stat: StatisticsData) => {
                return stat.mean;
            };
        } else {
            if (attribute) {
                Measurement.fromHistory = (history: HistoryData) => {
                    return new Measurement(history.lu, history.lu, history.a[attribute]);
                };
                Measurement.getHistoryValue = (history: HistoryData) => {
                    return history.a[attribute];
                }
            } else {
                Measurement.fromHistory = (history: HistoryData) => {
                    return new Measurement(history.lu, history.lu, history.s);
                };
                Measurement.getHistoryValue = (history: HistoryData) => {
                    return history.s;
                }
            }
        }
    }
}
