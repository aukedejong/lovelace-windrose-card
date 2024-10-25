import {WindRoseConfig} from "../config/WindRoseConfig";
import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {SvgUtil} from "./SvgUtil";
import {DimensionConfig} from "./DimensionConfig";
import {Coordinate} from "./Coordinate";
import {Log} from "../util/Log";
import {CircleCoordinate} from "./CircleCoordinate";

export class CurrentDirectionRenderer {

    private config: WindRoseConfig;
    private readonly dimensionCalculator: WindRoseDimensionCalculator;
    private readonly cfg!: DimensionConfig;
    private svgUtil!: SvgUtil;

    private arrowElement: Snap.Element | undefined = undefined;
    private centerElement: Snap.Element | undefined = undefined;

    private readonly roseCenter: Coordinate;

    constructor(config: WindRoseConfig, dimensionConfig: DimensionConfig, svg: Snap.Paper) {
        this.config = config;
        this.dimensionCalculator = new WindRoseDimensionCalculator(dimensionConfig);
        this.svgUtil = new SvgUtil(svg);
        this.cfg = this.dimensionCalculator.cfg;
        this.roseCenter = this.dimensionCalculator.roseCenter();
    }

    drawCurrentWindDirection(currentWindDirection: number | undefined, redraw: boolean): void {
        if (this.arrowElement === undefined || redraw) {
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

            this.arrowElement!.attr({ visibility: "visible" })
            this.centerElement!.attr({ visibility: "hidden" })

            var transform = "R" + currentWindDirection + "," + this.roseCenter.x + "," + this.roseCenter.y;

            Log.debug("Animate", currentWindDirection, transform);
            this.arrowElement!.animate({ transform: transform }, 700, mina.easeinout);
        }
    }

    private drawArrow() {
        const x = this.roseCenter.x;
        const y = this.roseCenter.y - this.cfg.roseRadius + (this.config.currentDirectionArrowSize! / 2);

        this.arrowElement = this.svgUtil.drawArrow(x, y, this.config.currentDirectionArrowSize!);
        this.arrowElement.attr({
            stroke: this.config.roseCurrentDirectionArrowColor,
            fill: this.config.roseCurrentDirectionArrowColor
        });
    }

    private drawCenter() {

        if (this.config.centerCalmPercentage) {

            this.centerElement = this.svgUtil.drawCircle(new CircleCoordinate(this.roseCenter, this.config.centerRadius));
            this.centerElement.attr({
                stroke: this.config.roseCurrentDirectionArrowColor,
                strokeWidth: 4,
                fill: "none"
            });

        } else {

            this.centerElement = this.svgUtil.drawCircle(new CircleCoordinate(this.roseCenter, this.config.currentDirectionCenterCircleSize!));
            this.centerElement.attr({
                stroke: this.config.roseCurrentDirectionArrowColor,
                fill: this.config.roseCurrentDirectionArrowColor
            });

        }

    }

}
