import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {MeasurementHolder} from "../measurement-provider/MeasurementHolder";
import {MatchedMeasurements} from "./MatchedMeasurements";
import {MatchStrategy} from "./strategy/MatchStrategy";
import {SpeedFirstMatcher} from "./strategy/SpeedFirstMatcher";
import {DirectionFirstMatcher} from "./strategy/DirectionFirstMatcher";
import {TimeFrameMatcher} from "./strategy/TimeFrameMatcher";
import {FullTimeMatcher} from "./strategy/FullTimeMatcher";
import {Log} from "../util/Log";

export class MeasurementMatcher {

    private matcher: MatchStrategy;

    constructor(private readonly cardConfig: CardConfigWrapper) {

        if (this.cardConfig.matchingStrategy === 'speed-first') {
            this.matcher = new SpeedFirstMatcher();
        } else if (this.cardConfig.matchingStrategy === 'direction-first') {
            this.matcher = new DirectionFirstMatcher();
        } else if (this.cardConfig.matchingStrategy === 'time-frame') {
            this.matcher = new TimeFrameMatcher(this.cardConfig.dataPeriod.timeInterval);
        } else if (this.cardConfig.matchingStrategy === 'full-time') {
            this.matcher = new FullTimeMatcher();
        } else {
            throw new Error(`Measurement matcher not found: ${this.cardConfig.matchingStrategy}`);
        }
    }

    match(measurementHolder: MeasurementHolder): MatchedMeasurements[] {
        const matchedMeasurementsList: MatchedMeasurements[] = [];

        for (let i = 0; i < this.cardConfig.windspeedEntities.length; i++) {

            const speedMeasurements = measurementHolder.speedMeasurements[i];
            const directionMeasurements = measurementHolder.directionMeasurements;

            Log.debug("Direction measurements: ", directionMeasurements);
            Log.debug("Speed measurements: ", speedMeasurements);
            Log.info(`Loaded measurements: directions: ${directionMeasurements.length}, speeds: ${speedMeasurements.length}, entity: ${(this.cardConfig.windspeedEntities[i].entity)}`);

            const matchMeasurements = this.matcher.match(directionMeasurements, speedMeasurements);
            matchedMeasurementsList.push(matchMeasurements);
            Log.info(`Matched measurements ${matchMeasurements.getMeasurementCount()}, with strategy ${this.cardConfig.matchingStrategy}`);
            Log.debug("Matched measurements: ", matchMeasurements);
        }

        return matchedMeasurementsList;
    }
}
