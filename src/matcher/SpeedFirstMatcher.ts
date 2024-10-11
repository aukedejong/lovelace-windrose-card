import {Log} from "../util/Log";
import {DirectionSpeed} from "./DirectionSpeed";
import {MeasurementMatcher} from "./MeasurementMatcher";
import {MatchUtils} from "./MatchUtils";

export class SpeedFirstMatcher implements MeasurementMatcher {

    matchStatsHistory(directionStats: StatisticsData[], speedHistory: HistoryData[]): DirectionSpeed[]  {
        const directionSpeed: DirectionSpeed[] = [];

        for (const speed of speedHistory) {
            const direction = MatchUtils.findStatsAtTime(speed.lu * 1000, directionStats);
            if (direction) {
                if (direction.mean === null || direction.mean === undefined) {
                    Log.warn("Direction " + direction.mean + " at timestamp " + direction.start + " is not valid.");
                } else {
                    directionSpeed.push(new DirectionSpeed(direction.mean, +speed.s));
                }
            } else {
                Log.trace('No matching direction found for speed ' + speed.s + " at timestamp " + speed.lu);
            }
        }

        return directionSpeed;
    }

    matchHistoryStats(directionHistory: HistoryData[], speedStats: StatisticsData[]): DirectionSpeed[] {
        const directionSpeed: DirectionSpeed[] = [];

        for (const speed of speedStats) {
            const direction = MatchUtils.findHistoryInPeriod(speed, directionHistory);
            if (direction) {
                if (direction.s === '' || direction.s === null || direction.s === undefined) {
                    Log.warn("Direction " + direction.s + " at timestamp " + direction.lu + " is not valid.");
                } else {
                    directionSpeed.push(new DirectionSpeed(direction.s, speed.mean));
                }
            } else {
                Log.trace('No matching direction found for speed ' + speed.mean + " at timestamp " + speed.start);
            }
        }

        return directionSpeed;
    }

    matchHistoryHistory(directionHistory: HistoryData[], speedHistory: HistoryData[]): DirectionSpeed[]  {
        const directionSpeed: DirectionSpeed[] = [];

        for (const speed of speedHistory) {
            if (MatchUtils.isValidSpeed(speed.s)) {
                const direction = MatchUtils.findHistoryBackAtTime(speed.lu, directionHistory);
                if (direction) {
                    if (direction.s === '' || direction.s === null || direction.s === undefined) {
                        Log.warn("Direction " + direction.s + " at timestamp " + direction.lu + " is not valid.");
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

        for (const speedStat of speedStats) {
            const matchedDirection = MatchUtils.findMatchingStatistic(speedStat, directionStats);
            if (matchedDirection) {
                directionSpeed.push(new DirectionSpeed(matchedDirection.mean, speedStat.mean));
            } else {
                Log.trace(`No matching direction found for speed ${speedStat.mean} at timestamp start:${speedStat.start} end:${speedStat.end}`);
            }
        }

        return directionSpeed;
    }
}
