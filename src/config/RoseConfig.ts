import {ConfigCheckUtils} from "./ConfigCheckUtils";
import {CardConfigRose} from "../card/CardConfigRose";
import {GlobalConfig} from "./GlobalConfig";
import {CenterCircleConfig} from "./CenterCircleConfig";
import {Log} from "../util/Log";

export class RoseConfig {

    constructor(
        public readonly windDirectionCount: number,
        public readonly backgroundImage: string | undefined,
        public readonly roseOpacity: number,
        public readonly clipBackgroundImage: boolean,
        public readonly circleLegendTextSize: number,
        public readonly windRoseDrawNorthOffset: number,
        public readonly firstSegmentInLeaves: boolean,
        public readonly centerCircleConfig: CenterCircleConfig,
        public readonly circleCount: number | undefined,
        public readonly outerCirclePercentage: number | undefined) {
    }

    circleLegendConfig(): number[] {
        return [this.circleCount!, Math.round(this.outerCirclePercentage! / this.circleCount!), this.outerCirclePercentage!];
    }

    static fromConfig(cardConfig: CardConfigRose) {
        const windRoseDrawNorthOffset = this.checkWindRoseDrawNorthOffset(cardConfig?.windrose_draw_north_offset);

        let centerCalmPercentage = ConfigCheckUtils.checkBooleanDefaultUndefined(cardConfig?.center_calm_percentage);
        if (centerCalmPercentage !== undefined) {
            Log.warn("center_calm_percentage config options is deprecated, use the rose_config.center_cirlce_config configuration options.");
        } else {
            centerCalmPercentage = true;
        }
        const firstSegmentInLeaves = ConfigCheckUtils.checkBooleanOrDefault(cardConfig?.first_segment_in_leaves, !centerCalmPercentage);
        const centerCircleConfig = CenterCircleConfig.fromConfig(cardConfig?.center_circle, centerCalmPercentage);
        const windDirectionCount = this.checkWindDirectionCount(cardConfig?.wind_direction_count);
        const backgroundImage = ConfigCheckUtils.checkString(cardConfig?.background_image);
        const roseOpacity = ConfigCheckUtils.checkNummerOrDefault(cardConfig?.rose_opacity, 1);
        const clipBackgroundImage = ConfigCheckUtils.checkBooleanDefaultFalse(cardConfig?.clip_background_image);
        const circleLegendTextSize = ConfigCheckUtils.checkNummerOrDefault(cardConfig?.circle_legend_text_size, 30);
        const circleCount = ConfigCheckUtils.checkNumberOrUndefined("circle_count", cardConfig?.circle_count);
        const outerCirclePercentage = ConfigCheckUtils.checkNumberOrUndefined("outer_circle_percentage", cardConfig?.outer_circle_percentage);
        return new RoseConfig(windDirectionCount, backgroundImage, roseOpacity, clipBackgroundImage, circleLegendTextSize,
            windRoseDrawNorthOffset, firstSegmentInLeaves, centerCircleConfig, circleCount, outerCirclePercentage)
    }

    private static checkWindRoseDrawNorthOffset(windrose_draw_north_offset: number | undefined): number {
        if (windrose_draw_north_offset && isNaN(windrose_draw_north_offset)) {
            throw new Error('WindRoseCard: Invalid render direction offset, should be a number in degress between 0 and 360.');
        } else if (windrose_draw_north_offset) {
            return windrose_draw_north_offset;
        }
        return 0;
    }

    private static checkWindDirectionCount(wind_direction_count: number | undefined): number {
        if (wind_direction_count) {
            if (isNaN(wind_direction_count) || wind_direction_count < 4 ||
                wind_direction_count > 32) {
                throw new Error("Wind direction count can a number between 4 and 32");
            }
            return wind_direction_count;
        }
        return GlobalConfig.defaultWindDirectionCount;
    }

}
