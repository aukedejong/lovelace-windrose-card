import {MeasurementMatcher} from "./MeasurementMatcher";
import {TimeDirectionSpeed} from "./TimeDirectionSpeed";
import {MatchedMeasurements} from "./MatchedMeasurements";

export class FullTimeMatcher implements MeasurementMatcher {

    matchStatsHistory(directionStats: StatisticsData[], speedHistory: HistoryData[]): MatchedMeasurements {
        let tdsList = directionStats.map(data => TimeDirectionSpeed.directionFromStatsData(data));
        tdsList = tdsList.concat(speedHistory.map(data => TimeDirectionSpeed.speedFromHistoryData(data)));
        return this.mergeMeasurements(tdsList);
    }

    matchHistoryStats(directionHistory: HistoryData[], speedStats: StatisticsData[]): MatchedMeasurements {
        let tdsList = directionHistory.map(data => TimeDirectionSpeed.directionFromHistoryData(data));
        tdsList = tdsList.concat(speedStats.map(data => TimeDirectionSpeed.speedFromStatsData(data)));
        return this.mergeMeasurements(tdsList);
    }

    matchHistoryHistory(directionHistory: HistoryData[], speedHistory: HistoryData[]): MatchedMeasurements {
        let tdsList = directionHistory.map(data => TimeDirectionSpeed.directionFromHistoryData(data));
        tdsList = tdsList.concat(speedHistory.map(data => TimeDirectionSpeed.speedFromHistoryData(data)));
        return this.mergeMeasurements(tdsList);
    }

    matchStatsStats(directionStats: StatisticsData[], speedStats: StatisticsData[]): MatchedMeasurements {
        let tdsList = directionStats.map(data => TimeDirectionSpeed.directionFromStatsData(data));
        tdsList = tdsList.concat(speedStats.map(data => TimeDirectionSpeed.speedFromStatsData(data)));
        return this.mergeMeasurements(tdsList);
    }

    mergeMeasurements(tdsList: TimeDirectionSpeed[]): MatchedMeasurements {
        tdsList.sort((a, b) => a.time - b.time);

        const mergedList: TimeDirectionSpeed[] = [];
        let prevTds: TimeDirectionSpeed | undefined;
        for (const tds of tdsList) {
            if (prevTds) {
                if (tds.time == prevTds.time) {
                    if (tds.speed) {
                        prevTds.speed = tds.speed;
                    }
                    if (tds.direction) {
                        prevTds.direction = tds.direction;
                    }
                } else {
                    mergedList.push(tds);
                }
            } else {
                mergedList.push(tds);
            }
            prevTds = tds;
        }

        prevTds = undefined;
        const lastTdsValues = new TimeDirectionSpeed(-1);
        for (const tds of mergedList) {
            if (tds.speed) {
                lastTdsValues.speed = tds.speed;
            } else {
                tds.speed = lastTdsValues.speed;
            }
            if (tds.direction) {
                lastTdsValues.direction = tds.direction;
            } else {
                tds.direction = lastTdsValues.direction;
            }
            if (prevTds) {
                prevTds.seconds = tds.time - prevTds.time;
            }
            prevTds = tds;
        }
        if (prevTds) {
            prevTds.seconds = (Date.now() / 1000) - prevTds.time;
        }
        const matchedMeasurements = new MatchedMeasurements();
        mergedList.forEach((tds) => matchedMeasurements.add(tds.direction!, tds.speed!, tds.seconds));
        return matchedMeasurements;
    }

}
