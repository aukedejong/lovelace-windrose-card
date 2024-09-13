import {WindRoseConfig} from "../config/WindRoseConfig";
import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {SvgUtil} from "./SvgUtil";
import {DimensionConfig} from "./DimensionConfig";
import {Coordinate} from "./Coordinate";

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

    drawCurrentWindDirection(currentWindDirection: string, svg: Snap.Paper): void {
        // this.svgUtil = new SvgUtil(svg);
        // if (this.indicator === undefined) {
        //     this.dimensionCalculator.roseCenter()
        //     const x = this.roseCenter.x + this.cfg.roseRadius + 20;
        //     const y = this.roseCenter.y;
        //
        //     this.indicator = this.svgUtil.drawArrow(x, y, 40);
        //     this.indicator.attr({
        //         stroke: "red",
        //         fill: "red"
        //     });
        // }
        // this.indicator.animate(
        //     { transform: "R" + currentWindDirection + "," + this.roseCenter.x + "," + this.roseCenter.y}, 500, mina.easeinout);
    }
}
