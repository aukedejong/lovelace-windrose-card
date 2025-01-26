import {Measurement} from "../measurement-provider/Measurement";

export class MatchedMeasurement {

    constructor(
        public time: number,
        public direction: number | string,
        public speed: number,
        public seconds: number = 1) {
    }

    static fromDirectionMeasurement(measurement: Measurement): MatchedMeasurement {
        return new MatchedMeasurement(measurement.startTime, measurement.value, -1);
    }

    static fromSpeedMeasurement(measurement: Measurement): MatchedMeasurement {
        return new MatchedMeasurement(measurement.startTime, -1, +measurement.value);
    }

}
