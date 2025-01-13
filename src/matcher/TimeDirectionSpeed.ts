export class TimeDirectionSpeed {

    public direction: number | string | undefined;
    public speed: number | undefined;
    public seconds: number | undefined;

    constructor(public time: number) {
    }

    static directionFromHistoryData(historyData: HistoryData): TimeDirectionSpeed {
        const tds = new TimeDirectionSpeed(historyData.lu);
        tds.direction = historyData.s;
        return tds;
    }

    static speedFromHistoryData(historyData: HistoryData): TimeDirectionSpeed {
        const tds = new TimeDirectionSpeed(historyData.lu);
        tds.speed = +historyData.s;
        return tds;
    }

    static directionFromStatsData(statsData: StatisticsData): TimeDirectionSpeed {
        const tds = new TimeDirectionSpeed(statsData.start / 1000);
        tds.direction = statsData.mean;
        return tds;
    }

    static speedFromStatsData(statsData: StatisticsData): TimeDirectionSpeed {
        const tds = new TimeDirectionSpeed(statsData.start / 1000);
        tds.speed = statsData.mean;
        return tds;
    }
}
