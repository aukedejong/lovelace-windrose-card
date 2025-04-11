import {DrawUtil} from "../util/DrawUtil";
import {SpeedRange} from "../speed-range/SpeedRange";
import {WindRoseData} from "./WindRoseData";
import {SvgUtil} from "./SvgUtil";
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
import {GlobalConfig} from "../config/GlobalConfig";
import {DimensionCalculator} from "../dimensions/DimensionCalculator";
import {WindRoseRenderer} from "./WindRoseRenderer";
import {Log2} from "../util/Log2";

export class WindRoseRendererCenterCalm implements WindRoseRenderer {

    private readonly log = new Log2("WindRoseRendererCenterCalm");
    
    private readonly cardColors: CardColors;
    private speedRanges: SpeedRange[] = [];
    private readonly svg: Svg;

    private readonly dimensionCalculator: DimensionCalculator;
    private readonly windRoseRenderUtil: WindRoseRenderUtil;
    private readonly degreesCalculator: DegreesCalculator;
    private readonly speedRangeService: SpeedRangeService;
    private readonly leaveArc: number;
    private readonly centerRadius: number;
    svgUtil!: SvgUtil;
    windRoseData!: WindRoseData;
    private readonly roseCenter: Coordinate;

    private backgroundDrawn: boolean;
    private roseDrawn: boolean;

    private roseGroup!: SVG.G;
    private windDirectionTextGroup!: SVG.G;
    private leavesGroup!: SVG.G;
    private roseCircles!: SVG.G;
    private circleLegend!: SVG.G;
    private centerZeroSpeedGroup!: SVG.G;
    private doAnimation: boolean;

    constructor(config: CardConfigWrapper,
                dimensionCalculator: DimensionCalculator,
                speedRangeService: SpeedRangeService,
                svg: Svg,
                degreesCalculator: DegreesCalculator) {
        this.cardColors = config.cardColor;
        this.doAnimation = !config.disableAnimations;
        this.centerRadius = GlobalConfig.defaultCenterCalmPercenteCircleSize;
        this.speedRangeService = speedRangeService;
        this.svg = svg;
        this.svgUtil = new SvgUtil(svg);
        this.dimensionCalculator = dimensionCalculator;
        this.windRoseRenderUtil = new WindRoseRenderUtil(config, this.dimensionCalculator, degreesCalculator, svg);
        this.degreesCalculator = degreesCalculator;
        this.roseCenter = this.dimensionCalculator.roseCenter();
        this.leaveArc = this.windRoseRenderUtil.calcLeaveArc(config.windDirectionCount);
        this.backgroundDrawn = false;
        this.roseDrawn = false;
    }

    drawEmptyWindrose() {
        if (this.backgroundDrawn) {
            this.log.method('drawEmptyWindrose',  'Already done');
            return;
        }
        this.log.method('drawEmptyWindrose');
        this.backgroundDrawn = true;
        this.svg.attr({ viewBox: this.dimensionCalculator.viewBox(), preserveAspectRatio: "xMidYMid meet" })
        const cross = this.windRoseRenderUtil.drawBackgroundCross();
        const defaultCircles = this.windRoseRenderUtil.drawInnerOuterCircle(true);
        this.windDirectionTextGroup = this.windRoseRenderUtil.drawWindDirectionText();

        this.roseGroup = this.svg.group()
            .add(cross)
            .add(defaultCircles)
            .add(this.windDirectionTextGroup);
    }

    drawWindRose(windRoseData: WindRoseData): void {
        if (windRoseData === undefined) {
            this.log.error('drawWindRose()', 'Can\'t draw, no windrose data.');
            return;
        }
        this.log.method('drawWindRose', 'windRoseData', windRoseData);
        this.roseDrawn = true;
        this.windRoseData = windRoseData;
        this.speedRanges = this.speedRangeService.getSpeedRanges();

        this.roseCircles = this.windRoseRenderUtil.drawCirlces(windRoseData, true);
        this.leavesGroup = this.drawWindDirections();

        this.roseGroup.add(this.leavesGroup).add(this.roseCircles);

        this.circleLegend = this.drawCircleLegend();
        this.centerZeroSpeedGroup = this.drawCenterZeroSpeed();

        //Animate show graph
        if (this.doAnimation) {
            this.leavesGroup.scale(0.1, 0.1, this.roseCenter.x, this.roseCenter.y);
            this.leavesGroup.animate(300, 0, 'now')
                .scale(10, 10, this.roseCenter.x, this.roseCenter.y)
                .ease('<');
        }
    }

    animateRemoveGraphs(): boolean {
        if (this.leavesGroup === undefined || !this.doAnimation) {
            this.log.method('animateRemoveGraphs', 'not rendered yet or anmiation disabled');
            return false
        }
        this.log.method('animateRemoveGraphs');
        this.leavesGroup.animate(300, 0, 'now')
            .scale(0.1, 0.1, this.roseCenter.x, this.roseCenter.y)
            .ease('<');
        return true;
    }

    removeGraphs(): void {
        if (!this.roseDrawn) {
            this.log.method('removeGraphs', 'not drawn yet');
            return;
        }
        this.log.method('removeGraphs');
        this.leavesGroup.remove();
        this.roseCircles.remove();
        this.circleLegend.remove();
        this.centerZeroSpeedGroup.remove();
        this.roseDrawn = false;
    }

    rotateWindRose() {
        if (this.roseGroup === undefined) {
            this.log.method('rotateWindRose', 'not rendered yet');
            return;
        }
        this.log.method('rotateWindRose');
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
        const maxDirectionRadius = (directionPercentage * (this.dimensionCalculator.roseRadius - this.centerRadius)) / this.windRoseData.maxCirclePercentage;
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
        const radiusStep = (this.dimensionCalculator.roseRadius - this.centerRadius) / this.windRoseData.circleCount;
        const centerXY = Math.cos(DrawUtil.toRadians(45)) * this.centerRadius;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;

        for (let i = 1; i <= this.windRoseData.circleCount; i++) {
            const text = this.svgUtil.drawText2(
                centerXY + (xy * i) + center.x,
                centerXY + (xy * i) + center.y,
                (this.windRoseData.percentagePerCircle * i) + "%",
                TextAttributes.roseLegendAttribute(this.cardColors.rosePercentages));
            circleLegendGroup.add(text);
        }
        return circleLegendGroup;
    }

    private drawCenterZeroSpeed(): SVG.G {
        const center = this.dimensionCalculator.roseCenter();

        const centerZeroSpeedGroup = this.svg.group();
        const centerCircle = this.svgUtil.drawCircle(new CircleCoordinate((center),
            this.centerRadius));
        centerCircle.attr({
            fill: this.speedRanges[0].color
        });
        centerZeroSpeedGroup.add(centerCircle);

        let textColor = this.cardColors.roseCenterPercentage;
        if (textColor === 'auto') {
             textColor = ColorUtil.getTextColorBasedOnBackground(this.speedRanges[0].color);
        }
        if (!isNaN(this.windRoseData.speedRangePercentages[0])) {
            const centerText = this.svgUtil.drawText2(center.x, center.y, Math.round(this.windRoseData.speedRangePercentages[0]) + '%',
                TextAttributes.windBarAttribute(textColor, 40, "middle", "middle"));
            centerZeroSpeedGroup.add(centerText);
        }
        return centerZeroSpeedGroup;
    }

}
