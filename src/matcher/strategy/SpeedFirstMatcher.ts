import {MatchStrategy} from "./MatchStrategy";
import {Measurement} from "../../measurement-provider/Measurement";
import {MatchedMeasurements} from "../MatchedMeasurements";
import {MatchUtils} from "../MatchUtils";
import {Log} from "../../util/Log";

export class SpeedFirstMatcher implements MatchStrategy {

    match(directionMeasurements: Measurement[], speedMeasurements: Measurement[]): MatchedMeasurements {
        const matchedMeasurements = new MatchedMeasurements();

        for (const speed of speedMeasurements) {
            const direction = MatchUtils.findMeasurementAtTime(speed.startTime, directionMeasurements);
            if (direction) {
                matchedMeasurements.add(direction.value, +speed.value);
            } else {
                Log.debug('No matching direction found for speed ' + speed.value + " at timestamp " + speed.startTime);
            }
        }

        return matchedMeasurements;
    }

}
