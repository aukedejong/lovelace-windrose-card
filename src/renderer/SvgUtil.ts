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

    public drawTriangle(x: number, y: number, dx1: number, dy1: number, dx2: number, dy2: number): Snap.Element {
        return this.svg.path(Snap.format('M {x} {y} l {dx1} {dy1} l {dx2} {dy2} Z', {
            x: x,
            y: y,
            dx1: dx1,
            dy1: dy1,
            dx2: dx2,
            dy2: dy2
        }));
    }

    public drawArrow(x: number, y: number, size: number): Snap.Element {
        return this.svg.path(Snap.format('M {x} {y} l {dx1} {dy1} l {dx2} {dy2} l {dx3} {dy3} Z', {
            x: x,
            y: y,
            dx1: -size/2,
            dy1: -size,
            dx2: size/2,
            dy2: size/4,
            dx3: size/2,
            dy3: -size/4
        }));
    }

    public drawWindDirectionText(coord: Coordinate, text: string, rotateDegrees: number, color: string, anchor: string, baseline: string): Snap.Element {
        var textElement = this.drawText(coord, text,  TextAttributes.windBarAttribute(color, 50, baseline, anchor));
        this.rotate(textElement, rotateDegrees, coord);
        return textElement;
    }

    public getTextLength(text: string, size: number): number{
        var element = this.svg.text(-1000, -1000, text) as Snap.Element;
        element.attr({ "font-size": size, "font-family": "Arial" });
        const width = element.getBBox().width;
        element.remove();
        return width;
    }

    public rotate(element: Snap.Element, degrees: number, center: Coordinate) {
        element.transform(Snap.format('r{deg},{x},{y}', {
            deg: degrees,
            x: center.x,
            y: center.y
        }))
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
