import {DirectionSpeed} from "./DirectionSpeed";
import {Log} from "../util/Log";

export class MeasurementMatcher {

    constructor(private readonly matchingStrategy: string) {
        Log.debug('Matching init:', matchingStrategy);
        if (this.matchingStrategy !== 'direction-first' && this.matchingStrategy !== 'speed-first') {
            throw Error('Unkown matchfing strategy: ' + this.matchingStrategy);
        }
    }

    matchStatsHistory(directionStats: StatisticsData[], speedHistory: HistoryData[]): DirectionSpeed[]  {
        const directionSpeed: DirectionSpeed[] = [];
        if (this.matchingStrategy == 'direction-first') {
            for (const direction of directionStats) {
                const speed = this.findHistoryInPeriod(direction, speedHistory);
                if (speed) {
                    if (speed.s === '' || speed.s === null || isNaN(+speed.s)) {
                        Log.warn("Spped " + speed.s + " at timestamp " + direction.start + " is not a number.");
                    } else {
                        directionSpeed.push(new DirectionSpeed(direction.mean, +speed.s));
                    }
                } else {
                    Log.trace('No matching speed found for direction ' + direction.mean + " at timestamp " + direction.start);
                }
            }

        } else {
            for (const speed of speedHistory) {
                const direction = this.findStatsAtTime(speed.lu * 1000, directionStats);
                if (direction) {
                    directionSpeed.push(new DirectionSpeed(direction.mean, +speed.s));
                    if (speed.s === '' || speed.s === null || isNaN(+speed.s)) {
                        Log.warn("Spped " + speed.s + " at timestamp " + direction.start + " is not a number.");
                    } else {
                        directionSpeed.push(new DirectionSpeed(direction.mean, +speed.s));
                    }
                } else {
                    Log.trace('No matching direction found for speed ' + speed.s + " at timestamp " + speed.lu);
                }
            }
        }
        return directionSpeed;
    }

    matchHistoryStats(directionHistory: HistoryData[], speedStats: StatisticsData[]): DirectionSpeed[] {
        const directionSpeed: DirectionSpeed[] = [];
        if (this.matchingStrategy == 'direction-first') {
            for (const direction of directionHistory) {
                const speed = this.findStatsAtTime(direction.lu * 1000, speedStats);
                if (speed) {
                    directionSpeed.push(new DirectionSpeed(direction.s, speed.mean));
                } else {
                    Log.trace('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
                }
            }

        } else {
            for (const speed of speedStats) {
                const direction = this.findHistoryInPeriod(speed, directionHistory);
                if (direction) {
                    if (direction.s === '' || direction.s === null || isNaN(+direction.s)) {
                        Log.warn("Direction " + direction.s + " at timestamp " + direction.lu + " is not a number.");
                    } else {
                        directionSpeed.push(new DirectionSpeed(direction.s, speed.mean));
                    }
                } else {
                    Log.trace('No matching direction found for speed ' + speed.start + " at timestamp " + speed.mean);
                }
            }
        }
        return directionSpeed;
    }

    matchHistoryHistory(directionHistory: HistoryData[], speedHistory: HistoryData[]): DirectionSpeed[]  {
        const directionSpeed: DirectionSpeed[] = [];
        if (this.matchingStrategy == 'direction-first') {
            for (const direction of directionHistory) {
                const speed = this.findHistoryBackAtTime(direction.lu, speedHistory);
                if (speed) {
                    if (speed.s === '' || speed.s === null || isNaN(+speed.s)) {
                        Log.warn("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                    } else {
                        directionSpeed.push(new DirectionSpeed(direction.s, +speed.s));
                    }
                } else {
                    Log.trace('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
                }
            }
        } else {
            for (const speed of speedHistory) {
                const direction = this.findHistoryBackAtTime(speed.lu, directionHistory);
                if (direction) {
                    if (direction.s === '' || direction.s === null || isNaN(+direction.s)) {
                        Log.warn("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                    } else {
                        directionSpeed.push(new DirectionSpeed(direction.s, +speed.s));
                    }
                } else {
                    Log.trace('No matching direction found for speed ' + speed.s + " at timestamp " + speed.lu);
                }
            }
        }

        return directionSpeed;
    }

    matchStatsStats(directionStats: StatisticsData[], speedStats: StatisticsData[]): DirectionSpeed[]  {
        const directionSpeed: DirectionSpeed[] = [];
        if (this.matchingStrategy == 'direction-first') {
            for (const directionStat of directionStats) {
                const matchedSpeed = this.findMatchingStatistic(directionStat, speedStats);
                if (matchedSpeed) {
                    directionSpeed.push(new DirectionSpeed(directionStat.mean, matchedSpeed.mean));
                } else {
                    Log.trace(`No matching speed found for direction ${directionStat.mean} at timestamp start:${directionStat.start} end:${directionStat.end}`);
                }
            }
        } else {
            for (const speedStat of speedStats) {
                const matchedDirection = this.findMatchingStatistic(speedStat, directionStats);
                if (matchedDirection) {
                    directionSpeed.push(new DirectionSpeed(matchedDirection.mean, speedStat.mean));
                } else {
                    Log.trace(`No matching direction found for speed ${speedStat.mean} at timestamp start:${speedStat.start} end:${speedStat.end}`);
                }
            }
        }
        return directionSpeed;
    }

    private findStatsAtTime(timestamp: number, stats: StatisticsData[]): StatisticsData | undefined {
        return stats.find((stat) => stat.start <= timestamp && timestamp <= stat.end);
    }


    private findHistoryInPeriod(stat: StatisticsData, history: HistoryData[]): HistoryData | undefined {
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

    private findMatchingStatistic(statistic: StatisticsData, stats: StatisticsData[]): StatisticsData | undefined {
        return stats.find((stat) => statistic.start === stat.start && statistic.end === stat.end);
    }

    private findHistoryBackAtTime(timestamp: number, history: HistoryData[]): HistoryData | undefined {
        let match: HistoryData | undefined ;
        for (const measurement of history) {
            if (measurement.lu <= timestamp) {
                match = measurement;
            } else {
                break;
            }
        }
        return match;
    }

}