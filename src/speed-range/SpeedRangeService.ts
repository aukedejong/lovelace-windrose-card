import {SpeedRange} from "./SpeedRange";
import {SpeedRangeFactory} from "./SpeedRangeFactory";
import {WindSpeedEntity} from "../config/WindSpeedEntity";
import {SpeedUnit} from "../converter/SpeedUnit";
import {DynamicSpeedRange} from "../config/DynamicSpeedRange";
import {Log} from "../util/Log";

export class SpeedRangeService {

    private readonly outputSpeedUnit: SpeedUnit
    private readonly windSpeedEntity: WindSpeedEntity;
    private readonly dynamicSpeedRangeConfig: DynamicSpeedRange[];
    private speedRanges: SpeedRange[];

    constructor(outputSpeedUnit: SpeedUnit, windSpeedEntity: WindSpeedEntity) {
        this.outputSpeedUnit = outputSpeedUnit;
        this.windSpeedEntity = windSpeedEntity;
        this.dynamicSpeedRangeConfig = windSpeedEntity.dynamicSpeedRanges;
        this.speedRanges = [];
    }

    generateRanges(averageSpeed: number): void {
        let lastOne: DynamicSpeedRange | undefined;
        Log.debug("Generate speed ranges: ", this.dynamicSpeedRangeConfig);
        if (this.dynamicSpeedRangeConfig.length > 0) {
            for (const config of this.dynamicSpeedRangeConfig) {
                if (averageSpeed < config.average_below) {
                    this.speedRanges = SpeedRangeFactory.generateStepMax(config.step, config.max);
                    break;
                }
                lastOne = config;
            }
            if (this.speedRanges.length === 0 && lastOne) {
                this.speedRanges = SpeedRangeFactory.generateStepMax(lastOne.step, lastOne.max);
            }
            Log.debug("Dynamic speed ranges determined: ", this.speedRanges);
        } else {
            if (this.speedRanges.length === 0) {
                this.speedRanges = SpeedRangeFactory.generateSpeedRanges(this.outputSpeedUnit, this.windSpeedEntity);
                Log.debug("Speed ranges determined: ", this.speedRanges);
            }
        }
    }

    getRangeCount(): number {
        return this.speedRanges.length;
    }

    getSpeedRanges(): SpeedRange[] {
        return this.speedRanges;
    }

    determineSpeedRangeIndex(speed: number): number {
        const speedRange = this.speedRanges.find((speedRange: SpeedRange) => speedRange.isRangeMatch(speed));
        if (speedRange) {
            return speedRange.range;
        }
        throw new Error("Speed is not in a speedrange: " + speed + " unit: " + this.outputSpeedUnit.name);
    }

}
