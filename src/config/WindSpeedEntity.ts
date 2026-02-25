import {SpeedRange} from "../speed-range/SpeedRange";
import {CardConfigWindSpeedEntity} from "../card/CardConfigWindSpeedEntity";
import {GlobalConfig} from "./GlobalConfig";
import {CardConfigSpeedRange} from "../card/CardConfigSpeedRange";
import {ConfigCheckUtils} from "./ConfigCheckUtils";
import {DynamicSpeedRange} from "./DynamicSpeedRange";

export class WindSpeedEntity {

    constructor(
        public entity: string,
        public readonly attribute: string | undefined,
        public readonly name: string,
        public readonly useStatistics: boolean,
        public readonly statisticsPeriod: string,
        public readonly barRenderScale: string,
        public readonly windspeedBarFull: boolean,
        public speedUnit: string,
        public readonly outputSpeedUnit: string,
        public readonly outputSpeedUnitLabel: string | undefined,
        public readonly speedRangeBeaufort: boolean,
        public readonly speedRangeStep: number | undefined,
        public readonly speedRangeMax: number | undefined,
        public readonly speedRanges: SpeedRange[] = [],
        public readonly dynamicSpeedRanges: DynamicSpeedRange[] = [],
        public readonly currentSpeedArrow: boolean,
        public readonly currentSpeedArrowSize: number,
        public readonly currentSpeedArrowLocation: string,
        public readonly barLabelTextSize: number,
        public readonly barSpeedTextSize: number,
        public readonly barPercentageTextSize: number,
        public readonly compensationFactor: number,
        public readonly compensationAbsolute: number,
        public useForWindRose: boolean) {}

    static fromConfig(entityConfig: CardConfigWindSpeedEntity,
                      windspeedBarLocation: string): WindSpeedEntity {

        this.checkDeprecations(entityConfig);
        const entity = entityConfig.entity;
        const name = entityConfig.name;
        const useStatistics = ConfigCheckUtils.checkBooleanDefaultFalse(entityConfig.use_statistics);
        const inputSpeedUnit = this.checkInputSpeedUnit(entityConfig.speed_unit);

        const barRenderScale = this.checkBarRenderScale(entityConfig.bar_render_scale);
        const statsPeriod = ConfigCheckUtils.checkStatisticsPeriod(entityConfig.statistics_period);
        const currentSpeedArrow = ConfigCheckUtils.checkBooleanDefaultFalse(entityConfig.current_speed_arrow);
        const currentSpeedArrowSize = ConfigCheckUtils.checkNummerOrDefault(entityConfig.current_speed_arrow_size, 40);
        const currentSpeedArrowLocation = this.checkCurrentSpeedArrowLocation(entityConfig.current_speed_arrow_location, windspeedBarLocation);
        const barLabelTextSize = ConfigCheckUtils.checkNummerOrDefault(entityConfig.bar_label_text_size, 40);
        const barSpeedTextSize = ConfigCheckUtils.checkNummerOrDefault(entityConfig.bar_speed_text_size, 40);
        const barPercentageTextSize = ConfigCheckUtils.checkNummerOrDefault(entityConfig.bar_percentage_text_size, 40);
        const compensationFactor = ConfigCheckUtils.checkNummerOrDefault(entityConfig.speed_compensation_factor, 1);
        const compensationAbsolute = ConfigCheckUtils.checkNummerOrDefault(entityConfig.speed_compensation_absolute, 0);

        const windspeedBarFull = ConfigCheckUtils.checkBooleanDefaultTrue(entityConfig.windspeed_bar_full);
        const outputSpeedUnit = this.checkOutputSpeedUnit(entityConfig.output_speed_unit);
        const outputSpeedUnitLabel = this.checkOutputSpeedUnitLabel(entityConfig.output_speed_unit_label);
        const speedRangeBeaufort = ConfigCheckUtils.checkBooleanDefaultTrue(entityConfig.speed_range_beaufort);
        const speedRangeStep = this.checkSpeedRangeStep(entityConfig.speed_range_step);
        const speedRangeMax = this.checkSpeedRangeMax(entityConfig.speed_range_max);
        const speedRanges = this.checkSpeedRanges(entityConfig.speed_ranges);
        const useForWindRose = ConfigCheckUtils.checkBooleanDefaultFalse(entityConfig.use_for_windrose);

        const dynamicSpeedRanges = this.checkDynamicSpeedRanges(entityConfig.dynamic_speed_ranges);
        this.checkSpeedRangeCombi(speedRanges, speedRangeStep, speedRangeMax, dynamicSpeedRanges, speedRangeBeaufort);
        this.checkAttribuutStatsCombi(useStatistics, entityConfig.attribute);

        return new WindSpeedEntity(entity, entityConfig.attribute, name, useStatistics, statsPeriod, barRenderScale,
            windspeedBarFull, inputSpeedUnit, outputSpeedUnit,  outputSpeedUnitLabel, speedRangeBeaufort,
            speedRangeStep, speedRangeMax, speedRanges, dynamicSpeedRanges, currentSpeedArrow, currentSpeedArrowSize,
            currentSpeedArrowLocation, barLabelTextSize, barSpeedTextSize, barPercentageTextSize, compensationFactor,
            compensationAbsolute, useForWindRose);
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

    private static checkSpeedRangeCombi(speedRanges: SpeedRange[], speedRangeStep: number | undefined, speedRangeMax: number | undefined,
                                        dynamicSpeedRanges: DynamicSpeedRange[], speedRangeBeaufort: boolean): void {
        if (speedRangeBeaufort && (speedRangeStep || speedRangeMax || dynamicSpeedRanges.length > 0 || speedRanges.length > 0)) {
            throw new Error("WindRoseCard: speed_range_step, speed_range_max, speed_ranges or dynamic_speed_ranges should not be set when using speed_range_beaufort. " +
                "Beaufort uses fixed speed ranges.");
        }
        if ((speedRangeStep && !speedRangeMax) || (!speedRangeStep && speedRangeMax)) {
            throw new Error(`WindRoseCard: speed_range_step and speed_range_max should both be set, step: ${speedRangeStep}, max: ${speedRangeMax}`)
        }
        let speedRangeOptionCount = 0;
        if (speedRangeStep || speedRangeMax) {
            speedRangeOptionCount++;
        }
        if (speedRanges?.length > 0) {
            speedRangeOptionCount++;
        }
        if (dynamicSpeedRanges?.length > 0) {
            speedRangeOptionCount++;
        }
        if (speedRangeOptionCount > 1) {
            throw new Error(`WindRoseCard: speed_range_step/max, speed_ranges and dynamic_speed_ranges should not be configured next to each other.`)
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

    private static checkCurrentSpeedArrowLocation(location: string, barLocation: string): string {
        if (barLocation === 'right') {
            if (location === undefined || location === null || location === '') {
                return 'left';
            } else if (location !== 'left' && location !== 'right') {
                throw new Error('Current speed arrow location can only be left or right when speedbars are displayed vertical.');
            }
        } else {
            if (location === undefined || location === null || location === '') {
                return 'above';
            } else if (location !== 'below' && location !== 'above') {
                throw new Error('Current speed arrow location can only be above or below when speedbars are displayed horizontall');
            }
        }
        return location;
    }

    private static checkBarRenderScale(barRenderScale: string | undefined): string {
        if (!barRenderScale) {
            return 'windspeed_relative';
        }
        if (barRenderScale === 'absolute' || barRenderScale === 'windspeed_relative' || barRenderScale === 'percentage_relative') {
            return barRenderScale;
        }
        throw new Error('WindRoseCard: render-scale should be absolute, windspeed_relative or percentage_relative');
    }

    private static checkDeprecations(entityConfig: CardConfigWindSpeedEntity) {
        if (ConfigCheckUtils.checkHasProperty(entityConfig, 'render_relative_scale')) {
            throw new Error('render_relative_scale option is renamed to bar_render_scale with options: absolute, windspeed_relative and percentage_relative')
        }
    }

    public isAbsoluteRenderScale() {
        return this.barRenderScale === 'absolute';
    }

    public isWindspeedRelativeScale() {
        return this.barRenderScale === 'windspeed_relative';
    }
}
