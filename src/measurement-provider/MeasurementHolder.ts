import { Measurement } from "./Measurement";
import { DateTimeFormatter } from "../formatter/DateTimeFormatter";

export class MeasurementHolder {

    public directionMeasurements: Measurement[];
    public speedMeasurements: Measurement[][];
    public error: any | undefined;

    constructor(private readonly dateTimeFormatter: DateTimeFormatter) {
        this.directionMeasurements = [];
        this.speedMeasurements = [];

    }

    public setErrorState(error: any | undefined, windspeedEntityCount: number) {
        this.error = error;
        for (let i = 0; i < windspeedEntityCount; i++) {
            this.speedMeasurements.push([]);
        }
    }

    public addSpeedMeasurements(measurements: Measurement[]): void {
        this.speedMeasurements.push(measurements);
    }

    public getInfoText(): string {
        const directionCount = this.directionMeasurements.length;
        let info = `Directions: ${directionCount}`;
         if (directionCount > 0) {
             const first = this.directionMeasurements[0].startTime;
             const last = this.directionMeasurements[this.directionMeasurements.length - 1].startTime;
             info += ` - ${this.dateTimeFormatter.formatTimestampDateTime(first)} - ${this.dateTimeFormatter.formatTimestampDateTime(last)}\n`;
         } else {
             info += "\n";
         }
        for (const speed of this.speedMeasurements) {
            info += this.getSpeedInfo(speed);
        }
        return info;
    }

    private getSpeedInfo(speedMeasurements: Measurement[]): string {
        const speedCount = speedMeasurements.length;
        if (speedCount === 0) {
            return 'Speeds:     0\n';
        }
        const first = speedMeasurements[0].startTime;
        const last = speedMeasurements[speedCount - 1].startTime;
        return `Speed:      ${speedCount} - ${this.dateTimeFormatter.formatTimestampDateTime(first)} - ${this.dateTimeFormatter.formatTimestampDateTime(last)}\n`;
    }

}
