import {DimensionConfig} from "./DimensionConfig";
import {RectCoordinates} from "./RectCoordinates";
import {Coordinate} from "./Coordinate";

export class WindBarDimensionCalculator {

    constructor(public readonly cfg: DimensionConfig) {

    }

    barRectBottom(positionIndex: number): RectCoordinates {
        var top = this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius + this.cfg.marginBottom;
        if (positionIndex > 0) {
            top += (this.cfg.barBottom.barHeight + this.cfg.barBottom.multiBarSpacing) * positionIndex;
        }
        return new RectCoordinates(new Coordinate(this.cfg.barBottom.barMarginLeft, top), this.cfg.barBottom.barLength, this.cfg.barBottom.barHeight);
    }

    barRectRight(positionIndex: number): RectCoordinates {
        var left = this.cfg.marginLeft + this.cfg.roseRadius + this.cfg.roseRadius + this.cfg.marginRight + this.cfg.barRight.barMarginLeft;
        if (positionIndex > 0) {
            left += (this.cfg.barRight.barWidth + this.cfg.barRight.multiBarSpacing) * positionIndex;
        }
        return new RectCoordinates(new Coordinate(left, this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius),
            this.cfg.barRight.barWidth, this.cfg.barRight.barHeight);
    }
}
