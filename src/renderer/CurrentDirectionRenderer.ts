import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {SvgUtil} from "./SvgUtil";
import {DimensionConfig} from "./DimensionConfig";
import {Coordinate} from "./Coordinate";
import {Log} from "../util/Log";
import {CircleCoordinate} from "./CircleCoordinate";
import SVG, {Svg} from "@svgdotjs/svg.js";
import {CardConfigWrapper} from "../config/CardConfigWrapper";

export class CurrentDirectionRenderer {

    private config: CardConfigWrapper;
    private readonly dimensionCalculator: WindRoseDimensionCalculator;
    private readonly cfg!: DimensionConfig;
    private svgUtil!: SvgUtil;

    private arrowElement: SVG.Path | undefined = undefined;
    private centerElement: SVG.Circle | undefined = undefined;

    private readonly roseCenter: Coordinate;

    constructor(config: CardConfigWrapper, dimensionConfig: DimensionConfig, svg: Svg) {
        this.config = config;
        this.dimensionCalculator = new WindRoseDimensionCalculator(dimensionConfig);
        this.svgUtil = new SvgUtil(svg);
        this.cfg = this.dimensionCalculator.cfg;
        this.roseCenter = this.dimensionCalculator.roseCenter();
    }

    drawCurrentWindDirection(currentWindDirection: number | undefined, redraw: boolean): void {
        if (this.arrowElement === undefined || redraw) {
            Log.debug('Cur Init draw, redraw = ' + redraw);
            this.drawArrow();
        }
        if (this.centerElement === undefined || redraw) {
            this.drawCenter();

        }
        if (currentWindDirection === undefined) {
            this.arrowElement!.attr({ visibility: "hidden" })
            this.centerElement!.attr({ visibility: "visible" })

            Log.debug("Cur No direction, show circle", this.arrowElement, this.centerElement);

        } else {
            this.arrowElement!.attr({ visibility: "visible" });
            this.centerElement!.attr({ visibility: "hidden" });
            if (redraw) { //Only animate when it's an update, not a redraw.
                this.arrowElement!.transform({ rotate: currentWindDirection, originX: this.roseCenter.x, originY: this.roseCenter.y});
            } else {
                this.arrowElement!.animate(700, 0, 'now')
                    .transform({ rotate: currentWindDirection, originX: this.roseCenter.x, originY: this.roseCenter.y})
                    .ease('<>');
            }
        }
    }

    private drawArrow() {
        const x = this.roseCenter.x;
        const y = this.roseCenter.y - this.cfg.roseRadius + (this.config.currentDirection.arrowSize! / 2);

        this.arrowElement = this.svgUtil.drawArrow(x, y, this.config.currentDirection.arrowSize!);
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
