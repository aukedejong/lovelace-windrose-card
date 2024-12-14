import {WindRoseConfig} from "../config/WindRoseConfig";
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

export class WindRoseRendererCenterCalm {
    private readonly config: WindRoseConfig;
    private readonly speedRanges: SpeedRange[];
    private readonly svg: Svg;

    private readonly dimensionCalculator: WindRoseDimensionCalculator;
    private readonly degreesCalculator: DegreesCalculator;
    svgUtil!: SvgUtil;
    windRoseData!: WindRoseData;
    private readonly roseCenter: Coordinate;
    private roseGroup!: SVG.G;
    private northText!: SVG.Text;
    private eastText!: SVG.Text;
    private southText!: SVG.Text;
    private westText!: SVG.Text;

    constructor(config: WindRoseConfig,
                dimensionConfig: DimensionConfig,
                speedRanges: SpeedRange[],
                svg: Svg,
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
        this.roseGroup = this.svg.group().add(background).add(windDirectionText).add(windDirections);
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

    private drawSpeedPart(svg: Svg, degrees: number, radius: number, color: string): SVG.Path {

        var radians1 = DrawUtil.toRadians(degrees - (this.config.leaveArc / 2));
        var radians2 = DrawUtil.toRadians(degrees + (this.config.leaveArc / 2));
        var center = this.dimensionCalculator.roseCenter();
        var x1 = center.x + Math.round(Math.cos(radians1) * radius);
        var y1 = center.y + Math.round(Math.sin(radians1) * radius);
        var x2 = center.x + Math.round(Math.cos(radians2) * radius);
        var y2 = center.y + Math.round(Math.sin(radians2) * radius);

        return svg.path(`M ${center.x} ${center.y} L ${x1} ${y1} A${radius} ${radius} 0 0 1 ${x2} ${y2} Z`)
            .attr({'fill': color, stroke: this.config.roseLinesColor});
    }

    private drawBackground(): SVG.G {
        // Cross
        var lineHorizontal = this.svgUtil.drawLine(this.dimensionCalculator.crossHorizontalLine());
        var lineVertical = this.svgUtil.drawLine(this.dimensionCalculator.crossVerticalLine());
        var roseLinesGroup = this.svg.group().add(lineHorizontal).add(lineVertical);

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

    private drawWindDirectionText(): SVG.G {
        // Wind direction text
        const roseRenderDegrees = this.degreesCalculator.getRoseRenderDegrees();

        this.northText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.north(),
            this.config.cardinalDirectionLetters[0],
            -roseRenderDegrees,
            this.config.roseDirectionLettersColor,
            "middle",
            "central"
        );
        this.eastText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.east(),
            this.config.cardinalDirectionLetters[1],
            -roseRenderDegrees,
            this.config.roseDirectionLettersColor,
            "middle",
            "central");
        this.southText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.south(),
            this.config.cardinalDirectionLetters[2],
            -roseRenderDegrees,
            this.config.roseDirectionLettersColor,
            "middle",
            "central");
        this.westText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.west(),
            this.config.cardinalDirectionLetters[3],
            -roseRenderDegrees,
            this.config.roseDirectionLettersColor,
            "middle",
            "central");

        return this.svg.group().add(this.northText).add(this.eastText).add(this.southText).add(this.westText);
    }

    private drawCircleLegend(): SVG.G {
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

    private drawCenterZeroSpeed(): void {
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
        if (!isNaN(this.windRoseData.speedRangePercentages[0])) {
            this.svgUtil.drawText(center, Math.round(this.windRoseData.speedRangePercentages[0]) + '%',
                TextAttributes.windBarAttribute(textColor, 40, "middle", "middle"));
        }
    }

}
