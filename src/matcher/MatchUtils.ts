export class MatchUtils {

    public static findStatsAtTime(timestamp: number, stats: StatisticsData[]): StatisticsData | undefined {
        return stats.find((stat) => stat.start <= timestamp && timestamp <= stat.end);
    }
    
    public static findHistoryInPeriod(stat: StatisticsData, history: HistoryData[]): HistoryData | undefined {
        const start = stat.start / 1000;
        const end = stat.end / 1000;
        const selection = history.filter((measurement) => start < measurement.lu && end >= measurement.lu);
        if (selection.length == 1) {
            return selection[0];
        } else if (selection.length > 1) {
            selection.sort((a, b) => b.lu - a.lu);
            return selection[Math.trunc(selection.length / 2)];
        }
        return undefined;
    }

    public static findMatchingStatistic(statistic: StatisticsData, stats: StatisticsData[]): StatisticsData | undefined {
        return stats.find((stat) => statistic.start === stat.start && statistic.end === stat.end);
    }

    public static findHistoryBackAtTime(timestamp: number, history: HistoryData[]): HistoryData | undefined {
        for (let i = history.length - 1; i >= 0; --i) {

            if (timestamp > history[i].lu) {
                return history[i];
            }
        }
        return undefined;
    }

    public static isInvalidSpeed(speed: string) {
        return speed === '' || speed === null || speed === undefined || isNaN(+speed);
    }

    public static isValidSpeed(speed: string) {
        return speed !== '' && speed !== null && speed !== undefined && !isNaN(+speed);
    }

    public static isNumber(value: string | number | undefined) {
        return value !== '' && value !== null && value !== undefined && !isNaN(+value);
    }

    public static cleanDate(date: number) {
        return new Date(date * 1000).toLocaleString();
    }
}
