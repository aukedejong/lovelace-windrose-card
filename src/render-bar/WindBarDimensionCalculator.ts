import {DimensionConfig} from "../renderer/DimensionConfig";
import {RectCoordinates} from "../renderer/RectCoordinates";
import {Coordinate} from "../renderer/Coordinate";

export class WindBarDimensionCalculator {

    constructor(public readonly cfg: DimensionConfig) {
    }

    barStart(): number {
        return this.cfg.barLocation === 'bottom' ? this.cfg.barBottom.barMarginLeft : this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius;
    }

    barLength(): number {
        return this.cfg.barLocation === 'bottom' ? this.cfg.barBottom.barLength : this.cfg.barRight.barHeight;
    }

    barBottomY(positionIndex: number): number {
        var top = this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius + this.cfg.marginBottom + this.cfg.barBottom.barMarginTop;
        if (positionIndex > 0) {
            top += (this.cfg.barBottom.barHeight + this.cfg.barBottom.multiBarSpacing) * positionIndex;
        }
        return top;
    }

    barRectBottom(positionIndex: number): RectCoordinates {
        var top = this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius + this.cfg.marginBottom + this.cfg.barBottom.barMarginTop;
        if (positionIndex > 0) {
            top += (this.cfg.barBottom.barHeight + this.cfg.barBottom.multiBarSpacing) * positionIndex;
        }
        return new RectCoordinates(new Coordinate(this.cfg.barBottom.barMarginLeft, top), this.cfg.barBottom.barLength, this.cfg.barBottom.barHeight);
    }

    touchFaceBarBottom(positionIndex: number): RectCoordinates {
        var top = this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius + this.cfg.marginBottom + this.cfg.barBottom.barMarginTop - this.cfg.barBottom.barHeight;
        if (positionIndex > 0) {
            top += (this.cfg.barBottom.barHeight + this.cfg.barBottom.multiBarSpacing) * positionIndex;
        }
        return new RectCoordinates(new Coordinate(0, top), (this.cfg.marginLeft + this.cfg.roseRadius) * 2, this.cfg.barBottom.barHeight * 3);
    }

    barRightX(positionIndex: number): number {
        var left = this.cfg.marginLeft + this.cfg.roseRadius + this.cfg.roseRadius + this.cfg.marginRight + this.cfg.barRight.barMarginLeft;
        if (positionIndex > 0) {
            left += (this.cfg.barRight.barWidth + this.cfg.barRight.multiBarSpacing) * positionIndex;
        }
        return left;
    }

    barRectRight(positionIndex: number): RectCoordinates {
        var left = this.cfg.marginLeft + this.cfg.roseRadius + this.cfg.roseRadius + this.cfg.marginRight + this.cfg.barRight.barMarginLeft;
        if (positionIndex > 0) {
            left += (this.cfg.barRight.barWidth + this.cfg.barRight.multiBarSpacing) * positionIndex;
        }
        return new RectCoordinates(new Coordinate(left, this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius),
            this.cfg.barRight.barWidth, this.cfg.barRight.barHeight);
    }

    touchFaceBarRight(positionIndex: number): RectCoordinates {
        var left = this.cfg.marginLeft + this.cfg.roseRadius + this.cfg.roseRadius + this.cfg.marginRight;
        if (positionIndex > 0) {
            left += (this.cfg.barRight.barWidth + this.cfg.barRight.multiBarSpacing) * positionIndex;
        }
        return new RectCoordinates(new Coordinate(left, 0),
            this.cfg.barRight.barWidth * 2, this.cfg.barRight.barHeight + this.cfg.marginTop + this.cfg.marginBottom);
    }
}
