import {DirectionLabels} from "../config/DirectionLabels";
import {SvgUtil} from "../renderer/SvgUtil";
import {Coordinate} from "../renderer/Coordinate";
import {DrawUtil} from "../util/DrawUtil";
import {LineCoordinates} from "../renderer/LineCoordinates";
import {CircleCoordinate} from "../renderer/CircleCoordinate";
import {CornersInfo} from "../config/CornersInfo";

export abstract class DimensionCalculatorWindRose {

    public readonly roseRadius = 500;
    readonly roseMarginLeft = 0;
    readonly roseMarginRight = 0;
    readonly roseMarginTop = 0;
    readonly roseMarginBottom = 10;
    readonly roseLetterSpacing = 45;
    
    //Calculated
    readonly roseDiameter = this.roseRadius * 2;
    readonly roseCenterX: number;
    readonly roseCenterY: number;
    readonly directionLetterMargin: number;
    readonly directionLetterFromCenter: number;
    readonly roseCompleteWidth: number;
    readonly roseCompleteHeight: number;

    readonly cos45 = Math.cos(DrawUtil.toRadians(45));
    readonly sin45 = Math.sin(DrawUtil.toRadians(45));
    readonly cos67 = Math.cos(DrawUtil.toRadians(67.5));
    readonly sin67 = Math.sin(DrawUtil.toRadians(67.5));
    readonly cos22 = Math.cos(DrawUtil.toRadians(22));
    readonly sin22 = Math.sin(DrawUtil.toRadians(22));
    readonly x45FromCenter: number;
    readonly y45FromCenter: number;
    readonly x22FromCenter: number
    readonly y22FromCenter: number;
    readonly x67FromCenter: number;
    readonly y67FromCenter: number;
    
    constructor(readonly directionLabels: DirectionLabels,
                readonly cornersInfo: CornersInfo,
                readonly svgUtil: SvgUtil) {

        this.directionLetterMargin = this.roseLetterSpacing + this.directionLabels.getMaxLabelLength(svgUtil);

        this.roseCenterX = this.roseMarginLeft + this.directionLetterMargin + this.roseRadius;
        this.roseCenterY = this.roseMarginTop + this.directionLetterMargin + this.roseRadius;

        this.roseCompleteWidth = this.roseMarginLeft + this.directionLetterMargin + this.roseDiameter +
            this.directionLetterMargin + this.roseMarginRight;
        this.roseCompleteHeight = this.roseMarginTop + this.directionLetterMargin + this.roseDiameter +
            this.directionLetterMargin + this.roseMarginBottom;

        this.directionLetterFromCenter = this.roseRadius + (this.directionLetterMargin / 2);

        this.x45FromCenter = Math.round(this.cos45 * this.directionLetterFromCenter);
        this.y45FromCenter = Math.round(this.sin45 * this.directionLetterFromCenter);

        this.x22FromCenter = Math.round(this.cos22 * this.directionLetterFromCenter);
        this.y22FromCenter = Math.round(this.sin22 * this.directionLetterFromCenter);
        
        this.x67FromCenter = Math.round(this.cos67 * this.directionLetterFromCenter);
        this.y67FromCenter = Math.round(this.sin67 * this.directionLetterFromCenter);
    }

    roseCenter(): Coordinate {
        return new Coordinate(this.roseCenterX, this.roseCenterY);
    }

    crossHorizontalLine(): LineCoordinates {
        return new LineCoordinates(
            new Coordinate(this.roseMarginLeft + this.directionLetterMargin, this.roseCenterY),
            new Coordinate(this.roseCenterX + this.roseRadius, this.roseCenterY));
    }

    crossVerticalLine(): LineCoordinates {
        return new LineCoordinates(
            new Coordinate(this.roseCenterX, this.roseMarginTop + this.directionLetterMargin),
            new Coordinate(this.roseCenterX, this.roseCenterY + this.roseRadius));
    }

    roseCircle(radius: number): CircleCoordinate {
        return new CircleCoordinate(new Coordinate(this.roseCenterX, this.roseCenterY), radius);
    }

    north(): Coordinate {
        return new Coordinate(this.roseCenterX, this.roseCenterY - this.directionLetterFromCenter);
    }

    east(): Coordinate {
        return new Coordinate(this.roseCenterX + this.directionLetterFromCenter, this.roseCenterY);
    }

    south(): Coordinate {
        return new Coordinate(this.roseCenterX, this.roseCenterY + this.directionLetterFromCenter);
    }

    west(): Coordinate {
        return new Coordinate(this.roseCenterX - this.directionLetterFromCenter, this.roseCenterY);
    }

    northEast(): Coordinate {
        var x = this.roseCenterX + this.x45FromCenter;
        var y = this.roseCenterY - this.y45FromCenter;
        return new Coordinate(x, y);
    }

    northWest(): Coordinate {
        var x = this.roseCenterX - this.x45FromCenter;
        var y = this.roseCenterY - this.y45FromCenter;
        return new Coordinate(x, y);
    }

    southEast(): Coordinate {
        var x = this.roseCenterX + this.x45FromCenter;
        var y = this.roseCenterY + this.y45FromCenter;
        return new Coordinate(x, y);
    }

    southWest(): Coordinate {
        var x = this.roseCenterX - this.x45FromCenter;
        var y = this.roseCenterY + this.y45FromCenter;
        return new Coordinate(x, y);
    }

    //Sub cardinals east side
    northNorthEast(): Coordinate {
        var x = this.roseCenterX + this.x67FromCenter;
        var y = this.roseCenterY - this.y67FromCenter;
        return new Coordinate(x, y);
    }

    eastNorthEast(): Coordinate {
        var x = this.roseCenterX + this.x22FromCenter
        var y = this.roseCenterY - this.y22FromCenter;
        return new Coordinate(x, y);
    }

    eastSouthEast(): Coordinate {
        var x = this.roseCenterX + this.x22FromCenter;
        var y = this.roseCenterY + this.y22FromCenter;
        return new Coordinate(x, y);
    }

    southSouthEast(): Coordinate {
        var x = this.roseCenterX + this.x67FromCenter;
        var y = this.roseCenterY + this.y67FromCenter
        return new Coordinate(x, y);
    }

    //Sub cardinal west side
    northNorthWest(): Coordinate {
        var x = this.roseCenterX - this.x67FromCenter
        var y = this.roseCenterY - this.y67FromCenter;
        return new Coordinate(x, y);
    }

    westNorthWest(): Coordinate {
        var x = this.roseCenterX - this.x22FromCenter;
        var y = this.roseCenterY - this.y22FromCenter;
        return new Coordinate(x, y);
    }

    westSouthWest(): Coordinate {
        var x = this.roseCenterX - this.x22FromCenter
        var y = this.roseCenterY + this.y22FromCenter;
        return new Coordinate(x, y);
    }

    southSouthWest(): Coordinate {
        var x = this.roseCenterX - this.x67FromCenter
        var y = this.roseCenterY + this.y67FromCenter
        return new Coordinate(x, y);
    }

    infoCornerLeftTop(): Coordinate {
        return new Coordinate(this.roseMarginLeft, this.roseMarginTop + this.cornersInfo.topLeftInfo.labelTextSize + 30);
    }

    infoCornerRightTop(): Coordinate {
        return new Coordinate(this.roseCompleteWidth, this.roseMarginTop + this.cornersInfo.topRightInfo.labelTextSize + 30);
    }

    infoCornetLeftBottom(): Coordinate {
        return new Coordinate(this.roseMarginLeft, this.roseCompleteHeight - this.cornersInfo.bottomLeftInfo.labelTextSize - 30);
    }

    infoCornetRightBottom(): Coordinate {
        return new Coordinate(this.roseCompleteWidth, this.roseCompleteHeight - this.cornersInfo.bottomRightInfo.labelTextSize - 30);
    }

    // Labels
    infoCornerLabelLeftTop(): Coordinate {
        return new Coordinate(this.roseMarginLeft, this.roseMarginTop + (this.cornersInfo.topLeftInfo.labelTextSize * 0.20));
    }

    infoCornerLabelRightTop(): Coordinate {
        return new Coordinate(this.roseCompleteWidth, this.roseMarginTop + (this.cornersInfo.topRightInfo.labelTextSize * 0.20));
    }

    infoCornetLabelLeftBottom(): Coordinate {
        return new Coordinate(this.roseMarginLeft, this.roseCompleteHeight - (this.cornersInfo.bottomLeftInfo.labelTextSize * 0.3));
    }

    infoCornetLabelRightBottom(): Coordinate {
        return new Coordinate(this.roseCompleteWidth, this.roseCompleteHeight - (this.cornersInfo.bottomRightInfo.labelTextSize * 0.3));
    }

}
