import {Measurement} from "./Measurement";

export class MeasurementHolder {

    public directionMeasurements: Measurement[];
    public speedMeasurements: Measurement[][];

    constructor() {
        this.directionMeasurements = [];
        this.speedMeasurements = [];
    }

    public addSpeedMeasurements(measurements: Measurement[]): void {
        this.speedMeasurements.push(measurements);
    }

}
