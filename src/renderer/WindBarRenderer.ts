import {SpeedRange} from "../speed-range/SpeedRange";
import {WindRoseData} from "./WindRoseData";
import {Log} from "../util/Log";
import {SpeedUnit} from "../converter/SpeedUnit";
import {SvgUtil} from "./SvgUtil";
import {RectCoordinates} from "./RectCoordinates";
import {Coordinate} from "./Coordinate";
import {TextAttributes} from "./TextAttributes";
import {WindBarDimensionCalculator} from "./WindBarDimensionCalculator";
import {DimensionConfig} from "./DimensionConfig";
import {ColorUtil} from "../util/ColorUtil";
import {Svg} from "@svgdotjs/svg.js";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindSpeedEntity} from "../config/WindSpeedEntity";
import {CardColors} from "../config/CardColors";

export class WindBarRenderer {

    private readonly config: CardConfigWrapper;
    private readonly cardColors: CardColors;
    private readonly windSpeedEntityConfig: WindSpeedEntity;

    private readonly svg: Svg;
    private readonly svgUtil!: SvgUtil;
    private readonly outputSpeedUnitLabel: string;
    private readonly speedRanges: SpeedRange[];
    private readonly dimensionCalculator: WindBarDimensionCalculator;
    private readonly positionIndex: number;

    constructor(config: CardConfigWrapper,
                dimensionConfig: DimensionConfig,
                outputSpeedUnit: SpeedUnit,
                positionIndex: number,
                svg: Svg) {

        Log.debug('WindBarRenderer init', config, outputSpeedUnit);
        this.config = config;
        this.cardColors = config.cardColor;
        this.windSpeedEntityConfig = config.windspeedEntities[positionIndex];
        this.svg = svg;
        if (this.windSpeedEntityConfig.outputSpeedUnitLabel) {
            this.outputSpeedUnitLabel = this.windSpeedEntityConfig.outputSpeedUnitLabel;
        } else if (this.windSpeedEntityConfig.speedRangeBeaufort) {
            this.outputSpeedUnitLabel = 'Beaufort';
        } else {
            this.outputSpeedUnitLabel = outputSpeedUnit.name;
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

        if (this.config.windspeedBarLocation === 'bottom') {
            this.drawBarLegendBottom(windBarData.speedRangePercentages);

        } else if (this.config.windspeedBarLocation === 'right') {
            this.drawBarLegendRight(windBarData.speedRangePercentages);
        }
    }

    private drawBarLegendRight(speedRangePercentages: number[]) {

        const fontSize = 40;
        const barRect = this.dimensionCalculator.barRectRight(this.positionIndex);
        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.windSpeedEntityConfig.windspeedBarFull) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }

        const lengthMaxRange = (this.dimensionCalculator.cfg.barRight.barHeight / highestRangeMeasured)
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;

        var barLabel = this.svgUtil.drawText(new Coordinate(barRect.startPoint.x - 10, barRect.startPoint.y), this.windSpeedEntityConfig.name, TextAttributes.windBarAttribute(this.cardColors.barName, fontSize, "auto", "left"));
        barLabel.rotate(270, barRect.startPoint.x - 10, barRect.startPoint.y);

        const posX = barRect.startPoint.x;
        let posY = barRect.startPoint.y;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (!this.windSpeedEntityConfig.renderRelativeScale || i === highestRangeMeasured - 1) {
                length = lengthMaxRange * -1;
            } else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.dimensionCalculator.cfg.barRight.barHeight - lengthMaxRange) / maxScale) * -1;
            }

            const rect = this.svgUtil.drawPolyRect(new RectCoordinates(new Coordinate(posX, posY), barRect.width, length));
            rect.attr({ fill: this.speedRanges[i].color, stroke: this.config.cardColor.barBorder});

            if (this.windSpeedEntityConfig.speedRangeBeaufort) {
                if (i == 12) {
                    this.svgUtil.drawText(new Coordinate(posX + barRect.width + 10, posY), i + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, fontSize, "middle", "left"));
                } else {
                    this.svgUtil.drawText(new Coordinate(posX + barRect.width + 10, posY + (length / 2)), i + "", TextAttributes.windBarAttribute(this.cardColors.barUnitValues, fontSize, "middle", "left"));
                }
            } else {
                let baseline = 'middle';
                if (i === 0) {
                    baseline = 'auto';
                }
                this.svgUtil.drawText(new Coordinate(posX + barRect.width + 10, posY), this.speedRanges[i].minSpeed + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, fontSize, baseline, "left"));
            }

            if (speedRangePercentages[i] > 0) {
                var percentage = Math.round(speedRangePercentages[i]);
                var percFontSize = percentage === 100 ? fontSize - 5 : fontSize;
                let percentageTextColor = this.getPercentageTextColor(this.cardColors.barPercentages, this.speedRanges[i].color);
                this.svgUtil.drawText(new Coordinate(posX + (barRect.width / 2), posY + (length / 2)), `${percentage}%`, TextAttributes.windBarAttribute(percentageTextColor, percFontSize, "middle", "middle"));
            }

            posY += length;
        }
        if (!this.windSpeedEntityConfig.speedRangeBeaufort && !this.windSpeedEntityConfig.windspeedBarFull && highestRangeMeasured < speedRangePercentages.length) {

            this.svgUtil.drawText(new Coordinate(posX + barRect.width + 10, posY), this.speedRanges[highestRangeMeasured].minSpeed + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, fontSize, "hanging", "left"));
        }

        this.svgUtil.drawText(new Coordinate(posX + (barRect.width / 2), barRect.startPoint.y - barRect.height - 15), this.outputSpeedUnitLabel, TextAttributes.windBarAttribute(this.cardColors.barUnitName, fontSize, "auto", "middle"));
    }

    private drawBarLegendBottom(speedRangePercentages: number[]) {

        const barRect = this.dimensionCalculator.barRectBottom(this.positionIndex);
        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.windSpeedEntityConfig.windspeedBarFull) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }

        const lengthMaxRange = (this.dimensionCalculator.cfg.barBottom.barLength / highestRangeMeasured)
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;

        const coord = new Coordinate(barRect.startPoint.x, barRect.startPoint.y - 10);
        this.svgUtil.drawText(coord, this.windSpeedEntityConfig.name, TextAttributes.windBarAttribute(this.cardColors.barName, 35, "auto", "start"))

        let posX = barRect.startPoint.x;
        const posY = barRect.startPoint.y;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (!this.windSpeedEntityConfig.renderRelativeScale || i === highestRangeMeasured - 1) {
                length = lengthMaxRange;
            } else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.dimensionCalculator.cfg.barBottom.barLength - lengthMaxRange) / maxScale);
            }

            var rect = this.svgUtil.drawRect(new RectCoordinates(new Coordinate(posX, posY), length, barRect.height));
            rect.attr({ fill: this.speedRanges[i].color, stroke: this.cardColors.barBorder});

            if (this.windSpeedEntityConfig.speedRangeBeaufort) {
                const coord = new Coordinate(posX + (length / 2), posY + barRect.height + 10);
                this.svgUtil.drawText(coord, i + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, 30, "hanging", "middle"));
            } else {
                const coord = new Coordinate(posX, posY + barRect.height + 10);
                let align = 'middle';
                if (i === 0) {
                    align = 'start';
                }
                this.svgUtil.drawText(coord, this.speedRanges[i].minSpeed + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, 30, "hanging", align));
            }

            if (speedRangePercentages[i] > 0) {
                const coord = new Coordinate(posX + (length / 2), posY + (barRect.height / 2) + 2);
                let percentageTextColor = this.getPercentageTextColor(this.cardColors.barPercentages, this.speedRanges[i].color);
                this.svgUtil.drawText(coord, `${Math.round(speedRangePercentages[i])}%`, TextAttributes.windBarAttribute(percentageTextColor, 35, "middle", "middle"));
            }

            posX += length;
        }
        if (!this.windSpeedEntityConfig.speedRangeBeaufort && !this.windSpeedEntityConfig.windspeedBarFull && highestRangeMeasured < speedRangePercentages.length) {
            const coord = new Coordinate(posX, posY + barRect.height + 3);
            this.svgUtil.drawText(coord, this.speedRanges[highestRangeMeasured].minSpeed + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, 35, "hanging", "end"))
        }

        const unitNameCoord = new Coordinate(barRect.startPoint.x + barRect.width, barRect.startPoint.y - 10);
        this.svgUtil.drawText(unitNameCoord, this.outputSpeedUnitLabel, TextAttributes.windBarAttribute(this.cardColors.barUnitName, 35, "auto", "end"))
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
