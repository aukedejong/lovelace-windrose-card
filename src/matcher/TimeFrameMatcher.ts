import {MeasurementMatcher} from "./MeasurementMatcher";
import {MatchUtils} from "./MatchUtils";
import {Log} from "../util/Log";
import {MatchedMeasurements} from "./MatchedMeasurements";

export class TimeFrameMatcher implements MeasurementMatcher {

    constructor(private readonly periodSeconds: number) {
    }

    matchStatsHistory(directionStats: StatisticsData[], speedHistory: HistoryData[]): MatchedMeasurements {
        const maxBackTimestamp = directionStats[0].start / 1000 > speedHistory[0].lu ? directionStats[0].start / 1000 : speedHistory[0].lu
        let end = Date.now() / 1000;
        const matchedMeasurements = new MatchedMeasurements();
        while (end > maxBackTimestamp) {

            let direction = MatchUtils.findStatsAtTime(end * 1000, directionStats);
            let speed = MatchUtils.findHistoryBackAtTime(end, speedHistory);

            if (this.checkMeasurementStats(direction, end, 'Direction') && this.checkSpeedMeasurement(speed, end)) {
                matchedMeasurements.add(direction!.mean, +speed!.s);
            }
            end -= this.periodSeconds;
        }
        return matchedMeasurements;
    }

    matchHistoryStats(directionHistory: HistoryData[], speedStats: StatisticsData[]): MatchedMeasurements {
        const maxBackTimestamp = directionHistory[0].lu > speedStats[0].start / 1000 ? directionHistory[0].lu : speedStats[0].start / 1000
        let end = Date.now() / 1000;
        const matchedMeasurements = new MatchedMeasurements();
        while (end > maxBackTimestamp) {

            let direction = MatchUtils.findHistoryBackAtTime(end, directionHistory);
            let speed = MatchUtils.findStatsAtTime(end * 1000, speedStats);

            if (this.checkDirectionMeasurement(direction, end) && this.checkMeasurementStats(speed, end, "Speed")) {
                matchedMeasurements.add(direction!.s, +speed!.mean);
            }
            end -= this.periodSeconds;
        }
        return matchedMeasurements;
    }

    matchHistoryHistory(directionHistory: HistoryData[], speedHistory: HistoryData[]): MatchedMeasurements {
        const maxBackTimestamp = directionHistory[0].lu > speedHistory[0].lu ? directionHistory[0].lu : speedHistory[0].lu
        let end = Date.now() / 1000;
        const matchedMeasurements = new MatchedMeasurements();
        while (end > maxBackTimestamp) {

            let direction = MatchUtils.findHistoryBackAtTime(end, directionHistory);
            let speed = MatchUtils.findHistoryBackAtTime(end, speedHistory);

            if (this.checkDirectionMeasurement(direction, end) && this.checkSpeedMeasurement(speed, end)) {
                matchedMeasurements.add(direction!.s, +speed!.s);
            }
            end -= this.periodSeconds;
        }
        return matchedMeasurements;
    }

    matchStatsStats(directionStats: StatisticsData[], speedStats: StatisticsData[]): MatchedMeasurements {
        const maxBackTimestamp = directionStats[0].start > speedStats[0].start ? speedStats[0].start / 1000: speedStats[0].start / 1000;
        let end = Date.now() / 1000;
        const matchedMeasurements = new MatchedMeasurements();
        while (end > maxBackTimestamp) {

            let direction = MatchUtils.findStatsAtTime(end * 1000, directionStats);
            let speed = MatchUtils.findStatsAtTime(end * 1000, speedStats);

            if (this.checkMeasurementStats(direction, end, "Direction") && this.checkMeasurementStats(speed, end, "Speed")) {
                matchedMeasurements.add(direction!.mean, +speed!.mean);
            }
            end -= this.periodSeconds;
        }
        return matchedMeasurements;
    }

    private checkDirectionMeasurement(measurement: HistoryData | undefined, timestamp: number): boolean {
        if (measurement) {
            if (measurement.s === undefined || measurement.s === null) {
                return false;
            }
            //Log.warn("Direction " + measurement.s + " at timestamp " + MatchUtils.cleanDate(measurement.lu) + " is not a number.");
        } else {
            Log.warn("No direction found for timestamp " + MatchUtils.cleanDate(timestamp));
        }
        return true;
    }

    private checkSpeedMeasurement(measurement: HistoryData | undefined, timestamp: number): boolean {
        if (measurement) {
            if (MatchUtils.isNumber(measurement.s)) {
                return true;
            }
            Log.warn("Speed " + measurement.s + " at timestamp " + MatchUtils.cleanDate(measurement.lu) + " is not a number.");
        } else {
            Log.warn("No speed found for timestamp " + MatchUtils.cleanDate(timestamp));
        }
        return false;
    }

    private checkMeasurementStats(measurement: StatisticsData | undefined, timestamp: number, logText: string): boolean {
        if (measurement) {
            if (MatchUtils.isNumber(measurement.mean)) {
                return true;
            }
            Log.warn(logText + " " + measurement.mean + " at timestamp " + MatchUtils.cleanDate(measurement.start / 1000) + " is not a number.");
        } else {
            Log.warn("No " + logText + " found for timestamp " + MatchUtils.cleanDate(timestamp));
        }
        return false;
    }
}
