import {SpeedRange} from "../speed-range/SpeedRange";
import {WindRoseData} from "../renderer/WindRoseData";
import {SpeedUnit} from "../converter/SpeedUnit";
import {SvgUtil} from "../renderer/SvgUtil";
import {TextAttributes} from "../renderer/TextAttributes";
import {ColorUtil} from "../util/ColorUtil";
import SVG from "@svgdotjs/svg.js";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindSpeedEntity} from "../config/WindSpeedEntity";
import {CardColors} from "../config/CardColors";
import {SpeedRangeService} from "../speed-range/SpeedRangeService";
import {WindBarRangeCalcUtil} from "./WindBarRangeCalcUtil";
import {SegmentPosition} from "./SegmentPosition";
import {DimensionCalculator} from "../dimensions/DimensionCalculator";
import {Log2} from "../util/Log2";

export class WindBarRenderer {

    private readonly log = new Log2("WindBarRenderer");

    private readonly config: CardConfigWrapper;
    private readonly dimensionCalculator: DimensionCalculator;
    private readonly cardColors: CardColors;
    private readonly windSpeedEntityConfig: WindSpeedEntity;
    private readonly speedRangeService: SpeedRangeService;

    private readonly svgUtil!: SvgUtil;
    private readonly outputSpeedUnitLabel: string;
    private speedRanges: SpeedRange[] = [];
    private readonly barWidth: number;
    private readonly barHeight: number;
    private readonly positionIndex: number;
    private readonly barLabelTextSize: number;
    private readonly barSpeedTextSize: number;
    private windBarGroup!: SVG.G;
    private animationOrigin!: number;
    private doAnimation: boolean;

    constructor(config: CardConfigWrapper,
                dimensionCalculator: DimensionCalculator,
                outputSpeedUnit: SpeedUnit,
                speedRangeService: SpeedRangeService,
                positionIndex: number,
                svgUtil: SvgUtil) {

        this.log.method('constructor', config, outputSpeedUnit);
        this.config = config;
        this.cardColors = config.cardColor;
        this.windSpeedEntityConfig = config.windspeedEntities[positionIndex];
        this.barLabelTextSize = this.windSpeedEntityConfig.barLabelTextSize;
        this.barSpeedTextSize = this.windSpeedEntityConfig.barSpeedTextSize;
        this.doAnimation = !config.disableAnimations;
        this.svgUtil = svgUtil;
        if (this.windSpeedEntityConfig.outputSpeedUnitLabel) {
            this.outputSpeedUnitLabel = this.windSpeedEntityConfig.outputSpeedUnitLabel;
        } else if (this.windSpeedEntityConfig.speedRangeBeaufort) {
            this.outputSpeedUnitLabel = 'Beaufort';
        } else {
            this.outputSpeedUnitLabel = outputSpeedUnit.name;
        }
        this.speedRangeService = speedRangeService;
        this.positionIndex = positionIndex;
        this.dimensionCalculator = dimensionCalculator;

        this.barWidth = this.dimensionCalculator.barWidth(this.positionIndex);
        this.barHeight = this.dimensionCalculator.barHeight(this.positionIndex);
    }

    animateRemoveGraph(): void {
        if (this.windBarGroup && this.doAnimation) {
            this.animateBar(false);
        }
    }

    drawWindBar(windBarData: WindRoseData) {
        if (windBarData === undefined) {
            this.log.method('drawWindBar', 'Can\'t draw bar, windRoseData not set.');
            return;
        }
        this.log.method('drawWindBar', 'windBardata', windBarData);
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

        if (this.windBarGroup) {
            this.windBarGroup.remove();
        }
        this.windBarGroup = this.svgUtil.createGroup();

        if (this.config.windspeedBarLocation === 'bottom') {
            this.animationOrigin = this.dimensionCalculator.barStartY(this.positionIndex);
            this.drawBarLegendBottom(windBarData.speedRangePercentages, segmentPositions);

        } else if (this.config.windspeedBarLocation === 'right') {
            this.animationOrigin = this.dimensionCalculator.barStartX(this.positionIndex);
            this.drawBarLegendRight(windBarData.speedRangePercentages, segmentPositions);
        }
        if (this.doAnimation) {
            this.animateBar(true);
        }
    }

    private animateBar(show: boolean) {
        const scale = show ? 1000 : 0.001;
        if (this.config.windspeedBarLocation === 'bottom') {
            this.windBarGroup.animate(300, 0, 'now')
                .scale(1, scale, 0, this.animationOrigin)
                .ease('<');
        } else if (this.config.windspeedBarLocation === 'right') {
            this.windBarGroup.animate(300, 0, 'now')
                .scale(scale, 1, this.animationOrigin, 0)
                .ease('<');
        }
    }

    private drawBarLegendBottom(percentages: number[], segmentPositions: SegmentPosition[]) {
        const y = this.dimensionCalculator.barStartY(this.positionIndex);
        const y2 = y + this.barHeight;
        const labelUnitY = this.dimensionCalculator.barLabelY(this.positionIndex)
        const percLabelY = this.dimensionCalculator.barPercLabelY(this.positionIndex)
        const speedLabelY = this.dimensionCalculator.barSpeedLabelY(this.positionIndex);

        //Bar label
        const barLabel = this.svgUtil.drawText2(segmentPositions[0].start, labelUnitY, this.windSpeedEntityConfig.name,
            TextAttributes.windBarAttribute(this.cardColors.barName, this.barLabelTextSize,
                "auto", "start"));
        this.windBarGroup.add(barLabel);

        segmentPositions.forEach((segmentPosition, index) => {

            //Bar
            const segment = this.svgUtil.drawPathRect(segmentPosition.start, y, segmentPosition.end, y2);
            segment.attr({ fill: this.speedRanges[index].color, stroke: this.config.cardColor.barBorder});
            this.windBarGroup.add(segment);

            //Speed labels
            if (this.windSpeedEntityConfig.speedRangeBeaufort) {
                const label = this.svgUtil.drawText2(segmentPosition.center, speedLabelY, index + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, "hanging", "middle"));
                this.windBarGroup.add(label);
            } else {
                let align = 'middle';
                if (index === 0) {
                    align = 'start';
                }
                const label = this.svgUtil.drawText2(segmentPosition.start, speedLabelY, Math.round(segmentPosition.minSpeed) + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, "hanging", align));
                this.windBarGroup.add(label);
            }

            //Percentages
            if (percentages[index] > 0) {
                let percentageTextColor = this.getPercentageTextColor(this.cardColors.barPercentages, this.speedRanges[index].color);
                const perc = this.svgUtil.drawText2(segmentPosition.center, percLabelY, `${Math.round(percentages[index])}%`, TextAttributes.windBarAttribute(percentageTextColor, this.windSpeedEntityConfig.barPercentageTextSize, "middle", "middle"));
                this.windBarGroup.add(perc);
            }
        });
        //Last label if needed
        const lastSegment = segmentPositions[segmentPositions.length - 1];
        if (!this.windSpeedEntityConfig.speedRangeBeaufort && lastSegment.showLastLabel) {
            const label = this.svgUtil.drawText2(lastSegment.end, speedLabelY, Math.round(lastSegment.maxSpeed) + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, "hanging", "end"));
            this.windBarGroup.add(label);
        }
        //Unit label
        const unitLabel = this.svgUtil.drawText2(lastSegment.end, labelUnitY , this.outputSpeedUnitLabel, TextAttributes.windBarAttribute(this.cardColors.barUnitName, this.barLabelTextSize, "auto", "end"));
        this.windBarGroup.add(unitLabel);

        if (this.doAnimation) {
            this.windBarGroup.scale(1, 0.001, 0, this.animationOrigin);
        }
    }

    private drawBarLegendRight(percentages: number[], segmentPositions: SegmentPosition[]) {
        const x = this.dimensionCalculator.barStartX(this.positionIndex);
        const x2 = x + this.barWidth;
        const labelX = this.dimensionCalculator.barLabelX(this.positionIndex);
        const barCenterX = this.dimensionCalculator.barPercLabelX(this.positionIndex);
        const speedLabelX = this.dimensionCalculator.barSpeedLabelX(this.positionIndex);

        //Bar label
        var barLabel = this.svgUtil.drawText2(labelX, segmentPositions[0].start, this.windSpeedEntityConfig.name, TextAttributes.windBarAttribute(this.cardColors.barName, this.barLabelTextSize, "auto", "left"))
        barLabel.rotate(270, labelX, segmentPositions[0].start);
        this.windBarGroup.add(barLabel);

        segmentPositions.forEach((segmentPosition, index) => {

            //Bar
            const segment = this.svgUtil.drawPathRect(x, segmentPosition.start, x2, segmentPosition.end);
            segment.attr({ fill: this.speedRanges[index].color, stroke: this.config.cardColor.barBorder});
            this.windBarGroup.add(segment);

            //Speed labels
            if (this.windSpeedEntityConfig.speedRangeBeaufort) {
                const label = this.svgUtil.drawText2(speedLabelX, segmentPosition.center, index + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, "middle", "left"));
                this.windBarGroup.add(label);
            } else {
                let baseline = 'middle';
                if (index === 0) {
                    baseline = 'start';
                }
                const label = this.svgUtil.drawText2(speedLabelX, segmentPosition.start, Math.round(segmentPosition.minSpeed) + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, baseline, "left"));
                this.windBarGroup.add(label);
            }

            //Percentages
            if (percentages[index] > 0) {
                let percentage = Math.round(percentages[index]);
                let percFontSize = percentage === 100 ? this.windSpeedEntityConfig.barPercentageTextSize * 0.8 : this.windSpeedEntityConfig.barPercentageTextSize
                let percentageTextColor = this.getPercentageTextColor(this.cardColors.barPercentages, this.speedRanges[index].color);
                const perc = this.svgUtil.drawText2(barCenterX, segmentPosition.center, `${percentage}%`, TextAttributes.windBarAttribute(percentageTextColor, percFontSize, "middle", "middle"));
                this.windBarGroup.add(perc);
            }

        });
        const lastSegment = segmentPositions[segmentPositions.length - 1];
        //Last label if needed
        if (!this.windSpeedEntityConfig.speedRangeBeaufort && lastSegment.showLastLabel) {
            const label = this.svgUtil.drawText2(speedLabelX, lastSegment.end, Math.round(lastSegment.maxSpeed) + '', TextAttributes.windBarAttribute(this.cardColors.barUnitValues, this.barSpeedTextSize, "hanging", "left"))
            this.windBarGroup.add(label);
        }

        //Unit label
        const unitLabel = this.svgUtil.drawText2(barCenterX, lastSegment.end - 15, this.outputSpeedUnitLabel, TextAttributes.windBarAttribute(this.cardColors.barUnitName, this.barLabelTextSize, "auto", "middle"))
        this.windBarGroup.add(unitLabel);

        if (this.doAnimation) {
            this.windBarGroup.scale(0.001, 1, this.animationOrigin, 0);
        }
    }

    private getPercentageTextColor(configColor: string, backgroundColor: string) {
        if (configColor === 'auto') {
             return ColorUtil.getTextColorBasedOnBackground(backgroundColor);
        }
        return configColor;
    }

}
