import {Measurement} from "../measurement-provider/Measurement";

export class MatchUtils {

    public static findMeasurementAtTime(time: number, measurements: Measurement[]): Measurement | undefined {
        return measurements.find((m) => m.startTime <= time && time <= m.endTime);
    }

    public static cleanDate(date: number) {
        return new Date(date * 1000).toLocaleString();
    }
}
