import {SpeedRange} from "../speed-range/SpeedRange";
import {WindRoseData} from "../renderer/WindRoseData";
import {Log} from "../util/Log";
import {SpeedUnit} from "../converter/SpeedUnit";
import {SvgUtil} from "../renderer/SvgUtil";
import {TextAttributes} from "../renderer/TextAttributes";
import {ColorUtil} from "../util/ColorUtil";
import {Svg} from "@svgdotjs/svg.js";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindSpeedEntity} from "../config/WindSpeedEntity";
import {CardColors} from "../config/CardColors";
import {SpeedRangeService} from "../speed-range/SpeedRangeService";
import {WindBarRangeCalcUtil} from "./WindBarRangeCalcUtil";
import {SegmentPosition} from "./SegmentPosition";
import {DimensionCalculator} from "../dimensions/DimensionCalculator";

export class WindBarRenderer {

    private readonly config: CardConfigWrapper;
    private readonly dimensionCalculator: DimensionCalculator;
    private readonly cardColors: CardColors;
    private readonly windSpeedEntityConfig: WindSpeedEntity;
    private readonly speedRangeService: SpeedRangeService;

    private readonly svg: Svg;
    private readonly svgUtil!: SvgUtil;
    private readonly outputSpeedUnitLabel: string;
    private speedRanges: SpeedRange[] = [];
    private readonly barWidth: number;
    private readonly barHeight: number;
    private readonly positionIndex: number;
    private readonly barLabelTextSize: number;
    private readonly barSpeedTextSize: number;

    constructor(config: CardConfigWrapper,
                dimensionCalculator: DimensionCalculator,
                outputSpeedUnit: SpeedUnit,
                speedRangeService: SpeedRangeService,
                positionIndex: number,
                svg: Svg) {

        Log.debug('WindBarRenderer init', config, outputSpeedUnit);
        this.config = config;
        this.cardColors = config.cardColor;
        this.windSpeedEntityConfig = config.windspeedEntities[positionIndex];
        this.barLabelTextSize = this.windSpeedEntityConfig.barLabelTextSize;
        this.barSpeedTextSize = this.windSpeedEntityConfig.barSpeedTextSize;
        this.svg = svg;
        if (this.windSpeedEntityConfig.outputSpeedUnitLabel) {
            this.outputSpeedUnitLabel = this.windSpeedEntityConfig.outputSpeedUnitLabel;
        } else if (this.windSpeedEntityConfig.speedRangeBeaufort) {
            this.outputSpeedUnitLabel = 'Beaufort';
        } else {
            this.outputSpeedUnitLabel = outputSpeedUnit.name;
        }
        this.speedRangeService = speedRangeService;
        this.positionIndex = positionIndex;
        this.svgUtil = new SvgUtil(this.svg);
        this.dimensionCalculator = dimensionCalculator;

        this.barWidth = this.dimensionCalculator.barWidth(this.positionIndex);
        this.barHeight = this.dimensionCalculator.barHeight(this.positionIndex);
    }

    drawWindBar(windBarData: WindRoseData) {
        if (windBarData === undefined) {
            Log.error("drawWindBar(): Can't draw bar, windRoseData not set.");
            return;
        }
        Log.trace('drawWindBar(): ', windBarData);
        this.speedRanges = this.speedRangeService.getSpeedRanges();
        const segmentCount = WindBarRangeCalcUtil.determineSegmentCount(windBarData.speedRangePercentages, this.windSpeedEntityConfig.windspeedBarFull);
        let segmentPositions: SegmentPosition[];
        let barStart = this.dimensionCalculator.barStart();
        let barLength = this.dimensionCalculator.barLength();
        const positionMinus = this.config.windspeedBarLocation !== 'bottom';

        if (this.windSpeedEntityConfig.renderRelativeScale) {
            segmentPositions = WindBarRangeCalcUtil.calcRelativeSegments(this.speedRanges, barStart, barLength, positionMinus, segmentCount);
        } else {
            segmentPositions = WindBarRangeCalcUtil.calcFixedSizeSegments(this.speedRanges, barStart, barLength, positionMinus, segmentCount);
        }


        if (this.config.windspeedBarLocation === 'bottom') {
            this.drawBarLegendBottom(windBarData.speedRangePercentages, segmentPositions);

        } else if (this.config.windspeedBarLocation === 'right') {
            this.drawBarLegendRight(windBarData.speedRangePercentages, segmentPositions);
        }
    }

    private drawBarLegendBottom(percentages: number[], segmentPositions: SegmentPosition[]) {
        const y = this.dimensionCalculator.barStartY(this.positionIndex);
        const y2 = y + this.barHeight;
        const labelUnitY = this.dimensionCalculator.barLabelY(this.positionIndex)
        const percLabelY = y + (this.barHeight / 2) + 2;
        const speedLabelY = this.dimensionCalculator.barSpeedLabelY(this.positionIndex);

        //Bar label
        this.svgUtil.drawText2(segmentPositions[0].start, labelUnitY, this.windSpeedEntityConfig.name,
            TextAttributes.windBarAttribute(this.cardColors.barName, this.barLabelTextSize,
                "auto", "start"))

        segmentPositions.forEach((segmentPosition, index) => {

            //Bar
            const rect = this.svgUtil.drawPathRect(segmentPosition.start, y, segmentPosition.end, y2);
            rect.attr({ fill: this.speedRanges[index].color, stroke: this.config.cardColor.barBorder});

            //Speed labels
            if (this.windSpeedEntityConfig.speedRangeBeaufort) {
                this.svgUtil.drawText2(segmentPosition.center, speedLabelY, index + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, "hanging", "middle"));
            } else {
                let align = 'middle';
                if (index === 0) {
                    align = 'start';
                }
                this.svgUtil.drawText2(segmentPosition.start, speedLabelY, segmentPosition.minSpeed + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, "hanging", align));
            }

            //Percentages
            if (percentages[index] > 0) {
                let percentageTextColor = this.getPercentageTextColor(this.cardColors.barPercentages, this.speedRanges[index].color);
                this.svgUtil.drawText2(segmentPosition.center, percLabelY, `${Math.round(percentages[index])}%`, TextAttributes.windBarAttribute(percentageTextColor, this.windSpeedEntityConfig.barPercentageTextSize, "middle", "middle"));
            }
        });
        //Last label if needed
        const lastSegment = segmentPositions[segmentPositions.length - 1];
        if (!this.windSpeedEntityConfig.speedRangeBeaufort && lastSegment.showLastLabel) {
            this.svgUtil.drawText2(lastSegment.end, speedLabelY, lastSegment.maxSpeed + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, "hanging", "end"))
        }
        //Unit label
        this.svgUtil.drawText2(lastSegment.end, labelUnitY , this.outputSpeedUnitLabel, TextAttributes.windBarAttribute(this.cardColors.barUnitName, this.barLabelTextSize, "auto", "end"))
    }

    private drawBarLegendRight(percentages: number[], segmentPositions: SegmentPosition[]) {
        const x = this.dimensionCalculator.barStartX(this.positionIndex);
        const x2 = x + this.barWidth;
        const labelX = this.dimensionCalculator.barLabelX(this.positionIndex);
        const barCenterX = x + (this.barWidth / 2);
        const speedLabelX = this.dimensionCalculator.barSpeedLabelX(this.positionIndex);

        //Bar label
        var barLabel = this.svgUtil.drawText2(labelX, segmentPositions[0].start, this.windSpeedEntityConfig.name, TextAttributes.windBarAttribute(this.cardColors.barName, this.barLabelTextSize, "auto", "left"))
        barLabel.rotate(270, labelX, segmentPositions[0].start);

        segmentPositions.forEach((segmentPosition, index) => {

            //Bar
            const rect = this.svgUtil.drawPathRect(x, segmentPosition.start, x2, segmentPosition.end);
            rect.attr({ fill: this.speedRanges[index].color, stroke: this.config.cardColor.barBorder});

            //Speed labels
            if (this.windSpeedEntityConfig.speedRangeBeaufort) {
                this.svgUtil.drawText2(speedLabelX, segmentPosition.center, index + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, "middle", "left"));
            } else {
                let baseline = 'middle';
                if (index === 0) {
                    baseline = 'start';
                }
                this.svgUtil.drawText2(speedLabelX, segmentPosition.start, segmentPosition.minSpeed + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, baseline, "left"));
            }

            //Percentages
            if (percentages[index] > 0) {
                let percentage = Math.round(percentages[index]);
                let percFontSize = percentage === 100 ? this.windSpeedEntityConfig.barPercentageTextSize * 0.8 : this.windSpeedEntityConfig.barPercentageTextSize
                let percentageTextColor = this.getPercentageTextColor(this.cardColors.barPercentages, this.speedRanges[index].color);
                this.svgUtil.drawText2(barCenterX, segmentPosition.center, `${percentage}%`, TextAttributes.windBarAttribute(percentageTextColor, percFontSize, "middle", "middle"));
            }

        });
        const lastSegment = segmentPositions[segmentPositions.length - 1];
        //Last label if needed
        if (!this.windSpeedEntityConfig.speedRangeBeaufort && lastSegment.showLastLabel) {
            this.svgUtil.drawText2(speedLabelX, lastSegment.end, lastSegment.maxSpeed + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, "hanging", "left"))
        }

        //Unit label
        this.svgUtil.drawText2(barCenterX, lastSegment.end - 15, this.outputSpeedUnitLabel, TextAttributes.windBarAttribute(this.cardColors.barUnitName, this.barLabelTextSize, "auto", "middle"))
    }

    private getPercentageTextColor(configColor: string, backgroundColor: string) {
        if (configColor === 'auto') {
             return ColorUtil.getTextColorBasedOnBackground(backgroundColor);
        }
        return configColor;
    }

}
