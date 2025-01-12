import {SvgUtil} from "./SvgUtil";
import {Svg} from "@svgdotjs/svg.js";
import {DirectionLabels} from "../config/DirectionLabels";

export class DimensionConfig {

    readonly roseRadius = 500;
    readonly marginLeft: number;
    readonly marginRight: number;
    readonly marginTop: number;
    readonly marginBottom: number;
    readonly directionLetterMargin = 45;

    readonly barBottom = {
        barLength: 0,
        barHeight: 40,
        barMarginLeft: 10,
        barMarginBottom: 40,
        multiBarSpacing: 90
    }

    readonly barRight = {
        barWidth: 90,
        barHeight: this.roseRadius * 2,
        barMarginLeft: 40,
        barMarginRight: 80,
        multiBarSpacing: 100
    }

    constructor(readonly barCount: number,
                readonly barLocation: string,
                readonly directionLabels: DirectionLabels,
                readonly svg: Svg) {

        const svgUtil = new SvgUtil(svg);
        const maxLength = this.directionLetterMargin + this.directionLabels.getMaxLabelLength(svgUtil);
        this.marginTop = maxLength;
        this.marginRight = maxLength;
        this.marginLeft = maxLength;
        this.marginBottom = maxLength;

        this.barBottom.barLength = (this.roseRadius * 2) + (this.marginLeft - 10) + (this.marginRight - 10);
    }
}
