import {WindRoseConfig} from "../config/WindRoseConfig";
import {DrawUtil} from "../util/DrawUtil";
import {SpeedRange} from "../converter/SpeedRange";
import {WindRoseData} from "./WindRoseData";
import {Log} from "../util/Log";
import Snap from "snapsvg";
import {TextAttributes} from "./TextAttributes";
import {SvgUtil} from "./SvgUtil";
import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {Coordinate} from "./Coordinate";
import {DimensionConfig} from "./DimensionConfig";

export class WindRoseRendererStandaard {
    private config: WindRoseConfig;
    private readonly speedRanges: SpeedRange[];
    private readonly dimensionCalculator: WindRoseDimensionCalculator;
    svgUtil!: SvgUtil;
    windRoseData!: WindRoseData;

    constructor(config: WindRoseConfig, dimensionConfig: DimensionConfig, speedRanges: SpeedRange[]) {
        this.config = config;
        this.speedRanges = speedRanges;
        this.dimensionCalculator = new WindRoseDimensionCalculator(dimensionConfig);
    }

    drawWindRose(windRoseData: WindRoseData, svg: Snap.Paper): void {
        if (windRoseData === undefined) {
            Log.error("drawWindRose(): Can't draw, no windrose data set.");
            return;
        }
        Log.trace('drawWindRose()', windRoseData);
        this.svgUtil = new SvgUtil(svg);

        svg.attr({ viewBox: this.dimensionCalculator.viewBox(), preserveAspectRatio: "xMidYMid meet" })

        this.windRoseData = windRoseData;

        const backgroundLines = this.drawBackgroundLines(svg);
        const windDirectionText = this.drawWindDirectionText(svg);
        const windDirections = this.drawWindDirections(svg);

        // Rotate
        if (this.config.windRoseDrawNorthOffset != 0) {
            const rotateGroup = svg.group(windDirectionText, windDirections, backgroundLines);
            var center = this.dimensionCalculator.roseCenter();
            rotateGroup.transform("r" + this.config.windRoseDrawNorthOffset + "," + center.x + "," + center.y);
        }

        const circleLegend = this.drawCircleLegend(svg);
    }

    private drawWindDirections(svg: Snap.Paper): Snap.Paper {
        const windDirections = svg.group();
        for (let i = 0; i < this.windRoseData.directionPercentages.length; i++) {
            windDirections.add(
                this.drawWindDirection(this.windRoseData.directionSpeedRangePercentages[i],
                    this.windRoseData.directionPercentages[i],
                    this.windRoseData.directionDegrees[i], svg));
        }
        return windDirections;
    }

    private drawWindDirection(speedRangePercentages: number[], directionPercentage: number, degrees: number,
                              svg: Snap.Paper): Snap.Paper {
        const windDirection = svg.group();
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
        const maxDirectionRadius = (directionPercentage * this.dimensionCalculator.cfg.roseRadius) / this.windRoseData.maxCirclePercentage;
        for (let i = this.speedRanges.length - 1; i >= 0; i--) {
            const radius = (maxDirectionRadius * (percentages[i] / 100));
            if (radius > 0) {
                Log.trace("Degrees: " + (degrees - 90) + " radius: " + radius + " percentage: " + percentages[i]);
                windDirection.add(
                    this.drawSpeedPart(svg,
                        degrees - 90,
                        radius,
                        this.speedRanges[i].color));
            }
        }
        return windDirection;
    }

    private drawSpeedPart(svg: Snap.Paper, degrees: number, radius: number, color: string): Snap.Element {
        Log.trace("Degrees 1" + (degrees - (this.config.leaveArc / 2)));
        Log.trace("Degrees 2" + (degrees + (this.config.leaveArc / 2)));
        Log.trace("Color: " + color);
        var radians1 = DrawUtil.toRadians(degrees - (this.config.leaveArc / 2));
        var radians2 = DrawUtil.toRadians(degrees + (this.config.leaveArc / 2));
        var center = this.dimensionCalculator.roseCenter();
        var x1 = center.x + Math.round(Math.cos(radians1) * radius);
        var y1 = center.y + Math.round(Math.sin(radians1) * radius);
        var x2 = center.x + Math.round(Math.cos(radians2) * radius);
        var y2 = center.y + Math.round(Math.sin(radians2) * radius);
        Log.trace("Coords: ", center.x, center.y, x1, y1, x2, y2, color);
        return svg.path(Snap.format('M {centerX} {centerY} L {x1} {y1} A{radius} {radius} 0 0 1 {x2} {y2} Z ', {
            centerX: center.x,
            centerY: center.y,
            x1, y1, x2, y2, radius
        })).attr({'fill': color, stroke: this.config.roseLinesColor})
    }

    private drawBackgroundLines(svg: Snap.Paper): Snap.Paper {
        // Cross
        var lineHorizontal = this.svgUtil.drawLine(this.dimensionCalculator.crossHorizontalLine());
        var lineVertical = this.svgUtil.drawLine(this.dimensionCalculator.crossVerticalLine());
        var roseLinesGroup = svg.group(lineHorizontal, lineVertical);

        // Circles
        const circleCount = this.windRoseData.circleCount;
        const radiusStep = this.dimensionCalculator.cfg.roseRadius / circleCount;
        for (let i = 1; i <= circleCount; i++) {
            roseLinesGroup.add(this.svgUtil.drawCircle(this.dimensionCalculator.roseCircle(radiusStep * i)));
        }
        roseLinesGroup.attr({
            stroke: this.config.roseLinesColor,
            strokeWidth: 1,
            fill: "none",
        });
        return roseLinesGroup;
    }

    private drawWindDirectionText(svg: Snap.Paper): Snap.Paper {
        // Wind direction text
        this.config.cardinalDirectionLetters
        const northText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.north(),
            this.config.cardinalDirectionLetters[0],
            -this.config.windRoseDrawNorthOffset,
            this.config.roseDirectionLettersColor);
        const eastText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.east(),
            this.config.cardinalDirectionLetters[1],
            -this.config.windRoseDrawNorthOffset,
            this.config.roseDirectionLettersColor);
        const southText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.south(),
            this.config.cardinalDirectionLetters[2],
            -this.config.windRoseDrawNorthOffset,
            this.config.roseDirectionLettersColor);
        const westText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.west(),
            this.config.cardinalDirectionLetters[3],
            -this.config.windRoseDrawNorthOffset,
            this.config.roseDirectionLettersColor);

        return svg.group(northText, eastText, southText, westText);
    }

    private drawCircleLegend(svg: Snap.Paper): Snap.Paper {
        const circleLegendGroup = svg.group();
        const radiusStep = this.dimensionCalculator.cfg.roseRadius / this.windRoseData.circleCount;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;
        const center = this.dimensionCalculator.roseCenter();

        for (let i = 1; i <= this.windRoseData.circleCount; i++) {
            const coordinate = new Coordinate(center.x + (xy * i), center.y + (xy * i));
            const text = this.svgUtil.drawText(coordinate,
                (this.windRoseData.percentagePerCircle * i) + "%",
                TextAttributes.roseLegendAttribute(this.config.rosePercentagesColor));
            circleLegendGroup.add(text);
        }
        return circleLegendGroup;
    }

}
