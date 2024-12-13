import {MatchedMeasurements} from "./MatchedMeasurements";

export interface MeasurementMatcher {

    matchStatsHistory(directionStats: StatisticsData[], speedHistory: HistoryData[]): MatchedMeasurements;

    matchHistoryStats(directionHistory: HistoryData[], speedStats: StatisticsData[]): MatchedMeasurements;

    matchHistoryHistory(directionHistory: HistoryData[], speedHistory: HistoryData[]): MatchedMeasurements;

    matchStatsStats(directionStats: StatisticsData[], speedStats: StatisticsData[]): MatchedMeasurements;

}
