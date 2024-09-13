import {LineCoordinates} from "./LineCoordinates";
import {RectCoordinates} from "./RectCoordinates";
import {CircleCoordinate} from "./CircleCoordinate";
import {TextAttributes} from "./TextAttributes";
import {Coordinate} from "./Coordinate";
import Snap from "snapsvg";

export class SvgUtil {

    constructor(public readonly svg: Snap.Paper) {
    }

    public drawLine(lineCoordinates: LineCoordinates): Snap.Element {
        return this.svg.line(lineCoordinates.startPoint.x, lineCoordinates.startPoint.y, lineCoordinates.endPoint.x,
            lineCoordinates.endPoint.y);
    }

    public drawRect(rectCoordinates: RectCoordinates): Snap.Element {
        return this.svg.rect(rectCoordinates.startPoint.x, rectCoordinates.startPoint.y, rectCoordinates.width,
            rectCoordinates.height);
    }

    public drawPolyRect(rectCoordinates: RectCoordinates): Snap.Element {
        return this.svg.path(Snap.format('M {x} {y} l {w} 0 l 0 {h} l {wn} 0 Z', {
            x: rectCoordinates.startPoint.x,
            y: rectCoordinates.startPoint.y,
            w: rectCoordinates.width,
            wn: rectCoordinates.width * -1,
            h: rectCoordinates.height
        }));
    }

    public drawCircle(circleCoridnate: CircleCoordinate): Snap.Element {
        return this.svg.circle(circleCoridnate.centerPoint.x, circleCoridnate.centerPoint.y, circleCoridnate.radius);
    }

    public drawText(coordinate: Coordinate, text: string, attributes: TextAttributes): Snap.Element {
        var t = this.svg.text(coordinate.x, coordinate.y, text) as Snap.Element;
        t.attr(attributes);
        return t;
    }
}
