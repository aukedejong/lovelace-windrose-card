import {DrawUtil} from "../util/DrawUtil";
import {SpeedRange} from "../speed-range/SpeedRange";
import {WindRoseData} from "./WindRoseData";
import {Log} from "../util/Log";
import {TextAttributes} from "./TextAttributes";
import {SvgUtil} from "./SvgUtil";
import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {Coordinate} from "./Coordinate";
import {DimensionConfig} from "./DimensionConfig";
import {DegreesCalculator} from "./DegreesCalculator";
import SVG, {PathArray, Svg} from "@svgdotjs/svg.js";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CardColors} from "../config/CardColors";
import {SpeedRangeService} from "../speed-range/SpeedRangeService";

export class WindRoseRendererStandaard {
    private readonly cardColors: CardColors;
    private speedRanges: SpeedRange[] = [];
    private readonly svg: Svg;
    private readonly dimensionCalculator: WindRoseDimensionCalculator;
    private readonly degreesCalculator: DegreesCalculator;
    private readonly speedRangeService: SpeedRangeService;
    private readonly leaveArc: number;
    private readonly cardinalDirectionLetters: string[];
    svgUtil!: SvgUtil;
    windRoseData!: WindRoseData;
    private readonly roseCenter: Coordinate;
    private roseGroup!: SVG.G;
    private northText!: SVG.Text;
    private eastText!: SVG.Text;
    private southText!: SVG.Text;
    private westText!: SVG.Text;

    constructor(config: CardConfigWrapper,
                dimensionConfig: DimensionConfig,
                speedRangeService: SpeedRangeService,
                svg: Svg,
                degreesCalculator: DegreesCalculator) {
        this.cardColors = config.cardColor;
        this.cardinalDirectionLetters = config.cardinalDirectionLetters;
        this.speedRangeService = speedRangeService;
        this.svg = svg;
        this.degreesCalculator = degreesCalculator;
        this.svgUtil = new SvgUtil(svg);
        this.dimensionCalculator = new WindRoseDimensionCalculator(dimensionConfig);
        this.roseCenter = this.dimensionCalculator.roseCenter();
        this.leaveArc = (360 / config.windDirectionCount) - 8;
    }

    drawWindRose(windRoseData: WindRoseData): void {
        if (windRoseData === undefined) {
            Log.error("drawWindRose(): Can't draw, no windrose data set.");
            return;
        }
        Log.trace('drawWindRose()', windRoseData);

        this.svg.attr({ viewBox: this.dimensionCalculator.viewBox(), preserveAspectRatio: "xMidYMid meet" })

        this.windRoseData = windRoseData;
        this.speedRanges = this.speedRangeService.getSpeedRanges();

        const backgroundLines = this.drawBackgroundLines();
        const windDirectionText = this.drawWindDirectionText();
        const windDirections = this.drawWindDirections();

        // Rotate
        this.roseGroup = this.svg.group().add(backgroundLines).add(windDirectionText).add(windDirections);
        this.roseGroup.rotate(this.degreesCalculator.getRoseRenderDegrees(), this.roseCenter.x, this.roseCenter.y);

        const circleLegend = this.drawCircleLegend();
    }

    rotateWindRose() {
        if (this.roseGroup === undefined) {
            return;
        }
        const deg = this.degreesCalculator.getRoseRenderDegrees();

        this.roseGroup.animate(700, 0, 'now')
            .transform({ rotate: deg, originX: this.roseCenter.x, originY: this.roseCenter.y})
            .ease('<>');
        this.northText.animate(700, 0, 'now')
            .transform({ rotate: -deg, originX: this.dimensionCalculator.north().x, originY: this.dimensionCalculator.north().y})
            .ease('<>');
        this.eastText.animate(700, 0, 'now')
            .transform({ rotate: -deg, originX: this.dimensionCalculator.east().x, originY: this.dimensionCalculator.east().y})
            .ease('<>');
        this.southText.animate(700, 0, 'now')
            .transform({ rotate: -deg, originX: this.dimensionCalculator.south().x, originY: this.dimensionCalculator.south().y})
            .ease('<>');
        this.westText.animate(700, 0, 'now')
            .transform({ rotate: -deg, originX: this.dimensionCalculator.west().x, originY: this.dimensionCalculator.west().y})
            .ease('<>');
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
        const maxDirectionRadius = (directionPercentage * this.dimensionCalculator.cfg.roseRadius) / this.windRoseData.maxCirclePercentage;
        for (let i = this.speedRanges.length - 1; i >= 0; i--) {
            const radius = (maxDirectionRadius * (percentages[i] / 100));
            if (radius > 0) {
                Log.trace("Degrees: " + (degrees - 90) + " radius: " + radius + " percentage: " + percentages[i]);
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
        Log.trace("Degrees 1" + (degrees - (this.leaveArc / 2)));
        Log.trace("Degrees 2" + (degrees + (this.leaveArc / 2)));
        Log.trace("Color: " + color);
        var radians1 = DrawUtil.toRadians(degrees - (this.leaveArc / 2));
        var radians2 = DrawUtil.toRadians(degrees + (this.leaveArc / 2));
        var center = this.dimensionCalculator.roseCenter();
        var x1 = center.x + Math.round(Math.cos(radians1) * radius);
        var y1 = center.y + Math.round(Math.sin(radians1) * radius);
        var x2 = center.x + Math.round(Math.cos(radians2) * radius);
        var y2 = center.y + Math.round(Math.sin(radians2) * radius);
        Log.debug("Coords: ", center.x, center.y, x1, y1, x2, y2, color);

        const path = new PathArray([
            ['M', center.x, center.y],
            ['L', x1, y1],
            ['A', radius, radius, 0, 0, 1, x2, y2],
            ['Z']
        ]);
        return svg.path(path).attr({'fill': color, stroke: this.cardColors.roseLines});
    }

    private drawBackgroundLines(): SVG.G {
        // Cross
        var lineHorizontal = this.svgUtil.drawLine(this.dimensionCalculator.crossHorizontalLine());
        var lineVertical = this.svgUtil.drawLine(this.dimensionCalculator.crossVerticalLine());
        var roseLinesGroup = this.svg.group().add(lineHorizontal).add(lineVertical);

        // Circles
        const circleCount = this.windRoseData.circleCount;
        const radiusStep = this.dimensionCalculator.cfg.roseRadius / circleCount;
        for (let i = 1; i <= circleCount; i++) {
            roseLinesGroup.add(this.svgUtil.drawCircle(this.dimensionCalculator.roseCircle(radiusStep * i)));
        }
        roseLinesGroup.attr({
            stroke: this.cardColors.roseLines,
            strokeWidth: 1,
            fill: "none",
        });
        return roseLinesGroup;
    }

    private drawWindDirectionText(): SVG.G {
        // Wind direction text
        const roseRenderDegrees = this.degreesCalculator.getRoseRenderDegrees();

        this.northText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.north(),
            this.cardinalDirectionLetters[0],
            -roseRenderDegrees,
            this.cardColors.roseDirectionLetters,
            "middle",
            "central"
            );
        this.eastText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.east(),
            this.cardinalDirectionLetters[1],
            -roseRenderDegrees,
            this.cardColors.roseDirectionLetters,
            "middle",
            "central");
        this.southText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.south(),
            this.cardinalDirectionLetters[2],
            -roseRenderDegrees,
            this.cardColors.roseDirectionLetters,
            "middle",
            "central");
        this.westText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.west(),
            this.cardinalDirectionLetters[3],
            -roseRenderDegrees,
            this.cardColors.roseDirectionLetters,
            "middle",
            "central");
        return this.svg.group().add(this.northText).add(this.eastText).add(this.southText).add(this.westText);
    }

    private drawCircleLegend(): SVG.G {
        const circleLegendGroup = this.svg.group();
        const radiusStep = this.dimensionCalculator.cfg.roseRadius / this.windRoseData.circleCount;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;
        const center = this.dimensionCalculator.roseCenter();

        for (let i = 1; i <= this.windRoseData.circleCount; i++) {
            const coordinate = new Coordinate(center.x + (xy * i), center.y + (xy * i));
            const text = this.svgUtil.drawText(coordinate,
                (this.windRoseData.percentagePerCircle * i) + "%",
                TextAttributes.roseLegendAttribute(this.cardColors.rosePercentages));
            circleLegendGroup.add(text);
        }
        return circleLegendGroup;
    }

}
