import {MatchStrategy} from "./MatchStrategy";
import {Measurement} from "../../measurement-provider/Measurement";
import {MatchedMeasurements} from "../MatchedMeasurements";
import {TimeDirectionSpeed} from "../TimeDirectionSpeed";
import {MatchedMeasurement} from "../MatchedMeasurement";

export class FullTimeMatcher implements MatchStrategy {

    match(directionMeasurements: Measurement[], speedMeasurements: Measurement[]): MatchedMeasurements {
        let tdsList = directionMeasurements.map(measurement => MatchedMeasurement.fromDirectionMeasurement(measurement));
        tdsList = tdsList.concat(speedMeasurements.map(measurement => MatchedMeasurement.fromSpeedMeasurement(measurement)));
        return this.mergeMeasurements(tdsList);
    }

    mergeMeasurements(tdsList: TimeDirectionSpeed[]): MatchedMeasurements {
        tdsList.sort((a, b) => a.time - b.time);
        const mergedList: TimeDirectionSpeed[] = [];
        let prevTds: TimeDirectionSpeed | undefined;
        for (const tds of tdsList) {
            if (prevTds) {
                if (tds.time == prevTds.time) {
                    if (tds.speed !== -1) {
                        prevTds.speed = tds.speed;
                    }
                    if (tds.direction !== -1) {
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
            if (tds.speed !== -1) {
                lastTdsValues.speed = tds.speed;
            } else {
                tds.speed = lastTdsValues.speed;
            }
            if (tds.direction !== -1) {
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
        if (mergedList[0].speed === undefined || mergedList[0].direction === undefined) {
            mergedList.shift();
        }
        const matchedMeasurements = new MatchedMeasurements();
        mergedList.forEach((tds) => matchedMeasurements.add(tds.direction!, tds.speed!, tds.seconds));
        return matchedMeasurements;
    }
}
