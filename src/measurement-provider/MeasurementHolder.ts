import {Measurement} from "./Measurement";
import {MatchUtils} from "../matcher/MatchUtils";

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

    public getInfoText(): string {
        const directionCount = this.directionMeasurements.length;
        const first = this.directionMeasurements[0].startTime;
        const last = this.directionMeasurements[this.directionMeasurements.length - 1].startTime;
        let info = `Directions: ${directionCount} - ${MatchUtils.cleanDateTime(first)} - ${MatchUtils.cleanDateTime(last)}\n`;
        for (const speed of this.speedMeasurements) {
            info += this.getSpeedInfo(speed);
        }
        return info;
    }

    private getSpeedInfo(speedMeasurements: Measurement[]): string {
        const speedCount = speedMeasurements.length;
        if (speedCount === 0) {
            return 'Speeds: 0';
        }
        const first = speedMeasurements[0].startTime;
        const last = speedMeasurements[speedMeasurements.length - 1].startTime;
        return `Speed:      ${speedCount} - ${MatchUtils.cleanDateTime(first)} - ${MatchUtils.cleanDateTime(last)}\n`;
    }

}
