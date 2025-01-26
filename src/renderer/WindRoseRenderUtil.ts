import SVG, {Svg} from "@svgdotjs/svg.js";
import {SvgUtil} from "./SvgUtil";
import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {WindRoseData} from "./WindRoseData";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CardColors} from "../config/CardColors";
import {Coordinate} from "./Coordinate";
import {DegreesCalculator} from "./DegreesCalculator";
import {CardConfigCustomDirectionLabels} from "../card/CardConfigCustomDirectionLabels";
import {DirectionLabels} from "../config/DirectionLabels";

export class WindRoseRenderUtil {

    private readonly cardColors: CardColors;
    private readonly dimensionCalculator: WindRoseDimensionCalculator;
    private readonly degreesCalculator: DegreesCalculator;
    private readonly svgUtil!: SvgUtil;
    private readonly svg: Svg;
    private readonly centerRadius: number;
    private readonly roseCenter: Coordinate;
    private readonly customLabels: CardConfigCustomDirectionLabels;
    private readonly directionLabelConfig: DirectionLabels;
    private readonly showCardinalDirections: boolean;
    private readonly showIntercardinalDirections: boolean;
    private readonly showSecondaryIntercardinalDirections: boolean;

    constructor(config: CardConfigWrapper,
                dimensionCalculator: WindRoseDimensionCalculator,
                degreesCalculator: DegreesCalculator,
                svg: Svg) {

        this.cardColors = config.cardColor;
        this.directionLabelConfig = config.directionLabels;
        this.customLabels = config.directionLabels.customLabels;
        this.showCardinalDirections = config.directionLabels.showCardinalDirections;
        this.showIntercardinalDirections = config.directionLabels.showIntercardinalDirections;
        this.showSecondaryIntercardinalDirections = config.directionLabels.showSecondaryIntercardinalDirections;

        this.dimensionCalculator = dimensionCalculator;
        this.degreesCalculator = degreesCalculator;
        this.svg = svg;
        this.svgUtil = new SvgUtil(svg);

        this.centerRadius = 60;
        this.roseCenter = this.dimensionCalculator.roseCenter();
    }

    public drawBackground(windRoseData: WindRoseData, centerCalm: boolean): SVG.G {

        var roseLinesGroup = this.svg.group();

        // Cross
        var lineHorizontal = this.svgUtil.drawLine(this.dimensionCalculator.crossHorizontalLine());
        var lineVertical = this.svgUtil.drawLine(this.dimensionCalculator.crossVerticalLine());
        var cross = this.svg.group().add(lineHorizontal).add(lineVertical);
        roseLinesGroup.add(cross);
        if (this.showIntercardinalDirections) {
            roseLinesGroup.add(cross.clone().transform({ rotate: 45, originX: this.roseCenter.x, originY: this.roseCenter.y}));
        }
        if (this.showSecondaryIntercardinalDirections) {
            roseLinesGroup.add(cross.clone().transform({ rotate: 22.5, originX: this.roseCenter.x, originY: this.roseCenter.y}));
            roseLinesGroup.add(cross.clone().transform({ rotate: -22.5, originX: this.roseCenter.x, originY: this.roseCenter.y}));
        }

        // Circles
        let centerRadius = this.centerRadius;
        if (!centerCalm) {
            centerRadius = 0;
        }
        const circleCount = windRoseData.circleCount;
        const radiusStep = (this.dimensionCalculator.cfg.roseRadius - centerRadius) / circleCount;
        let circleRadius = centerRadius + radiusStep;
        for (let i = 1; i <= circleCount; i++) {
            roseLinesGroup.add(this.svgUtil.drawCircle(this.dimensionCalculator.roseCircle(circleRadius)));
            circleRadius += radiusStep;
        }
        roseLinesGroup.attr({
            stroke: this.cardColors.roseLines,
            strokeWidth: 1,
            fill: "none",
        });
        return roseLinesGroup;
    }

    public  drawWindDirectionText(): SVG.G {
        // Wind direction text
        const roseRenderDegrees = this.degreesCalculator.getRoseRenderDegrees();
        const group = this.svg.group();

        if (this.showCardinalDirections) {
            const northText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.north(),
                this.customLabels.n!,
                -roseRenderDegrees,
                this.cardColors.roseCardinalDirectionLabels,
                this.directionLabelConfig.cardinalLabelSize);
            const eastText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.east(),
                this.customLabels.e!,
                -roseRenderDegrees,
                this.cardColors.roseCardinalDirectionLabels,
                this.directionLabelConfig.cardinalLabelSize);
            const southText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.south(),
                this.customLabels.s!,
                -roseRenderDegrees,
                this.cardColors.roseCardinalDirectionLabels,
                this.directionLabelConfig.cardinalLabelSize);
            const westText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.west(),
                this.customLabels.w!,
                -roseRenderDegrees,
                this.cardColors.roseCardinalDirectionLabels,
                this.directionLabelConfig.cardinalLabelSize);

            group.add(northText).add(eastText).add(southText).add(westText);
        }

        if (this.showIntercardinalDirections) {
            const northEastText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.northEast(),
                this.customLabels.ne!,
                -roseRenderDegrees,
                this.cardColors.roseIntercardinalDirectionLabels,
                this.directionLabelConfig.intercardinalLabelSize);
            const northWestText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.northWest(),
                this.customLabels.nw!,
                -roseRenderDegrees,
                this.cardColors.roseIntercardinalDirectionLabels,
                this.directionLabelConfig.intercardinalLabelSize);
            const southEastText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.southEast(),
                this.customLabels.se!,
                -roseRenderDegrees,
                this.cardColors.roseIntercardinalDirectionLabels,
                this.directionLabelConfig.intercardinalLabelSize);
            const southWestText = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.southWest(),
                this.customLabels.sw!,
                -roseRenderDegrees,
                this.cardColors.roseIntercardinalDirectionLabels,
                this.directionLabelConfig.intercardinalLabelSize);

            group.add(northEastText).add(northWestText).add(southEastText).add(southWestText);
        }

        if (this.showSecondaryIntercardinalDirections) {
            const northNorthEast = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.northNorthEast(),
                this.customLabels.nne!,
                -roseRenderDegrees,
                this.cardColors.roseSubIntercardinalDirectionLabels,
                this.directionLabelConfig.secondaryIntercardinalLabelSize);
            const eastNorthEast = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.eastNorthEast(),
                this.customLabels.ene!,
                -roseRenderDegrees,
                this.cardColors.roseSubIntercardinalDirectionLabels,
                this.directionLabelConfig.secondaryIntercardinalLabelSize);
            const eastSouthEast = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.eastSouthEast(),
                this.customLabels.ese!,
                -roseRenderDegrees,
                this.cardColors.roseSubIntercardinalDirectionLabels,
                this.directionLabelConfig.secondaryIntercardinalLabelSize);
            const southSouthEast = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.southSouthEast(),
                this.customLabels.sse!,
                -roseRenderDegrees,
                this.cardColors.roseSubIntercardinalDirectionLabels,
                this.directionLabelConfig.secondaryIntercardinalLabelSize);

            const northNorthWest = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.northNorthWest(),
                this.customLabels.nnw!,
                -roseRenderDegrees,
                this.cardColors.roseSubIntercardinalDirectionLabels,
                this.directionLabelConfig.secondaryIntercardinalLabelSize);
            const westNorthWest = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.westNorthWest(),
                this.customLabels.wnw!,
                -roseRenderDegrees,
                this.cardColors.roseSubIntercardinalDirectionLabels,
                this.directionLabelConfig.secondaryIntercardinalLabelSize);
            const westSouthWest = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.westSouthWest(),
                this.customLabels.wsw!,
                -roseRenderDegrees,
                this.cardColors.roseSubIntercardinalDirectionLabels,
                this.directionLabelConfig.secondaryIntercardinalLabelSize);
            const southSouthWest = this.svgUtil.drawWindDirectionText(this.dimensionCalculator.southSouthWest(),
                this.customLabels.ssw!,
                -roseRenderDegrees,
                this.cardColors.roseSubIntercardinalDirectionLabels,
                this.directionLabelConfig.secondaryIntercardinalLabelSize);

            group.add(northNorthEast).add(eastNorthEast).add(eastSouthEast).add(southSouthEast)
                .add(northNorthWest).add(westNorthWest).add(westSouthWest).add(southSouthWest);
        }

        return group;
    }
}
