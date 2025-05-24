import {DrawUtil} from "../util/DrawUtil";
import {SpeedRange} from "../speed-range/SpeedRange";
import {WindRoseData} from "./WindRoseData";
import {TextAttributes} from "./TextAttributes";
import {SvgUtil} from "./SvgUtil";
import {Coordinate} from "./Coordinate";
import {DegreesCalculator} from "./DegreesCalculator";
import SVG, {PathArray, Svg} from "@svgdotjs/svg.js";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CardColors} from "../config/CardColors";
import {SpeedRangeService} from "../speed-range/SpeedRangeService";
import {WindRoseRenderUtil} from "./WindRoseRenderUtil";
import {DimensionCalculator} from "../dimensions/DimensionCalculator";
import {WindRoseRenderer} from "./WindRoseRenderer";
import {Log2} from "../util/Log2";

export class WindRoseRendererStandaard implements WindRoseRenderer {

    private readonly log = new Log2("WindRoseRendererStandaard");
    
    private readonly cardColors: CardColors;
    private readonly legendTextSize: number;
    private speedRanges: SpeedRange[] = [];
    private readonly svg: Svg;
    private readonly dimensionCalculator: DimensionCalculator;
    private readonly windRoseRenderUtil: WindRoseRenderUtil;
    private readonly degreesCalculator: DegreesCalculator;
    private readonly speedRangeService: SpeedRangeService;
    private readonly leaveArc: number;
    svgUtil!: SvgUtil;
    windRoseData!: WindRoseData;
    private readonly roseCenter: Coordinate;

    private backgroundDrawn: boolean;
    private roseDrawn: boolean;
    
    private roseGroup!: SVG.G;
    private leavesGroup!: SVG.G;
    private windDirectionTextGroup!: SVG.G;
    private roseCircles!: SVG.G;
    private circleLegend!: SVG.G;
    private doAnimation: boolean;

    constructor(config: CardConfigWrapper,
                imensionCalculator: DimensionCalculator,
                speedRangeService: SpeedRangeService,
                svg: Svg,
                degreesCalculator: DegreesCalculator) {
        this.cardColors = config.cardColor;
        this.doAnimation = !config.disableAnimations;
        this.legendTextSize = config.circleLegendTextSize;
        this.speedRangeService = speedRangeService;
        this.svg = svg;
        this.degreesCalculator = degreesCalculator;
        this.svgUtil = new SvgUtil(svg);
        this.dimensionCalculator = imensionCalculator;
        this.windRoseRenderUtil = new WindRoseRenderUtil(config, this.dimensionCalculator, this.degreesCalculator, svg);
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
        this.svg.attr({ viewBox: this.dimensionCalculator.viewBox(), preserveAspectRatio: "xMidYMid meet" });
        const cross = this.windRoseRenderUtil.drawBackgroundCross();
        const defaultCircles = this.windRoseRenderUtil.drawInnerOuterCircle(false);
        this.windDirectionTextGroup = this.windRoseRenderUtil.drawWindDirectionText();

        this.roseGroup = this.svg.group()
            .add(cross)
            .add(defaultCircles)
            .add(this.windDirectionTextGroup);
    }

    drawWindRose(windRoseData: WindRoseData): void {
        if (windRoseData === undefined) {
            this.log.error("drawWindRose(): Can't draw, no windrose data set.");
            return;
        }
        if (!this.backgroundDrawn) {
            this.drawEmptyWindrose();
        }
        this.log.method('drawWindRose()', 'windRoseData', windRoseData);
        this.roseDrawn = true;
        this.windRoseData = windRoseData;
        this.speedRanges = this.speedRangeService.getSpeedRanges();

        this.roseCircles = this.windRoseRenderUtil.drawCirlces(windRoseData, false);
        this.leavesGroup = this.drawWindDirections();

        this.roseGroup.add(this.roseCircles).add(this.leavesGroup);

        this.circleLegend = this.drawCircleLegend();

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
            this.log.method('animateRemoveGraphs', 'not rendered yet');
            return false;
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
        this.log.method('removeGraphs()');
        this.leavesGroup.remove();
        this.roseCircles.remove();
        this.circleLegend.remove();
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
        const maxDirectionRadius = (directionPercentage * this.dimensionCalculator.roseRadius) / this.windRoseData.maxCirclePercentage;
        for (let i = this.speedRanges.length - 1; i >= 0; i--) {
            const radius = (maxDirectionRadius * (percentages[i] / 100));
            if (radius > 0) {
                this.log.trace("Degrees: " + (degrees - 90) + " radius: " + radius + " percentage: " + percentages[i]);
                windDirection.add(
                    this.drawSpeedPart(this.svg,
                        degrees - 90,
                        radius,
                        this.speedRanges[i].color));
            }
        }
        return windDirection;
    }

    private drawSpeedPart(svg: Svg, degrees: number, radius: number, color: string): SVG.Path {
        this.log.trace("Degrees 1" + (degrees - (this.leaveArc / 2)));
        this.log.trace("Degrees 2" + (degrees + (this.leaveArc / 2)));
        this.log.trace("Color: " + color);
        var radians1 = DrawUtil.toRadians(degrees - (this.leaveArc / 2));
        var radians2 = DrawUtil.toRadians(degrees + (this.leaveArc / 2));
        var center = this.dimensionCalculator.roseCenter();
        var x1 = center.x + Math.round(Math.cos(radians1) * radius);
        var y1 = center.y + Math.round(Math.sin(radians1) * radius);
        var x2 = center.x + Math.round(Math.cos(radians2) * radius);
        var y2 = center.y + Math.round(Math.sin(radians2) * radius);
        this.log.debug("Coords: ", center.x, center.y, x1, y1, x2, y2, color);

        const path = new PathArray([
            ['M', center.x, center.y],
            ['L', x1, y1],
            ['A', radius, radius, 0, 0, 1, x2, y2],
            ['Z']
        ]);
        return svg.path(path).attr({'fill': color, stroke: this.cardColors.roseLines});
    }

    private drawCircleLegend(): SVG.G {
        const circleLegendGroup = this.svg.group();
        const radiusStep = this.dimensionCalculator.roseRadius / this.windRoseData.circleCount;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;
        const center = this.dimensionCalculator.roseCenter();

        for (let i = 1; i <= this.windRoseData.circleCount; i++) {
            const x = center.x + (xy * i);
            const y = center.y + (xy * i);
            const percentage = (this.windRoseData.percentagePerCircle * i) + "%";
            const text = this.svgUtil.drawText2(x, y, percentage,
                TextAttributes.roseLegendAttribute(this.cardColors.rosePercentages, this.legendTextSize));

            // const length = this.svgUtil.getTextLength((this.windRoseData.percentagePerCircle * i) + "%", this.legendTextSize) + 10;
            // const rect = this.svgUtil.drawRect(new RectCoordinates(x - (length / 2), y - ((this.legendTextSize / 2) * 1.3), length, (this.legendTextSize * 1.1)));
            // rect.radius(15);
            // rect.attr({ "fill": "var(--card-background-color", });

            circleLegendGroup.add(text);
        }
        return circleLegendGroup;
    }
}
