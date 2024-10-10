import {Log} from "../util/Log";
import {DirectionSpeed} from "./DirectionSpeed";
import {MeasurementMatcher} from "./MeasurementMatcher";
import {MatchUtils} from "./MatchUtils";

export class DirectionFirstMatcher implements MeasurementMatcher {

    matchStatsHistory(directionStats: StatisticsData[], speedHistory: HistoryData[]): DirectionSpeed[]  {
        const directionSpeed: DirectionSpeed[] = [];

        for (const direction of directionStats) {
            const speed = MatchUtils.findHistoryInPeriod(direction, speedHistory);
            if (speed) {
                if (MatchUtils.isInvalidSpeed(speed.s)) {
                    Log.warn("Speed " + speed.s + " at timestamp " + direction.start + " is not a number.");
                } else {
                    directionSpeed.push(new DirectionSpeed(direction.mean, +speed.s));
                }
            } else {
                Log.trace('No matching speed found for direction ' + direction.mean + " at timestamp " + direction.start);
            }
        }

        return directionSpeed;
    }

    matchHistoryStats(directionHistory: HistoryData[], speedStats: StatisticsData[]): DirectionSpeed[] {
        const directionSpeed: DirectionSpeed[] = [];

        for (const direction of directionHistory) {
            const speed = MatchUtils.findStatsAtTime(direction.lu * 1000, speedStats);
            if (speed) {
                directionSpeed.push(new DirectionSpeed(direction.s, speed.mean));
            } else {
                Log.trace('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
            }
        }

        return directionSpeed;
    }

    matchHistoryHistory(directionHistory: HistoryData[], speedHistory: HistoryData[]): DirectionSpeed[]  {
        const directionSpeed: DirectionSpeed[] = [];

        for (const direction of directionHistory) {
            const speed = MatchUtils.findHistoryBackAtTime(direction.lu, speedHistory);
            if (speed) {
                if (MatchUtils.isInvalidSpeed(speed.s)) {
                    Log.warn("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                } else {
                    directionSpeed.push(new DirectionSpeed(direction.s, +speed.s));
                }
            } else {
                Log.trace('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
            }
        }

        return directionSpeed;
    }

    matchStatsStats(directionStats: StatisticsData[], speedStats: StatisticsData[]): DirectionSpeed[]  {
        const directionSpeed: DirectionSpeed[] = [];
        for (const directionStat of directionStats) {
            const matchedSpeed = MatchUtils.findMatchingStatistic(directionStat, speedStats);
            if (matchedSpeed) {
                directionSpeed.push(new DirectionSpeed(directionStat.mean, matchedSpeed.mean));
            } else {
                Log.trace(`No matching speed found for direction ${directionStat.mean} at timestamp start:${directionStat.start} end:${directionStat.end}`);
            }
        }

        return directionSpeed;
    }
}
