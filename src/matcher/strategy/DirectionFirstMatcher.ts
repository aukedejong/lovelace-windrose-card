import {MatchStrategy} from "./MatchStrategy";
import {Measurement} from "../../measurement-provider/Measurement";
import {MatchedMeasurements} from "../MatchedMeasurements";
import {MatchUtils} from "../MatchUtils";
import {Log} from "../../util/Log";

export class DirectionFirstMatcher implements MatchStrategy {

    match(directionMeasurements: Measurement[], speedMeasurements: Measurement[]): MatchedMeasurements {
        const matchedMeasurements = new MatchedMeasurements();

        for (const direction of directionMeasurements) {
            const speed = MatchUtils.findMeasurementAtTime(direction.startTime, speedMeasurements);
            if (speed) {
                matchedMeasurements.add(direction.value, +speed.value);
            } else {
                Log.debug('No matching speed found for direction ' + direction.value + " at timestamp " + direction.startTime);
            }
        }
        return matchedMeasurements;
    }

}
