import {MatchedMeasurements} from "../MatchedMeasurements";
import {Measurement} from "../../measurement-provider/Measurement";

export interface MatchStrategy {

    match(directionMeasurements: Measurement[], speedMeasurements: Measurement[]): MatchedMeasurements;
}
