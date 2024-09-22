import {WindRoseConfig} from "../config/WindRoseConfig";
import {DrawUtil} from "../util/DrawUtil";
import {SpeedRange} from "../converter/SpeedRange";
import {WindRoseData} from "./WindRoseData";
import {Log} from "../util/Log";
import Snap from "snapsvg";
import {SvgUtil} from "./SvgUtil";
import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {DimensionConfig} from "./DimensionConfig";
import {TextAttributes} from "./TextAttributes";
import {CircleCoordinate} from "./CircleCoordinate";
import {Coordinate} from "./Coordinate";
import {ColorUtil} from "../util/ColorUtil";
import {DegreesCalculator} from "./DegreesCalculator";

export class WindRoseRendererCenterCalm {
    private readonly config: WindRoseConfig;
    private readonly speedRanges: SpeedRange[];
    private readonly svg: Snap.Paper;

    private readonly dimensionCalculator: WindRoseDimensionCalculator;
    private readonly degreesCalculator: DegreesCalculator;
    svgUtil!: SvgUtil;
    windRoseData!: WindRoseData;
    private readonly roseCenter: Coordinate;
    private roseGroup!: Snap.Paper;
    private northText!: Snap.Element;
    private eastText!: Snap.Element;
    private southText!: Snap.Element;
    private westText!: Snap.Element;

    constructor(config: WindRoseConfig,
                dimensionConfig: DimensionConfig,
                speedRanges: SpeedRange[],
                svg: Snap.Paper,
                degreesCalculator: DegreesCalculator) {
        this.config = config;
        this.speedRanges = speedRanges;
        this.svg = svg;
        this.svgUtil = new SvgUtil(svg);
        this.dimensionCalculator = new WindRoseDimensionCalculator(dimensionConfig);
        this.degreesCalculator = degreesCalculator;
        this.roseCenter = this.dimensionCalculator.roseCenter();
    }

    drawWindRose(windRoseData: WindRoseData): void {
        if (windRoseData === undefined) {
            Log.error("drawWindRose(): Can't draw, no windrose data.");
            return;
        }
        Log.trace('drawWindRose()', windRoseData);

        this.svg.attr({ viewBox: this.dimensionCalculator.viewBox(), preserveAspectRatio: "xMidYMid meet" })

        this.windRoseData = windRoseData;

        const windDirectionText = this.drawWindDirectionText();
        const windDirections = this.drawWindDirections();
        const background = this.drawBackground();

        //Rotate
        this.roseGroup = this.svg.group(windDirectionText, windDirections, background);
        this.roseGroup.transform("r" +this.degreesCalculator.getRoseRenderDegrees() + "," + this.roseCenter.x + "," + this.roseCenter.y);

        const circleLegend = this.drawCircleLegend();
        const centerZeroSpeed = this.drawCenterZeroSpeed();
    }

    private drawWindDirections(): Snap.Paper {
        const windDirections = this.svg.group();
        for (let i = 0; i < this.windRoseData.directionPercentages.length; i++) {
            windDirections.add(
                this.drawWindDirection(this.windRoseData.directionSpeedRangePercentages[i],
                    this.windRoseData.directionPercentages[i],
                    this.windRoseData.directionDegrees[i]));
        }
        return windDirections;
    }

    private drawWindDirection(speedRangePercentages: number[], directionPercentage: number, degrees: number): Snap.Paper {
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
        const maxDirectionRadius = (directionPercentage * (this.dimensionCalculator.cfg.roseRadius - this.config.centerRadius)) / this.windRoseData.maxCirclePercentage;
        for (let i = this.speedRanges.length - 1; i >= 0; i--) {
            const sppedPart = this.drawSpeedPart(this.svg,
                degrees - 90,
                (maxDirectionRadius * (percentages[i] / 100)) + this.config.centerRadius,
                this.speedRanges[i].color);
            windDirection.add(sppedPart);
        }
        return windDirection;
    }

    private drawSpeedPart(svg: Snap.Paper, degrees: number, radius: number, color: string): Snap.Element {

        var radians1 = DrawUtil.toRadians(degrees - (this.config.leaveArc / 2));
        var radians2 = DrawUtil.toRadians(degrees + (this.config.leaveArc / 2));
        var center = this.dimensionCalculator.roseCenter();
        var x1 = center.x + Math.round(Math.cos(radians1) * radius);
        var y1 = center.y + Math.round(Math.sin(radians1) * radius);
        var x2 = center.x + Math.round(Math.cos(radians2) * radius);
        var y2 = center.y + Math.round(Math.sin(radians2) * radius);

        return svg.path(Snap.format('M {centerX} {centerY} L {x1} {y1} A{radius} {radius} 0 0 1 {x2} {y2} Z ', {
            centerX: center.x,
            centerY: center.y,
            x1, y1, x2, y2, radius
        })).attr({'fill': color, stroke: this.config.roseLinesColor});
    }

    private drawBackground(): Snap.Paper {
        // Cross
        var lineHorizontal = this.svgUtil.drawLine(this.dimensionCalculator.crossHorizontalLine());
        var lineVertical = this.svgUtil.drawLine(this.dimensionCalculator.crossVerticalLine());
        var roseLinesGroup = this.svg.group(lineHorizontal, lineVertical);

        // Circles
        const circleCount = this.windRoseData.circleCount;
        const radiusStep = (this.dimensionCalculator.cfg.roseRadius - this.config.centerRadius) / circleCount;
        let circleRadius = this.config.centerRadius + radiusStep;
        for (let i = 1; i <= circleCount; i++) {
            roseLinesGroup.add(this.svgUtil.drawCircle(this.dimensionCalculator.roseCircle(circleRadius)));
            circleRadius += radiusStep;
        }
        roseLinesGroup.attr({
            stroke: this.config.roseLinesColor,
            strokeWidth: 1,
            fill: "none",
        });
        return roseLinesGroup;
    }

    private drawWindDirectionText(): Snap.Paper {
        // Wind direction text
        const roseRenderDegrees = this.degreesCalculator.getRoseRenderDegrees();
        this.config.cardinalDirectionLetters
        this.northText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.north(),
            this.config.cardinalDirectionLetters[0],
            -roseRenderDegrees,
            this.config.roseDirectionLettersColor);
        this.eastText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.east(),
            this.config.cardinalDirectionLetters[1],
            -roseRenderDegrees,
            this.config.roseDirectionLettersColor);
        this.southText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.south(),
            this.config.cardinalDirectionLetters[2],
            -roseRenderDegrees,
            this.config.roseDirectionLettersColor);
        this.westText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.west(),
            this.config.cardinalDirectionLetters[3],
            -roseRenderDegrees,
            this.config.roseDirectionLettersColor);

        return this.svg.group(this.northText, this.eastText, this.southText, this.westText);
    }

    private drawCircleLegend(): Snap.Paper {
        const circleLegendGroup = this.svg.group();
        const center = this.dimensionCalculator.roseCenter();
        const radiusStep = (this.dimensionCalculator.cfg.roseRadius - this.config.centerRadius) / this.windRoseData.circleCount;
        const centerXY = Math.cos(DrawUtil.toRadians(45)) * this.config.centerRadius;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;

        for (let i = 1; i <= this.windRoseData.circleCount; i++) {
            const xPos = centerXY + (xy * i) + center.x;
            const yPos = centerXY + (xy * i) + center.y;
            const text = this.svgUtil.drawText(new Coordinate(xPos, yPos),
                (this.windRoseData.percentagePerCircle * i) + "%",
                TextAttributes.roseLegendAttribute(this.config.rosePercentagesColor));
            circleLegendGroup.add(text);
        }
        return circleLegendGroup;
    }

    private drawCenterZeroSpeed(): Snap.Paper {
        const center = this.dimensionCalculator.roseCenter();
        const centerCircle = this.svgUtil.drawCircle(new CircleCoordinate((center),
            this.config.centerRadius));
        centerCircle.attr({
            fill: this.speedRanges[0].color
        });

        let textColor = this.config.roseCenterPercentageColor;
        if (this.config.roseCenterPercentageColor === 'auto') {
             textColor = ColorUtil.getTextColorBasedOnBackground(this.speedRanges[0].color);
        }
        const centerPercentage = this.svgUtil.drawText(center, Math.round(this.windRoseData.speedRangePercentages[0]) + '%',
            TextAttributes.windBarAttribute(textColor, 40, "middle", "middle"));

        return this.svg.group(centerCircle, centerPercentage);
    }

}
