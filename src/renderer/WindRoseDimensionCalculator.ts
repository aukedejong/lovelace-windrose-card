import {LineCoordinates} from "./LineCoordinates";
import {Coordinate} from "./Coordinate";
import {CircleCoordinate} from "./CircleCoordinate";
import {DimensionConfig} from "./DimensionConfig";
import {DrawUtil} from "../util/DrawUtil";

export class WindRoseDimensionCalculator {

    constructor(public readonly cfg: DimensionConfig) {
    }

    roseCenter(): Coordinate {
        return new Coordinate(this.cfg.marginLeft + this.cfg.roseRadius, this.cfg.marginTop + this.cfg.roseRadius);
    }

    crossHorizontalLine(): LineCoordinates {
        var y = this.cfg.marginTop + this.cfg.roseRadius;
        return new LineCoordinates(
            new Coordinate(this.cfg.marginLeft, y),
            new Coordinate(this.cfg.marginLeft + this.cfg.roseRadius + this.cfg.roseRadius, y));
    }

    crossVerticalLine(): LineCoordinates {
        var x = this.cfg.marginLeft + this.cfg.roseRadius;
        return new LineCoordinates(
            new Coordinate(x, this.cfg.marginTop),
            new Coordinate(x, this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius));
    }

    roseCircle(radius: number): CircleCoordinate{
        return new CircleCoordinate(new Coordinate(this.cfg.marginLeft + this.cfg.roseRadius, this.cfg.marginTop +
                this.cfg.roseRadius), radius);
    }

    viewBox(): string {
        if (this.cfg.barCount === 0) {
            return this.viewBoxRoseOnly();
        } else if (this.cfg.barLocation === 'right') {
            return this.viewBoxBarRight();
        } else if (this.cfg.barLocation === 'bottom') {
            return this.viewBoxBarBotton();
        }
        throw new Error("Bar location should be right or bottom not: " + this.cfg.barLocation);
    }

    private viewBoxRoseOnly(): string {
        let width = this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius + this.cfg.marginBottom;
        return "0 0 " + width + " " + width;
    }

    private viewBoxBarRight(): string {
        var barRightCfg = this.cfg.barRight;
        var roseHeight = this.cfg.roseRadius + this.cfg.roseRadius;
        var height = this.cfg.marginTop + roseHeight + this.cfg.marginBottom;
        var width: number;
        if (this.cfg.barCount === 1) {
            width = this.cfg.marginLeft + roseHeight + this.cfg.marginRight + barRightCfg.barMarginLeft + barRightCfg.barWidth + barRightCfg.barMarginRight;
        } else {
            width = this.cfg.marginLeft + roseHeight + this.cfg.marginRight + barRightCfg.barMarginLeft + (barRightCfg.barWidth * this.cfg.barCount) +
                (barRightCfg.multiBarSpacing * (this.cfg.barCount - 1)) + this.cfg.marginRight;
        }
        return "0 0 " + width + " " + height;
    }

    private viewBoxBarBotton(): string {
        var barBottomCfg = this.cfg.barBottom;
        var roseWidth = this.cfg.roseRadius + this.cfg.roseRadius;
        var width = this.cfg.marginLeft + roseWidth + this.cfg.marginRight;
        var height: number;
        if (this.cfg.barCount === 1) {
            height = this.cfg.marginTop + roseWidth + this.cfg.marginBottom + barBottomCfg.barMarginTop + barBottomCfg.barHeight + barBottomCfg.barMarginBottom;
        } else {
            height = this.cfg.marginTop + roseWidth + this.cfg.marginBottom + barBottomCfg.barMarginTop + (barBottomCfg.barHeight * this.cfg.barCount) +
                (barBottomCfg.multiBarSpacing * (this.cfg.barCount - 1)) + barBottomCfg.barMarginBottom;
        }
        return "0 0 " + width + " " + height;
    }

    north(): Coordinate{
        return new Coordinate(this.cfg.marginLeft + this.cfg.roseRadius, this.cfg.marginTop / 2);
    }

    east(): Coordinate{
        return new Coordinate(this.cfg.marginLeft + this.cfg.roseRadius + this.cfg.roseRadius + (this.cfg.marginRight / 2), this.cfg.marginTop + this.cfg.roseRadius);
    }

    south(): Coordinate{
        return new Coordinate(this.cfg.marginLeft + this.cfg.roseRadius, this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius + (this.cfg.marginBottom / 2));
    }

    west(): Coordinate{
        return new Coordinate((this.cfg.marginLeft / 2), this.cfg.marginTop + this.cfg.roseRadius);
    }

    northEast(): Coordinate {
        var rads = DrawUtil.toRadians(45);
        var center = this.roseCenter();
        var x = center.x + Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y - Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }

    northWest(): Coordinate {
        var rads = DrawUtil.toRadians(45);
        var center = this.roseCenter();
        var x = center.x - Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y - Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }

    southEast(): Coordinate {
        var rads = DrawUtil.toRadians(45);
        var center = this.roseCenter();
        var x = center.x + Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y + Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }

    southWest(): Coordinate {
        var rads = DrawUtil.toRadians(45);
        var center = this.roseCenter();
        var x = center.x - Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y + Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }
    //Sub cardinals east side
    northNorthEast(): Coordinate {
        var rads = DrawUtil.toRadians(67.5);
        var center = this.roseCenter();
        var x = center.x + Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y - Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }

    eastNorthEast(): Coordinate {
        var rads = DrawUtil.toRadians(22.5);
        var center = this.roseCenter();
        var x = center.x + Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y - Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }

    eastSouthEast(): Coordinate {
        var rads = DrawUtil.toRadians(22.5);
        var center = this.roseCenter();
        var x = center.x + Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y + Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }

    southSouthEast(): Coordinate {
        var rads = DrawUtil.toRadians(67.5);
        var center = this.roseCenter();
        var x = center.x + Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y + Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }
    //Sub cardinal west side
    northNorthWest(): Coordinate {
        var rads = DrawUtil.toRadians(67.5);
        var center = this.roseCenter();
        var x = center.x - Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y - Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }

    westNorthWest(): Coordinate {
        var rads = DrawUtil.toRadians(22.5);
        var center = this.roseCenter();
        var x = center.x - Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y - Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }

    westSouthWest(): Coordinate {
        var rads = DrawUtil.toRadians(22.5);
        var center = this.roseCenter();
        var x = center.x - Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y + Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }

    southSouthWest(): Coordinate {
        var rads = DrawUtil.toRadians(67.5);
        var center = this.roseCenter();
        var x = center.x - Math.round(Math.cos(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        var y = center.y + Math.round(Math.sin(rads) * (this.cfg.roseRadius + (this.cfg.marginRight / 2)));
        return new Coordinate(x, y);
    }

    infoCornerLeftTop(): Coordinate {
        return new Coordinate(this.cfg.marginLeft * 0.1, this.cfg.marginTop);
    }

    infoCornerRightTop(): Coordinate {
        return new Coordinate(this.cfg.marginLeft + this.cfg.roseRadius + this.cfg.roseRadius + (this.cfg.marginRight * 0.9),
            this.cfg.marginTop);
    }

    infoCornetLeftBottom(): Coordinate {
        return new Coordinate(this.cfg.marginLeft * 0.1,
            this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius - 30);
    }

    infoCornetRightBottom(): Coordinate {
        return new Coordinate(this.cfg.marginLeft + this.cfg.roseRadius + this.cfg.roseRadius + (this.cfg.marginRight * 0.9),
            this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius - 30);
    }

    infoCornerLabelLeftTop(): Coordinate {
        return new Coordinate(this.cfg.marginLeft * 0.1, this.cfg.marginTop * 0.1);
    }

    infoCornerLabelRightTop(): Coordinate {
        return new Coordinate(this.cfg.marginLeft + this.cfg.roseRadius + this.cfg.roseRadius + (this.cfg.marginRight * 0.9),
            this.cfg.marginTop * 0.1);
    }

    infoCornetLabelLeftBottom(): Coordinate {
        return new Coordinate(this.cfg.marginLeft * 0.1,
            this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius);
    }

    infoCornetLabelRightBottom(): Coordinate {
        return new Coordinate(this.cfg.marginLeft + this.cfg.roseRadius + this.cfg.roseRadius + (this.cfg.marginRight * 0.9),
            this.cfg.marginTop + this.cfg.roseRadius + this.cfg.roseRadius)
    }

}
