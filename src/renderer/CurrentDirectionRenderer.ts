import {SvgUtil} from "./SvgUtil";
import {Coordinate} from "./Coordinate";
import {Log} from "../util/Log";
import {CircleCoordinate} from "./CircleCoordinate";
import SVG, {Svg} from "@svgdotjs/svg.js";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {DimensionCalculator} from "../dimensions/DimensionCalculator";

export class CurrentDirectionRenderer {

    private config: CardConfigWrapper;
    private readonly dimensionCalculator: DimensionCalculator;
    private svgUtil!: SvgUtil;

    private arrowElement: SVG.Path | undefined = undefined;
    private centerElement: SVG.Circle | undefined = undefined;

    private readonly roseCenter: Coordinate;

    constructor(config: CardConfigWrapper, dimensionCalculator: DimensionCalculator, svg: Svg) {
        this.config = config;
        this.dimensionCalculator = dimensionCalculator;
        this.svgUtil = new SvgUtil(svg);
        this.roseCenter = this.dimensionCalculator.roseCenter();
    }

    drawCurrentWindDirection(currentWindDirection: number | undefined): void {
        if (this.arrowElement === undefined) {
            this.drawArrow();
        }
        if (this.centerElement === undefined) {
            this.drawCenter();

        }
        if (currentWindDirection === undefined) {
            this.arrowElement!.attr({ visibility: "hidden" })
            this.centerElement!.attr({ visibility: "visible" })

            Log.debug("Cur No direction, show circle", this.arrowElement, this.centerElement);

        } else {
            this.arrowElement!.attr({ visibility: "visible" });
            this.centerElement!.attr({ visibility: "hidden" });
            this.arrowElement!.animate(700, 0, 'now')
                .transform({ rotate: currentWindDirection, originX: this.roseCenter.x, originY: this.roseCenter.y})
                .ease('<>');
        }
    }

    private drawArrow() {
        const x = this.roseCenter.x;
        const y = this.roseCenter.y - this.dimensionCalculator.roseRadius - 1;

        this.arrowElement = this.svgUtil.drawArrowDown(x, y, this.config.currentDirection.arrowSize!);
        this.arrowElement.attr({
            stroke: this.config.cardColor.roseCurrentDirectionArrow,
            fill: this.config.cardColor.roseCurrentDirectionArrow
        });
    }

    private drawCenter() {

        if (this.config.centerCalmPercentage) {

            this.centerElement = this.svgUtil.drawCircle(new CircleCoordinate(this.roseCenter, this.config.currentDirection.centerCircleSize!));
            this.centerElement.stroke({ color: this.config.cardColor.roseCurrentDirectionArrow, width: 5});
            this.centerElement.attr({
                fill: "none"
            });

        } else {

            this.centerElement = this.svgUtil.drawCircle(new CircleCoordinate(this.roseCenter, this.config.currentDirection.centerCircleSize!));
            this.centerElement.attr({
                stroke: this.config.cardColor.roseCurrentDirectionArrow,
                fill: this.config.cardColor.roseCurrentDirectionArrow
            });
        }
    }
}
