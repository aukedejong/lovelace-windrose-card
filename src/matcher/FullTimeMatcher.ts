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
        mergedList.forEach((tds) => matchedMeasurements.add(tds.direction!, tds.speed!, tds.time));
        return matchedMeasurements;
    }

    mergeMeasurements2(directionHistory: HistoryData[], speedHistory: HistoryData[]): TimeDirectionSpeed[] {
        const merged = [] as TimeDirectionSpeed[];
        let indexDirection = 0;
        let indexSpeed = 0;
        let prevTds: TimeDirectionSpeed | undefined;
        while (indexDirection < directionHistory.length || indexSpeed < speedHistory.length) {
            const direction = directionHistory[indexDirection];
            const speed = speedHistory[indexSpeed];
            let tds: TimeDirectionSpeed;
            if (direction.lu === speed.lu) {
                tds = new TimeDirectionSpeed(direction.lu);
                tds.direction = direction.s;
                tds.speed = +speed.s;
                if (indexDirection < directionHistory.length - 1) indexDirection++;
                if (indexSpeed < speedHistory.length - 1) indexSpeed++;
            } else if (direction.lu > speed.lu) { //Speed measurement is earlier.
                tds = new TimeDirectionSpeed(speed.lu);
                tds.direction = indexDirection === 0 ? undefined : directionHistory[indexDirection - 1].s;
                tds.speed = +speed.s;
                if (indexSpeed < speedHistory.length - 1) {
                    indexSpeed++;
                } else {
                    indexDirection++;
                }
            } else {
                tds = new TimeDirectionSpeed(direction.lu);
                tds.direction = direction.s;
                tds.speed = indexSpeed === 0 ? undefined : +speedHistory[indexSpeed - 1].s;
                if (indexDirection < directionHistory.length - 1) {
                    indexDirection++;
                } else {
                    indexSpeed++;
                }
            }
            merged.push(tds!)
            if (prevTds) {
                prevTds.seconds = tds.time - prevTds.time;
            }
            prevTds = tds;
        }
        return merged;
    }
}
