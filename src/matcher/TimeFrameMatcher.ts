import {MeasurementMatcher} from "./MeasurementMatcher";
import {DirectionSpeed} from "./DirectionSpeed";
import {MatchUtils} from "./MatchUtils";
import {Log} from "../util/Log";

export class TimeFrameMatcher implements MeasurementMatcher {

    constructor(private readonly periodSeconds: number) {
    }

    matchStatsHistory(directionStats: StatisticsData[], speedHistory: HistoryData[]): DirectionSpeed[] {
        const maxBackTimestamp = directionStats[0].start > speedHistory[0].lu ? directionStats[0].start : speedHistory[0].lu
        let end = Date.now() / 1000;
        const directionSpeed: DirectionSpeed[] = [];
        while (end > maxBackTimestamp) {

            let direction = MatchUtils.findStatsAtTime(end * 1000, directionStats);
            let speed = MatchUtils.findHistoryBackAtTime(end, speedHistory);

            if (this.checkMeasurementStats(direction, end, "Direction") && this.checkMeasurement(speed, end, "Speed")) {
                directionSpeed.push(new DirectionSpeed(direction!.mean, +speed!.s));
            }
            end -= this.periodSeconds;
        }
        return directionSpeed;
    }

    matchHistoryStats(directionHistory: HistoryData[], speedStats: StatisticsData[]): DirectionSpeed[] {
        const maxBackTimestamp = directionHistory[0].lu > speedStats[0].start / 1000 ? directionHistory[0].lu : speedStats[0].start / 1000
        let end = Date.now() / 1000;
        const directionSpeed: DirectionSpeed[] = [];
        while (end > maxBackTimestamp) {

            let direction = MatchUtils.findHistoryBackAtTime(end, directionHistory);
            let speed = MatchUtils.findStatsAtTime(end * 1000, speedStats);

            if (this.checkMeasurement(direction, end, "Direction") && this.checkMeasurementStats(speed, end, "Speed")) {
                directionSpeed.push(new DirectionSpeed(direction!.s, +speed!.mean));
            }
            end -= this.periodSeconds;
        }
        return directionSpeed;
    }

    matchHistoryHistory(directionHistory: HistoryData[], speedHistory: HistoryData[]): DirectionSpeed[] {
        const maxBackTimestamp = directionHistory[0].lu > speedHistory[0].lu ? directionHistory[0].lu : speedHistory[0].lu
        let end = Date.now() / 1000;
        const directionSpeed: DirectionSpeed[] = [];
        while (end > maxBackTimestamp) {

            let direction = MatchUtils.findHistoryBackAtTime(end, directionHistory);
            let speed = MatchUtils.findHistoryBackAtTime(end, speedHistory);

            if (this.checkMeasurement(direction, end, "Direction") && this.checkMeasurement(speed, end, "Speed")) {
                directionSpeed.push(new DirectionSpeed(direction!.s, +speed!.s));
            }
            end -= this.periodSeconds;
        }
        return directionSpeed;
    }

    matchStatsStats(directionStats: StatisticsData[], speedStats: StatisticsData[]): DirectionSpeed[] {
        const maxBackTimestamp = directionStats[0].start > speedStats[0].start ? speedStats[0].start / 1000: speedStats[0].start / 1000;
        let end = Date.now() / 1000;
        const directionSpeed: DirectionSpeed[] = [];
        while (end > maxBackTimestamp) {

            let direction = MatchUtils.findStatsAtTime(end * 1000, directionStats);
            let speed = MatchUtils.findStatsAtTime(end * 1000, speedStats);

            if (this.checkMeasurementStats(direction, end, "Direction") && this.checkMeasurementStats(speed, end, "Speed")) {
                directionSpeed.push(new DirectionSpeed(direction!.mean, +speed!.mean));
            }
            end -= this.periodSeconds;
        }
        return directionSpeed;
    }

    private checkMeasurement(measurement: HistoryData | undefined, timestamp: number, logText: string): boolean {
        if (measurement) {
            if (MatchUtils.isNumber(measurement.s)) {
                return true;
            }
            Log.warn(logText + " " + measurement.s + " at timestamp " + MatchUtils.cleanDate(measurement.lu) + " is not a number.");
        } else {
            Log.warn("No " + logText + " found for timestamp " + MatchUtils.cleanDate(timestamp));
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
