import {WindBarConfig} from "../config/WindBarConfig";
import {SpeedRange} from "../converter/SpeedRange";
import {WindRoseData} from "./WindRoseData";
import {Log} from "../util/Log";
import {SpeedUnit} from "../converter/SpeedUnit";
import Snap from "snapsvg";
import {SvgUtil} from "./SvgUtil";
import {RectCoordinates} from "./RectCoordinates";
import {Coordinate} from "./Coordinate";
import {TextAttributes} from "./TextAttributes";
import {WindBarDimensionCalculator} from "./WindBarDimensionCalculator";
import {DimensionConfig} from "./DimensionConfig";
import {ColorUtil} from "../util/ColorUtil";

export class WindBarRenderer {

    private readonly config: WindBarConfig;
    private readonly svg: Snap.Paper;
    private readonly svgUtil!: SvgUtil;
    private readonly outputUnitName: string;
    private readonly speedRanges: SpeedRange[];
    private readonly dimensionCalculator: WindBarDimensionCalculator;
    private readonly positionIndex: number;

    constructor(config: WindBarConfig,
                dimensionConfig: DimensionConfig,
                outputSpeedUnit: SpeedUnit,
                positionIndex: number,
                svg: Snap.Paper) {

        Log.debug('WindBarRenderer init', config, outputSpeedUnit);
        this.config = config;
        this.svg = svg;
        if (config.outputUnitLabel) {
            this.outputUnitName = config.outputUnitLabel;
        } else if (config.speedRangeBeaufort) {
            this.outputUnitName = 'Beaufort';
        } else {
            this.outputUnitName = outputSpeedUnit.name;
        }
        this.speedRanges = outputSpeedUnit.speedRanges;
        this.positionIndex = positionIndex;
        this.svgUtil = new SvgUtil(this.svg);
        this.dimensionCalculator = new WindBarDimensionCalculator(dimensionConfig);
    }

    drawWindBar(windBarData: WindRoseData) {
        if (windBarData === undefined) {
            Log.error("drawWindBar(): Can't draw bar, windRoseData not set.");
            return;
        }
        Log.trace('drawWindBar(): ', windBarData);

        if (this.config.orientation === 'horizontal') {
            this.drawBarLegendHorizontal(windBarData.speedRangePercentages);

        } else if (this.config.orientation === 'vertical') {
            this.drawBarLegendVertical(windBarData.speedRangePercentages);
        }
    }

    private drawBarLegendVertical(speedRangePercentages: number[]) {

        const fontSize = 40;
        const barRect = this.dimensionCalculator.barRectRight(this.positionIndex);
        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.config.full) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }

        const lengthMaxRange = (this.dimensionCalculator.cfg.barRight.barHeight / highestRangeMeasured)
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;

        var barLabel = this.svgUtil.drawText(new Coordinate(barRect.startPoint.x - 10, barRect.startPoint.y), this.config.label, TextAttributes.windBarAttribute(this.config.barNameColor, fontSize, "auto", "left"));
        barLabel.transform("r270," + (barRect.startPoint.x - 10) + "," + barRect.startPoint.y);

        const posX = barRect.startPoint.x;
        let posY = barRect.startPoint.y;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (!this.config.renderRelativeScale || i === highestRangeMeasured - 1) {
                length = lengthMaxRange * -1;
            } else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.dimensionCalculator.cfg.barRight.barHeight - lengthMaxRange) / maxScale) * -1;
            }

            const rect = this.svgUtil.drawPolyRect(new RectCoordinates(new Coordinate(posX, posY), barRect.width, length));
            rect.attr({ fill: this.speedRanges[i].color, stroke: this.config.barBorderColor});

            if (this.config.speedRangeBeaufort) {
                if (i == 12) {
                    this.svgUtil.drawText(new Coordinate(posX + barRect.width + 10, posY), i + '', TextAttributes.windBarAttribute(this.config.barUnitValuesColor, fontSize, "middle", "left"));
                } else {
                    this.svgUtil.drawText(new Coordinate(posX + barRect.width + 10, posY + (length / 2)), i + "", TextAttributes.windBarAttribute(this.config.barUnitValuesColor, fontSize, "middle", "left"));
                }
            } else {
                this.svgUtil.drawText(new Coordinate(posX + barRect.width + 10, posY), this.speedRanges[i].minSpeed + '', TextAttributes.windBarAttribute(this.config.barUnitValuesColor, fontSize, "middle", "left"));
            }

            if (speedRangePercentages[i] > 0) {
                var percentage = Math.round(speedRangePercentages[i]);
                var percFontSize = percentage === 100 ? fontSize - 5 : fontSize;
                let percentageTextColor = this.getPercentageTextColor(this.config.barPercentagesColor, this.speedRanges[i].color);
                this.svgUtil.drawText(new Coordinate(posX + (barRect.width / 2), posY + (length / 2)), `${percentage}%`, TextAttributes.windBarAttribute(percentageTextColor, percFontSize, "middle", "middle"));
            }

            posY += length;
        }
        if (!this.config.speedRangeBeaufort && !this.config.full && highestRangeMeasured < speedRangePercentages.length) {

            this.svgUtil.drawText(new Coordinate(posX + barRect.width + 10, posY), this.speedRanges[highestRangeMeasured].minSpeed + '', TextAttributes.windBarAttribute(this.config.barUnitValuesColor, fontSize, "middle", "left"));
        }

        this.svgUtil.drawText(new Coordinate(posX + (barRect.width / 2), barRect.startPoint.y - barRect.height - 15), this.outputUnitName, TextAttributes.windBarAttribute(this.config.barUnitNameColor, fontSize, "auto", "middle"));
    }

    private drawBarLegendHorizontal(speedRangePercentages: number[]) {

        const barRect = this.dimensionCalculator.barRectBottom(this.positionIndex);
        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.config.full) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }

        const lengthMaxRange = (this.dimensionCalculator.cfg.barBottom.barLength / highestRangeMeasured)
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;

        const coord = new Coordinate(barRect.startPoint.x, barRect.startPoint.y - 10);
        this.svgUtil.drawText(coord, this.config.label, TextAttributes.windBarAttribute(this.config.barNameColor, 35, "auto", "start"))

        let posX = barRect.startPoint.x;
        const posY = barRect.startPoint.y;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (!this.config.renderRelativeScale || i === highestRangeMeasured - 1) {
                length = lengthMaxRange;
            } else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.dimensionCalculator.cfg.barBottom.barLength - lengthMaxRange) / maxScale);
            }

            var rect = this.svgUtil.drawRect(new RectCoordinates(new Coordinate(posX, posY), length, barRect.height));
            rect.attr({ fill: this.speedRanges[i].color, stroke: this.config.barBorderColor});

            if (this.config.speedRangeBeaufort) {
                const coord = new Coordinate(posX + (length / 2), posY + barRect.height + 10);
                this.svgUtil.drawText(coord, i + '', TextAttributes.windBarAttribute(this.config.barUnitValuesColor, 30, "hanging", "middle"));
            } else {
                const coord = new Coordinate(posX, posY + barRect.height + 10);
                this.svgUtil.drawText(coord, this.speedRanges[i].minSpeed + '', TextAttributes.windBarAttribute(this.config.barUnitValuesColor, 30, "hanging", "middle"));
            }

            if (speedRangePercentages[i] > 0) {
                const coord = new Coordinate(posX + (length / 2), posY + (barRect.height / 2) + 2);
                let percentageTextColor = this.getPercentageTextColor(this.config.barPercentagesColor, this.speedRanges[i].color);
                this.svgUtil.drawText(coord, `${Math.round(speedRangePercentages[i])}%`, TextAttributes.windBarAttribute(percentageTextColor, 35, "middle", "middle"));
            }

            posX += length;
        }
        if (!this.config.speedRangeBeaufort && !this.config.full && highestRangeMeasured < speedRangePercentages.length) {
            const coord = new Coordinate(posX, posY + barRect.height + 3);
            this.svgUtil.drawText(coord, this.speedRanges[highestRangeMeasured].minSpeed + '', TextAttributes.windBarAttribute(this.config.barUnitValuesColor, 35, "hanging", "middle"))
        }

        const unitNameCoord = new Coordinate(barRect.startPoint.x + barRect.width, barRect.startPoint.y - 10);
        this.svgUtil.drawText(unitNameCoord, this.outputUnitName, TextAttributes.windBarAttribute(this.config.barUnitNameColor, 35, "auto", "end"))
    }

    private getIndexHighestRangeWithMeasurements(speedRangePercentages: number[]) {
        for (let i = speedRangePercentages.length - 1; i >= 0; i--) {
            if (speedRangePercentages[i] > 0) {
                return i + 1;
            }
        }
        return speedRangePercentages.length;
    }

    private getPercentageTextColor(configColor: string, backgroundColor: string) {
        if (configColor === 'auto') {
             return ColorUtil.getTextColorBasedOnBackground(backgroundColor);
        }
        return configColor;
    }
}
