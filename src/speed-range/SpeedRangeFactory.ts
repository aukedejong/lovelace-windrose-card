import {SpeedRange} from "./SpeedRange";
import {ColorUtil} from "../util/ColorUtil";
import {SpeedUnit} from "../converter/SpeedUnit";
import {SpeedUnits} from "../converter/SpeedUnits";

export class SpeedRangeFactory {

    public static generateSpeedRanges(outputUnit: SpeedUnit,
                                      rangeBeaufort?: boolean,
                                      rangeStep?: number,
                                      rangeMax?: number,
                                      speedRanges?: SpeedRange[]) {

        if (rangeBeaufort === true) {
            return this.generateBeaufortSpeedRanges(outputUnit);

        } else if (speedRanges && speedRanges.length > 0) {
            return speedRanges;

        } else if (rangeStep && rangeMax) {
            return this.generate(rangeStep, rangeMax);

        } else {
            return this.generate(outputUnit.speedRangeStep!, outputUnit.speedRangeMax!);
        }
    }

    private static generate(step: number, max: number): SpeedRange[] {
        const colors = ColorUtil.getColorArray(Math.floor(max / step) + 1);
        const speedRanges = [] as SpeedRange[];
        let currentSpeed = 0;
        let range = 0;
        while (currentSpeed <= max - step) {
            speedRanges.push(new SpeedRange(range, currentSpeed, currentSpeed + step, colors[range]));
            range++;
            currentSpeed += step;
        }
        speedRanges.push(new SpeedRange(range, currentSpeed, -1, colors[range]));
        return speedRanges;
    }


    private static generateBeaufortSpeedRanges(beaufortType: SpeedUnit | undefined): SpeedRange[] {
        const colors = ColorUtil.getColorArray(13);
        if (beaufortType === undefined || beaufortType === SpeedUnits.mps) {
            return [
                new SpeedRange(0, 0, 0.5, colors[0]),
                new SpeedRange(1, 0.5, 1.6, colors[1]),
                new SpeedRange(2, 1.6, 3.4, colors[2]),
                new SpeedRange(3, 3.4, 5.5, colors[3]),
                new SpeedRange(4, 5.5, 8, colors[4]),
                new SpeedRange(5, 8, 10.8, colors[5]),
                new SpeedRange(6, 10.8, 13.9, colors[6]),
                new SpeedRange(7, 13.9, 17.2, colors[7]),
                new SpeedRange(8, 17.2, 20.8, colors[8]),
                new SpeedRange(9, 20.8, 24.5, colors[9]),
                new SpeedRange(10, 24.5, 28.5, colors[10]),
                new SpeedRange(11, 28.5, 32.7, colors[11]),
                new SpeedRange(12, 32.7, -1, colors[12])
            ];
        } else if (beaufortType === SpeedUnits.kph) {
            return [
                new SpeedRange(0, 0, 2, colors[0]),
                new SpeedRange(1, 2, 6, colors[1]),
                new SpeedRange(2, 6, 12, colors[2]),
                new SpeedRange(3, 12, 20, colors[3]),
                new SpeedRange(4, 20, 29, colors[4]),
                new SpeedRange(5, 29, 39, colors[5]),
                new SpeedRange(6, 39, 50, colors[6]),
                new SpeedRange(7, 50, 62, colors[7]),
                new SpeedRange(8, 62, 75, colors[8]),
                new SpeedRange(9, 75, 89, colors[9]),
                new SpeedRange(10, 89, 103, colors[10]),
                new SpeedRange(11, 103, 118, colors[11]),
                new SpeedRange(12, 118, -1, colors[12])
            ];
        } else if (beaufortType === SpeedUnits.mph) {
            return [
                new SpeedRange(0, 0, 1, colors[0]),
                new SpeedRange(1, 1, 4, colors[1]),
                new SpeedRange(2, 4, 8, colors[2]),
                new SpeedRange(3, 8, 13, colors[3]),
                new SpeedRange(4, 13, 19, colors[4]),
                new SpeedRange(5, 19, 25, colors[5]),
                new SpeedRange(6, 25, 32, colors[6]),
                new SpeedRange(7, 32, 39, colors[7]),
                new SpeedRange(8, 39, 47, colors[8]),
                new SpeedRange(9, 47, 55, colors[9]),
                new SpeedRange(10, 55, 64, colors[10]),
                new SpeedRange(11, 64, 73, colors[11]),
                new SpeedRange(12, 73, -1, colors[12])
            ];
        } else if (beaufortType === SpeedUnits.fps) {
            return [
                new SpeedRange(0, 0, 1.6, colors[0]),
                new SpeedRange(1, 1.6, 5.2, colors[1]),
                new SpeedRange(2, 5.2, 11.2, colors[2]),
                new SpeedRange(3, 11.2, 18, colors[3]),
                new SpeedRange(4, 18, 26.2, colors[4]),
                new SpeedRange(5, 26.2, 35.4, colors[5]),
                new SpeedRange(6, 35.4, 45.6, colors[6]),
                new SpeedRange(7, 45.6, 56.4, colors[7]),
                new SpeedRange(8, 56.4, 68.2, colors[8]),
                new SpeedRange(9, 68.2, 80.4, colors[9]),
                new SpeedRange(10, 80.4, 93.5, colors[10]),
                new SpeedRange(11, 93.5, 107, colors[11]),
                new SpeedRange(12, 107, -1, colors[12])
            ];
        } else if (beaufortType === SpeedUnits.knots) {
            return [
                new SpeedRange(0, 0, 1, colors[0]),
                new SpeedRange(1, 1, 4, colors[1]),
                new SpeedRange(2, 4, 7, colors[2]),
                new SpeedRange(3, 7, 11, colors[3]),
                new SpeedRange(4, 11, 17, colors[4]),
                new SpeedRange(5, 17, 22, colors[5]),
                new SpeedRange(6, 22, 28, colors[6]),
                new SpeedRange(7, 28, 34, colors[7]),
                new SpeedRange(8, 34, 41, colors[8]),
                new SpeedRange(9, 41, 48, colors[9]),
                new SpeedRange(10, 48, 56, colors[10]),
                new SpeedRange(11, 56, 64, colors[11]),
                new SpeedRange(12, 64, -1, colors[12])
            ];
        }
        throw new Error("No Bft reanges for type: " + beaufortType.name);
    }
}
