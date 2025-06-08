import {MatchStrategy} from "./MatchStrategy";
import {Measurement} from "../../measurement-provider/Measurement";
import {MatchedMeasurements} from "../MatchedMeasurements";
import {MatchUtils} from "../MatchUtils";
import {Log} from "../../util/Log";

export class TimeFrameMatcher implements MatchStrategy {

    constructor(private readonly periodSeconds: number) {
    }

    match(directionMeasurements: Measurement[], speedMeasurements: Measurement[]): MatchedMeasurements {
        const maxBackTimestamp = directionMeasurements[0].startTime > speedMeasurements[0].startTime ? directionMeasurements[0].startTime : speedMeasurements[0].startTime;
        let end = Date.now() / 1000;
        const matchedMeasurements = new MatchedMeasurements();
        while (end > maxBackTimestamp) {

            let direction = MatchUtils.findMeasurementAtTime(end, directionMeasurements);
            let speed = MatchUtils.findMeasurementAtTime(end, speedMeasurements);

            if (!direction) {
                Log.warn("No direction found for timestamp " + MatchUtils.cleanDate(end));
            }
            if (!speed) {
                Log.warn("No speed found for timestamp " + MatchUtils.cleanDate(end));
            }
            if (direction && speed) {
                matchedMeasurements.add(direction.value, +speed.value, speed.startTime);
            }

            end -= this.periodSeconds;
        }
        return matchedMeasurements;
    }
}
