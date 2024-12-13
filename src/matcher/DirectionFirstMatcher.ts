import {Log} from "../util/Log";
import {MeasurementMatcher} from "./MeasurementMatcher";
import {MatchUtils} from "./MatchUtils";
import {MatchedMeasurements} from "./MatchedMeasurements";

export class DirectionFirstMatcher implements MeasurementMatcher {

    matchStatsHistory(directionStats: StatisticsData[], speedHistory: HistoryData[]): MatchedMeasurements  {
        const matchedMeasurements = new MatchedMeasurements();

        for (const direction of directionStats) {
            const speed = MatchUtils.findHistoryInPeriod(direction, speedHistory);
            if (speed) {
                if (MatchUtils.isInvalidSpeed(speed.s)) {
                    Log.warn("Speed " + speed.s + " at timestamp " + direction.start + " is not a number.");
                } else {
                    matchedMeasurements.add(direction.mean, +speed.s);
                }
            } else {
                Log.trace('No matching speed found for direction ' + direction.mean + " at timestamp " + direction.start);
            }
        }

        return matchedMeasurements;
    }

    matchHistoryStats(directionHistory: HistoryData[], speedStats: StatisticsData[]): MatchedMeasurements {
        const matchedMeasurements = new MatchedMeasurements();

        for (const direction of directionHistory) {
            const speed = MatchUtils.findStatsAtTime(direction.lu * 1000, speedStats);
            if (speed) {
                matchedMeasurements.add(direction.s, speed.mean);
            } else {
                Log.trace('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
            }
        }

        return matchedMeasurements;
    }

    matchHistoryHistory(directionHistory: HistoryData[], speedHistory: HistoryData[]): MatchedMeasurements  {
        const matchedMeasurements = new MatchedMeasurements();

        for (const direction of directionHistory) {
            const speed = MatchUtils.findHistoryBackAtTime(direction.lu, speedHistory);
            if (speed) {
                if (MatchUtils.isInvalidSpeed(speed.s)) {
                    Log.warn("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                } else {
                    matchedMeasurements.add(direction.s, +speed.s);
                }
            } else {
                Log.trace('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
            }
        }

        return matchedMeasurements;
    }

    matchStatsStats(directionStats: StatisticsData[], speedStats: StatisticsData[]): MatchedMeasurements  {
        const matchedMeasurements = new MatchedMeasurements();
        for (const directionStat of directionStats) {
            const matchedSpeed = MatchUtils.findMatchingStatistic(directionStat, speedStats);
            if (matchedSpeed) {
                matchedMeasurements.add(directionStat.mean, matchedSpeed.mean);
            } else {
                Log.trace(`No matching speed found for direction ${directionStat.mean} at timestamp start:${directionStat.start} end:${directionStat.end}`);
            }
        }

        return matchedMeasurements;
    }
}
