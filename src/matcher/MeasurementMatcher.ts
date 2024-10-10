import {DirectionSpeed} from "./DirectionSpeed";

export interface MeasurementMatcher {

    matchStatsHistory(directionStats: StatisticsData[], speedHistory: HistoryData[]): DirectionSpeed[];

    matchHistoryStats(directionHistory: HistoryData[], speedStats: StatisticsData[]): DirectionSpeed[];

    matchHistoryHistory(directionHistory: HistoryData[], speedHistory: HistoryData[]): DirectionSpeed[];

    matchStatsStats(directionStats: StatisticsData[], speedStats: StatisticsData[]): DirectionSpeed[];

}
