import {MeasurementMatcher} from "./MeasurementMatcher";
import {DirectionSpeed} from "./DirectionSpeed";
import {TimeDirectionSpeed} from "./TimeDirectionSpeed";

export class FullTimeMatcher implements MeasurementMatcher {

    matchStatsHistory(directionStats: StatisticsData[], speedHistory: HistoryData[]): DirectionSpeed[] {
        let tdsList = directionStats.map(data => TimeDirectionSpeed.directionFromStatsData(data));
        tdsList = tdsList.concat(speedHistory.map(data => TimeDirectionSpeed.speedFromHistoryData(data)));
        return this.mergeMeasurements(tdsList);
    }

    matchHistoryStats(directionHistory: HistoryData[], speedStats: StatisticsData[]): DirectionSpeed[] {
        let tdsList = directionHistory.map(data => TimeDirectionSpeed.directionFromHistoryData(data));
        tdsList = tdsList.concat(speedStats.map(data => TimeDirectionSpeed.speedFromStatsData(data)));
        return this.mergeMeasurements(tdsList);
    }

    matchHistoryHistory(directionHistory: HistoryData[], speedHistory: HistoryData[]): DirectionSpeed[] {
        let tdsList = directionHistory.map(data => TimeDirectionSpeed.directionFromHistoryData(data));
        tdsList = tdsList.concat(speedHistory.map(data => TimeDirectionSpeed.speedFromHistoryData(data)));
        return this.mergeMeasurements(tdsList);
    }

    matchStatsStats(directionStats: StatisticsData[], speedStats: StatisticsData[]): DirectionSpeed[] {
        let tdsList = directionStats.map(data => TimeDirectionSpeed.directionFromStatsData(data));
        tdsList = tdsList.concat(speedStats.map(data => TimeDirectionSpeed.speedFromStatsData(data)));
        return this.mergeMeasurements(tdsList);
    }

    mergeMeasurements(tdsList: TimeDirectionSpeed[]) {
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

        console.log('Merged list: ', mergedList);
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
        console.log('Mergedd list, fase 2: ', mergedList);
        return mergedList.map(tds => tds.toDirectionSpeed());

    }

    mergeMeasurements2(directionHistory: HistoryData[], speedHistory: HistoryData[]): TimeDirectionSpeed[] {
        const merged = [] as TimeDirectionSpeed[];
        let indexDirection = 0;
        let indexSpeed = 0;
        let prevTds: TimeDirectionSpeed | undefined;
        console.log('While: ' + indexDirection + ' < ' + (directionHistory.length) + '  ||  ' + indexSpeed + ' < ' + (speedHistory.length));
        while (indexDirection < directionHistory.length || indexSpeed < speedHistory.length) {
            console.log('Begin loop');
            const direction = directionHistory[indexDirection];
            const speed = speedHistory[indexSpeed];
            let tds: TimeDirectionSpeed;
            if (direction.lu === speed.lu) {
                console.log('  Equal: ' + direction.lu)
                tds = new TimeDirectionSpeed(direction.lu);
                tds.direction = direction.s;
                tds.speed = +speed.s;
                if (indexDirection < directionHistory.length - 1) indexDirection++;
                if (indexSpeed < speedHistory.length - 1) indexSpeed++;
            } else if (direction.lu > speed.lu) { //Speed measurement is earlier.
                console.log('  Direction > Speed: ' + direction.lu + ' > ' + speed.lu);
                tds = new TimeDirectionSpeed(speed.lu);
                tds.direction = indexDirection === 0 ? undefined : directionHistory[indexDirection - 1].s;
                tds.speed = +speed.s;
                if (indexSpeed < speedHistory.length - 1) {
                    indexSpeed++;
                } else {
                    indexDirection++;
                }
            } else {
                console.log('  Direction < Speed: ' + direction.lu + ' < ' + speed.lu);
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
            console.log('  While: ' + indexDirection + ' < ' + (directionHistory.length) + '  ||  ' + indexSpeed + ' < ' + (speedHistory.length));

        }
        return merged;
    }
}
