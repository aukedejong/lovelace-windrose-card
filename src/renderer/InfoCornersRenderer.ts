import {DimensionConfig} from "./DimensionConfig";
import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {SvgUtil} from "./SvgUtil";
import {Coordinate} from "./Coordinate";
import {TextAttributes} from "./TextAttributes";
import {EntityState} from "../entity-state-processing/EntityState";
import {CornerInfo} from "../config/CornerInfo";
import SVG, {Svg} from "@svgdotjs/svg.js";
import {round} from "custom-card-helpers";
import {WindSpeedConvertFunctionFactory} from "../converter/WindSpeedConvertFunctionFactory";
import {WindDirectionLettersConverter} from "../converter/WindDirectionLettersConverter";
import {CornersInfo} from "../config/CornersInfo";

export class InfoCornersRenderer {

    private readonly dimensionCalculator: WindRoseDimensionCalculator;
    private svgUtil!: SvgUtil;

    private leftTopCoor: Coordinate;
    private rightTopCoor: Coordinate;
    private rightBottomCoor: Coordinate;
    private leftBottomCoor: Coordinate;

    private leftTopConfig: CornerInfo;
    private rightTopConfig: CornerInfo;
    private leftBottomConfig: CornerInfo;
    private rightBottomConfig: CornerInfo;

    private leftTopValue!: SVG.Text;
    private rightTopValue!: SVG.Text;
    private leftBottomValue!: SVG.Text;
    private rightBottomValue!: SVG.Text;

    private leftTopConverter: (input: any) => any;
    private rightTopConverter: (input: any) => any;
    private leftBottomConverter: (input: any) => any;
    private rightBottomConverter: (input: any) => any;

    constructor(cornersInfo: CornersInfo, dimensionConfig: DimensionConfig, svg: Svg) {

        this.dimensionCalculator = new WindRoseDimensionCalculator(dimensionConfig);
        this.svgUtil = new SvgUtil(svg);

        this.leftTopCoor = this.dimensionCalculator.infoCornerLeftTop();
        this.rightTopCoor = this.dimensionCalculator.infoCornerRightTop();
        this.leftBottomCoor = this.dimensionCalculator.infoCornetLeftBottom();
        this.rightBottomCoor = this.dimensionCalculator.infoCornetRightBottom();

        this.leftTopConfig = cornersInfo.topLeftInfo;
        this.rightTopConfig = cornersInfo.topRightInfo;
        this.leftBottomConfig = cornersInfo.bottomLeftInfo;
        this.rightBottomConfig = cornersInfo.bottomRightInfo;

        const windConverterFactory = new WindSpeedConvertFunctionFactory();

        this.leftTopConverter = this.getConverterFunction(this.leftTopConfig, windConverterFactory);
        this.rightTopConverter = this.getConverterFunction(this.rightTopConfig, windConverterFactory);
        this.leftBottomConverter = this.getConverterFunction(this.leftBottomConfig, windConverterFactory);
        this.rightBottomConverter = this.getConverterFunction(this.rightBottomConfig, windConverterFactory);
    }

    private getConverterFunction(config: CornerInfo, windConverterfactory: WindSpeedConvertFunctionFactory): (input: any) => any | undefined {

        if (config.inputUnit && config.outputUnit) {
            if (config.inputUnit === 'degrees' && config.outputUnit === 'letters') {
                return WindDirectionLettersConverter.getConvertToLettersFunc(config.directionLetters!);
            } else if (config.inputUnit === 'letters' && config.outputUnit === 'degrees') {
                return WindDirectionLettersConverter.getConvertToDegreesFunc(config.directionLetters!);
            }
            return windConverterfactory.getConverterFunction(config.inputUnit, config.outputUnit) as (input: any) => any;
        }
       return (input: any) => { return input };
    }

    drawCornerLabel() {
        if (this.leftTopConfig.label) {
            const leftTop = this.svgUtil.drawText(this.dimensionCalculator.infoCornerLabelLeftTop(), this.leftTopConfig.label,
                TextAttributes.infoCornerLabelAttribute(this.leftTopConfig.color, this.leftTopConfig.labelTextSize));
            leftTop.attr({"text-anchor": "left", "dominant-baseline": "hanging"});
        }
        if (this.rightTopConfig.label) {
            const rightTop = this.svgUtil.drawText(this.dimensionCalculator.infoCornerLabelRightTop(), this.rightTopConfig.label,
                TextAttributes.infoCornerLabelAttribute(this.rightTopConfig.color, this.rightTopConfig.labelTextSize));
            rightTop.attr({"text-anchor": "end", "dominant-baseline": "hanging"});
        }
        if (this.leftBottomConfig.label) {
            const leftBottom = this.svgUtil.drawText(this.dimensionCalculator.infoCornetLabelLeftBottom(), this.leftBottomConfig.label,
                TextAttributes.infoCornerLabelAttribute(this.leftBottomConfig.color, this.leftBottomConfig.labelTextSize));
            leftBottom.attr({"text-anchor": "left", "dominant-baseline": "hanging"});
        }
        if (this.rightBottomConfig.label) {
            const rightBottom = this.svgUtil.drawText(this.dimensionCalculator.infoCornetLabelRightBottom(), this.rightBottomConfig.label,
                TextAttributes.infoCornerLabelAttribute(this.rightBottomConfig.color, this.rightBottomConfig.labelTextSize));
            rightBottom.attr({"text-anchor": "end", "dominant-baseline": "hanging"});
        }
    }

    drawCornerValues(entityStates: EntityState[]) {
        if (this.leftTopConfig.show && entityStates[0].active) {
            this.leftTopValue = this.svgUtil.drawText(this.leftTopCoor,
                this.getText(entityStates[0], this.leftTopConfig, this.leftTopConverter),
                TextAttributes.infoCornerAttribute(this.leftTopConfig.color, this.leftTopConfig.valueTextSize));
            this.leftTopValue.attr({"text-anchor": "left", "dominant-baseline": "hanging"});
            this.leftTopValue.back();
        }
        if (entityStates[1].active) {
            this.rightTopValue = this.svgUtil.drawText(this.rightTopCoor,
                this.getText(entityStates[1], this.rightTopConfig, this.rightTopConverter),
                TextAttributes.infoCornerAttribute(this.rightTopConfig.color, this.rightTopConfig.valueTextSize));
            this.rightTopValue.attr({"text-anchor": "end", "dominant-baseline": "hanging"});
            this.rightTopValue.back();
        }
        if (entityStates[2].active) {
            this.leftBottomValue = this.svgUtil.drawText(this.leftBottomCoor,
                this.getText(entityStates[2], this.leftBottomConfig, this.leftBottomConverter),
                TextAttributes.infoCornerAttribute(this.leftBottomConfig.color, this.leftBottomConfig.valueTextSize));
            this.leftBottomValue.attr({"text-anchor": "left", "dominant-baseline": "auto"});
            this.leftBottomValue.back();
        }
        if (entityStates[3].active) {
            this.rightBottomValue = this.svgUtil.drawText(this.rightBottomCoor,
                this.getText(entityStates[3], this.rightBottomConfig, this.rightBottomConverter),
                TextAttributes.infoCornerAttribute(this.rightBottomConfig.color, this.rightBottomConfig.valueTextSize));
            this.rightBottomValue.attr({"text-anchor": "end", "dominant-baseline": "auto"});
            this.rightBottomValue.back();
        }
    }

    updateCornerValues(entityStates: EntityState[]) {
        this.leftTopValue?.remove();
        this.rightTopValue?.remove();
        this.leftBottomValue?.remove();
        this.rightBottomValue?.remove();
        this.drawCornerValues(entityStates);
    }

    private getText(entityState: EntityState, config: CornerInfo, converter: (input: any) => any): string {
        if (entityState === undefined || entityState === null) {
            return "";
        }
        let stateValue = converter(entityState.state);
        if (!isNaN(stateValue!) && !isNaN(config.precision!)) {
            stateValue = '' + round(+stateValue!, config.precision);
        }
        if (config.unit) {
            return stateValue + config.unit;
        }
        return stateValue!;
    }

}
