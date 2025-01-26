import {DrawUtil} from "../util/DrawUtil";
import {SpeedRange} from "../speed-range/SpeedRange";
import {WindRoseData} from "./WindRoseData";
import {Log} from "../util/Log";
import {SvgUtil} from "./SvgUtil";
import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {DimensionConfig} from "./DimensionConfig";
import {TextAttributes} from "./TextAttributes";
import {CircleCoordinate} from "./CircleCoordinate";
import {Coordinate} from "./Coordinate";
import {ColorUtil} from "../util/ColorUtil";
import {DegreesCalculator} from "./DegreesCalculator";
import SVG, {Svg} from "@svgdotjs/svg.js";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CardColors} from "../config/CardColors";
import {SpeedRangeService} from "../speed-range/SpeedRangeService";
import {WindRoseRenderUtil} from "./WindRoseRenderUtil";

export class WindRoseRendererCenterCalm {
    private readonly cardColors: CardColors;
    private speedRanges: SpeedRange[] = [];
    private readonly svg: Svg;

    private readonly dimensionCalculator: WindRoseDimensionCalculator;
    private readonly windRoseRenderUtil: WindRoseRenderUtil;
    private readonly degreesCalculator: DegreesCalculator;
    private readonly speedRangeService: SpeedRangeService;
    private readonly leaveArc: number;
    private readonly centerRadius: number;
    svgUtil!: SvgUtil;
    windRoseData!: WindRoseData;
    private readonly roseCenter: Coordinate;
    private roseGroup!: SVG.G;
    private windDirectionTextGroup!: SVG.G;

    constructor(config: CardConfigWrapper,
                dimensionConfig: DimensionConfig,
                speedRangeService: SpeedRangeService,
                svg: Svg,
                degreesCalculator: DegreesCalculator) {
        this.cardColors = config.cardColor;
        this.centerRadius = 60;
        this.speedRangeService = speedRangeService;
        this.svg = svg;
        this.svgUtil = new SvgUtil(svg);
        this.dimensionCalculator = new WindRoseDimensionCalculator(dimensionConfig);
        this.windRoseRenderUtil = new WindRoseRenderUtil(config, this.dimensionCalculator, degreesCalculator, svg);
        this.degreesCalculator = degreesCalculator;
        this.roseCenter = this.dimensionCalculator.roseCenter();
        this.leaveArc = (360 / config.windDirectionCount) - 8;
    }

    drawWindRose(windRoseData: WindRoseData): void {
        if (windRoseData === undefined) {
            Log.error("drawWindRose(): Can't draw, no windrose data.");
            return;
        }
        Log.trace('drawWindRose()', windRoseData);

        this.svg.attr({ viewBox: this.dimensionCalculator.viewBox(), preserveAspectRatio: "xMidYMid meet" })

        this.windRoseData = windRoseData;
        this.speedRanges = this.speedRangeService.getSpeedRanges();

        const background = this.windRoseRenderUtil.drawBackground(windRoseData, true);
        this.windDirectionTextGroup = this.windRoseRenderUtil.drawWindDirectionText();
        const windDirections = this.drawWindDirections();

        //Rotate
        this.roseGroup = this.svg.group()
            .add(background)
            .add(this.windDirectionTextGroup)
            .add(windDirections);
        this.roseGroup.rotate(this.degreesCalculator.getRoseRenderDegrees(), this.roseCenter.x, this.roseCenter.y);

        const circleLegend = this.drawCircleLegend();
        this.drawCenterZeroSpeed();
    }

    rotateWindRose() {
        if (this.roseGroup === undefined) {
            return;
        }
        const deg = this.degreesCalculator.getRoseRenderDegrees();

        this.roseGroup.animate(700, 0, 'now')
            .transform({ rotate: deg, originX: this.roseCenter.x, originY: this.roseCenter.y})
            .ease('<>');
        for (const label of this.windDirectionTextGroup.children()) {
                label.animate(700, 0, 'now')
                    .transform({ rotate: -deg, originX: label.cx(), originY: label.cy()})
                    .ease('<>');
        }
    }

    private drawWindDirections(): SVG.G {
        const windDirections = this.svg.group();
        for (let i = 0; i < this.windRoseData.directionPercentages.length; i++) {
            windDirections.add(
                this.drawWindDirection(this.windRoseData.directionSpeedRangePercentages[i],
                    this.windRoseData.directionPercentages[i],
                    this.windRoseData.directionDegrees[i]));
        }
        return windDirections;
    }

    private drawWindDirection(speedRangePercentages: number[], directionPercentage: number, degrees: number): SVG.G {
        const windDirection = this.svg.group();
        if (directionPercentage === 0) {
            return windDirection;
        }

        const percentages = Array(speedRangePercentages.length).fill(0);
        for (let i = speedRangePercentages.length - 1; i >= 0; i--) {
            percentages[i] = speedRangePercentages[i];
            if (speedRangePercentages[i] > 0) {
                for (let x = i - 1; x >= 0; x--) {
                    percentages[i] += speedRangePercentages[x];
                }
            }
        }
        const maxDirectionRadius = (directionPercentage * (this.dimensionCalculator.cfg.roseRadius - this.centerRadius)) / this.windRoseData.maxCirclePercentage;
        for (let i = this.speedRanges.length - 1; i >= 0; i--) {
            const sppedPart = this.drawSpeedPart(this.svg,
                degrees - 90,
                (maxDirectionRadius * (percentages[i] / 100)) + this.centerRadius,
                this.speedRanges[i].color);
            windDirection.add(sppedPart);
        }
        return windDirection;
    }

    private drawSpeedPart(svg: Svg, degrees: number, radius: number, color: string): SVG.Path {

        var radians1 = DrawUtil.toRadians(degrees - (this.leaveArc / 2));
        var radians2 = DrawUtil.toRadians(degrees + (this.leaveArc / 2));
        var center = this.dimensionCalculator.roseCenter();
        var x1 = center.x + Math.round(Math.cos(radians1) * radius);
        var y1 = center.y + Math.round(Math.sin(radians1) * radius);
        var x2 = center.x + Math.round(Math.cos(radians2) * radius);
        var y2 = center.y + Math.round(Math.sin(radians2) * radius);

        return svg.path(`M ${center.x} ${center.y} L ${x1} ${y1} A${radius} ${radius} 0 0 1 ${x2} ${y2} Z`)
            .attr({'fill': color, stroke: this.cardColors.roseLines});
    }

    private drawCircleLegend(): SVG.G {
        const circleLegendGroup = this.svg.group();
        const center = this.dimensionCalculator.roseCenter();
        const radiusStep = (this.dimensionCalculator.cfg.roseRadius - this.centerRadius) / this.windRoseData.circleCount;
        const centerXY = Math.cos(DrawUtil.toRadians(45)) * this.centerRadius;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;

        for (let i = 1; i <= this.windRoseData.circleCount; i++) {
            const xPos = centerXY + (xy * i) + center.x;
            const yPos = centerXY + (xy * i) + center.y;
            const text = this.svgUtil.drawText(new Coordinate(xPos, yPos),
                (this.windRoseData.percentagePerCircle * i) + "%",
                TextAttributes.roseLegendAttribute(this.cardColors.rosePercentages));
            circleLegendGroup.add(text);
        }
        return circleLegendGroup;
    }

    private drawCenterZeroSpeed(): void {
        const center = this.dimensionCalculator.roseCenter();
        const centerCircle = this.svgUtil.drawCircle(new CircleCoordinate((center),
            this.centerRadius));
        centerCircle.attr({
            fill: this.speedRanges[0].color
        });

        let textColor = this.cardColors.roseCenterPercentage;
        if (textColor === 'auto') {
             textColor = ColorUtil.getTextColorBasedOnBackground(this.speedRanges[0].color);
        }
        if (!isNaN(this.windRoseData.speedRangePercentages[0])) {
            this.svgUtil.drawText(center, Math.round(this.windRoseData.speedRangePercentages[0]) + '%',
                TextAttributes.windBarAttribute(textColor, 40, "middle", "middle"));
        }
    }

}
