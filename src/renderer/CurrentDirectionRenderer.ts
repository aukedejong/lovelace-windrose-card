import {WindRoseConfig} from "../config/WindRoseConfig";
import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {SvgUtil} from "./SvgUtil";
import {DimensionConfig} from "./DimensionConfig";
import {Coordinate} from "./Coordinate";
import {Log} from "../util/Log";

export class CurrentDirectionRenderer {

    private config: WindRoseConfig;
    private readonly dimensionCalculator: WindRoseDimensionCalculator;
    private readonly cfg!: DimensionConfig;
    private svgUtil!: SvgUtil;
    private indicator: Snap.Element | undefined = undefined;
    private readonly roseCenter: Coordinate;

    constructor(config: WindRoseConfig, dimensionConfig: DimensionConfig) {
        this.config = config;
        this.dimensionCalculator = new WindRoseDimensionCalculator(dimensionConfig);
        this.cfg = this.dimensionCalculator.cfg;
        this.roseCenter = this.dimensionCalculator.roseCenter();
    }

    drawCurrentWindDirection(currentWindDirection: number, svg: Snap.Paper): void {
        this.svgUtil = new SvgUtil(svg);
        if (this.indicator === undefined) {
            this.dimensionCalculator.roseCenter()
            const x = this.roseCenter.x + this.cfg.roseRadius + 20;
            const y = this.roseCenter.y;

            this.indicator = this.svgUtil.drawArrow(x, y, 40);
            this.indicator.attr({
                stroke: this.config.roseCurrentDirectionArrowColor,
                fill: this.config.roseCurrentDirectionArrowColor
            });
        }
        if (isNaN(+currentWindDirection)) {
            return;
        }
        const degrees =  -90 + this.config.windRoseDrawNorthOffset + (+currentWindDirection);
        var transform = "R" + degrees + "," + this.roseCenter.x + "," + this.roseCenter.y;

        Log.debug("Animate", degrees, currentWindDirection, transform);
        this.indicator.animate(
            { transform: transform }, 700, mina.easeinout);
    }

}
