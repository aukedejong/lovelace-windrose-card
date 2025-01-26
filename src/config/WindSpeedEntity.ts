import {SpeedRange} from "../speed-range/SpeedRange";
import {CardConfigWindSpeedEntity} from "../card/CardConfigWindSpeedEntity";
import {GlobalConfig} from "./GlobalConfig";
import {CardConfigSpeedRange} from "../card/CardConfigSpeedRange";
import {ConfigCheckUtils} from "./ConfigCheckUtils";
import {DynamicSpeedRange} from "./DynamicSpeedRange";

export class WindSpeedEntity {

    constructor(
        public readonly entity: string,
        public readonly attribute: string | undefined,
        public readonly name: string,
        public readonly useStatistics: boolean,
        public readonly renderRelativeScale: boolean,
        public readonly windspeedBarFull: boolean,
        public speedUnit: string,
        public readonly outputSpeedUnit: string,
        public readonly outputSpeedUnitLabel: string | undefined,
        public readonly speedRangeBeaufort: boolean,
        public readonly speedRangeStep: number | undefined,
        public readonly speedRangeMax: number | undefined,
        public readonly speedRanges: SpeedRange[] = [],
        public readonly dynamicSpeedRanges: DynamicSpeedRange[] = []
    ) {}

    static fromConfig(entityConfig: CardConfigWindSpeedEntity,
                      parentEntityConfig: CardConfigWindSpeedEntity): WindSpeedEntity {

        const entity = entityConfig.entity;
        const name = entityConfig.name;
        const useStatistics = ConfigCheckUtils.checkBooleanDefaultFalse(entityConfig.use_statistics);
        const inputSpeedUnit = this.checkInputSpeedUnit(entityConfig.speed_unit);
        const renderRelativeScale = ConfigCheckUtils.checkBooleanDefaultTrue(entityConfig.render_relative_scale);
        let windspeedBarFull;
        if (entityConfig.windspeed_bar_full === undefined) {
            windspeedBarFull = ConfigCheckUtils.checkBooleanDefaultTrue(parentEntityConfig.windspeed_bar_full);
        } else {
            windspeedBarFull = ConfigCheckUtils.checkBooleanDefaultTrue(entityConfig.windspeed_bar_full);
        }
        let outputSpeedUnit;
        if (entityConfig.output_speed_unit) {
            outputSpeedUnit = this.checkOutputSpeedUnit(entityConfig.output_speed_unit);
        } else {
            outputSpeedUnit = this.checkOutputSpeedUnit(parentEntityConfig.output_speed_unit);
        }
        let outputSpeedUnitLabel;
        if (entityConfig.output_speed_unit_label) {
            outputSpeedUnitLabel = this.checkOutputSpeedUnitLabel(entityConfig.output_speed_unit_label);
        } else {
            outputSpeedUnitLabel = this.checkOutputSpeedUnitLabel(parentEntityConfig.output_speed_unit_label);
        }
        let speedRangeBeaufort;
        if (entityConfig.speed_range_beaufort === undefined) {
            speedRangeBeaufort = ConfigCheckUtils.checkBooleanDefaultTrue(parentEntityConfig.speed_range_beaufort);
        } else {
            speedRangeBeaufort = ConfigCheckUtils.checkBooleanDefaultTrue(entityConfig.speed_range_beaufort);
        }
        let speedRangeStep;
        if (entityConfig.speed_range_step) {
            speedRangeStep = this.checkSpeedRangeStep(entityConfig.speed_range_step);
        } else {
            speedRangeStep =  this.checkSpeedRangeStep(parentEntityConfig.speed_range_step);
        }
        let speedRangeMax;
        if (entityConfig.speed_range_max) {
            speedRangeMax = this.checkSpeedRangeMax(entityConfig.speed_range_max);
        } else {
            speedRangeMax = this.checkSpeedRangeMax(parentEntityConfig.speed_range_max);
        }
        let speedRanges;
        if (entityConfig.speed_ranges) {
            speedRanges = this.checkSpeedRanges(entityConfig.speed_ranges);
        } else {
            speedRanges = this.checkSpeedRanges(parentEntityConfig.speed_ranges);
        }
        const dynamicSpeedRanges = this.checkDynamicSpeedRanges(entityConfig.dynamic_speed_ranges);
        this.checkSpeedRangeCombi(outputSpeedUnit, speedRangeStep, speedRangeMax);
        this.checkAttribuutStatsCombi(useStatistics, entityConfig.attribute);

        return new WindSpeedEntity(entity, entityConfig.attribute, name, useStatistics, renderRelativeScale,
            windspeedBarFull, inputSpeedUnit, outputSpeedUnit,  outputSpeedUnitLabel, speedRangeBeaufort,
            speedRangeStep, speedRangeMax, speedRanges, dynamicSpeedRanges);
    }

    private static checkInputSpeedUnit(inputSpeedUnit: string): string {
        if (inputSpeedUnit) {
            if (inputSpeedUnit !== 'mps'
                && inputSpeedUnit !== 'bft'
                && inputSpeedUnit !== 'kph'
                && inputSpeedUnit !== 'mph'
                && inputSpeedUnit !== 'fps'
                && inputSpeedUnit !== 'knots'
                && inputSpeedUnit !== 'auto') {
                throw new Error('Invalid windspeed unit configured: ' + inputSpeedUnit +
                    '. Valid options: mps, bft, fps, kph, mph, knots, auto');
            }
            return inputSpeedUnit;
        }
        return GlobalConfig.defaultInputSpeedUnit;
    }

    private static checkOutputSpeedUnit(outputSpeedUnit: string): string {
        if (outputSpeedUnit) {
            if (outputSpeedUnit !== 'mps'
                && outputSpeedUnit !== 'kph'
                && outputSpeedUnit !== 'mph'
                && outputSpeedUnit !== 'fps'
                && outputSpeedUnit !== 'knots') {
                throw new Error('Invalid output windspeed unit configured: ' + outputSpeedUnit +
                    '. Valid options: mps, fps, kph, mph, knots');
            }
            return outputSpeedUnit;
        }
        return GlobalConfig.defaultOutputSpeedUnit;
    }

    private static checkOutputSpeedUnitLabel(outputSpeedUnitLabel: string): string | undefined {
        if (outputSpeedUnitLabel) {
            return outputSpeedUnitLabel;
        }
        return undefined;
    }

    private static checkSpeedRangeStep(speedRangeStep: number): number | undefined {
        if (speedRangeStep && isNaN(speedRangeStep)) {
            throw new Error('WindRoseCard: Invalid speed_range_step, should be a positive number.');
        } else if (speedRangeStep <= 0) {
            throw new Error('WindRoseCard: Invalid speed_range_step, should be a positive number.')
        } else if (speedRangeStep) {
            return speedRangeStep;
        }
        return undefined;
    }

    private static checkSpeedRangeMax(speedRangeMax: number): number | undefined {
        if (speedRangeMax && isNaN(speedRangeMax)) {
            throw new Error('WindRoseCard: Invalid speed_range_max, should be a positive number.');
        } else if (speedRangeMax <= 0) {
            throw new Error('WindRoseCard: Invalid speed_range_max, should be a positive number.')
        } else if (speedRangeMax) {
            return speedRangeMax;
        }
        return undefined;
    }

    private static checkSpeedRanges(speedRanges: CardConfigSpeedRange[]): SpeedRange[] {
        const speedRangeConfigs: SpeedRange[] = [];
        if (speedRanges && speedRanges.length > 0) {
            const sortSpeedRanges = speedRanges.slice();
            sortSpeedRanges.sort((a, b) => a.from_value - b.from_value)
            const lastIndex = sortSpeedRanges.length - 1;
            for (let i = 0; i < lastIndex; i++) {
                speedRangeConfigs.push(new SpeedRange(i,
                    sortSpeedRanges[i].from_value,
                    sortSpeedRanges[i + 1].from_value,
                    sortSpeedRanges[i].color));
            }
            speedRangeConfigs.push(new SpeedRange(lastIndex,
                sortSpeedRanges[lastIndex].from_value,
                -1,
                sortSpeedRanges[lastIndex].color))
        }
        return speedRangeConfigs;
    }

    private static checkSpeedRangeCombi(outputSpeedUnit: string | undefined, speedRangeStep: number | undefined,
                                 speedRangeMax: number | undefined): void {
        if (outputSpeedUnit === 'bft' && (speedRangeStep || speedRangeMax)) {
            throw new Error("WindRoseCard: speed_range_step and/or speed_range_max should not be set when using output " +
                "speed unit Beaufort (bft). Beaufort uses fixed speed ranges.");
        }
        if ((speedRangeStep && !speedRangeMax) || (!speedRangeStep && speedRangeMax)) {
            throw new Error(`WindRoseCard: speed_range_step and speed_range_max should both be set, step: ${speedRangeStep}, max: ${speedRangeMax}`)
        }
    }

    private static checkDynamicSpeedRanges(dynamicSpeedRanges: DynamicSpeedRange[]): DynamicSpeedRange[] {
        if (dynamicSpeedRanges === undefined || dynamicSpeedRanges.length === 0) {
            return [];
        }
        const sorted = [...dynamicSpeedRanges].sort((a, b) => a.average_above - b.average_above);
        if (sorted[0].average_above !== 0) {
            throw new Error("First dynamic speed config average_above should be 0.");
        }
        for (const dynamicRangeConfig of sorted) {
            if (dynamicRangeConfig.average_above < 0) {
                throw new Error("Dynamic speed ranges average_above should be a number higher then 0.");
            }
            if (dynamicRangeConfig.step <= 0 || dynamicRangeConfig.step === undefined) {
                throw new Error("Dynamic speed ranges step should be a number higher then 0.");
            }
            if (dynamicRangeConfig.max <= 0 || dynamicRangeConfig.max === undefined) {
                throw new Error("Dynamic speed ranges max should be a number higher then 0.");
            }
        }
        return sorted;
    }

    private static checkAttribuutStatsCombi(useStatistics: boolean, attribute: string) {
        if (useStatistics && attribute) {
            throw new Error("Statistics not supported for attribute values.");
        }
    }

}
