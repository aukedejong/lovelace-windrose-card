import {LineCoordinates} from "./LineCoordinates";
import {RectCoordinates} from "./RectCoordinates";
import {CircleCoordinate} from "./CircleCoordinate";
import {TextAttributes} from "./TextAttributes";
import {Coordinate} from "./Coordinate";
import SVG, {PathArray, Svg} from "@svgdotjs/svg.js";

export class SvgUtil {

    constructor(public readonly svg: Svg) {
    }

    public drawLine(lineCoordinates: LineCoordinates): SVG.Line {
        return this.svg.line(lineCoordinates.startPoint.x, lineCoordinates.startPoint.y, lineCoordinates.endPoint.x,
            lineCoordinates.endPoint.y);
    }

    public drawRect(rectCoordinates: RectCoordinates): SVG.Rect {
        return this.svg.rect(rectCoordinates.width, rectCoordinates.height)
            .move(rectCoordinates.startPoint.x, rectCoordinates.startPoint.y);
    }

    public drawPolyRect(rectCoordinates: RectCoordinates): SVG.Path {
        const x = rectCoordinates.startPoint.x;
        const y = rectCoordinates.startPoint.y;
        const w = rectCoordinates.width;
        const wn = rectCoordinates.width * -1;
        const h = rectCoordinates.height;
        return this.svg.path(new PathArray(`M ${x} ${y} l ${w} 0 l 0 ${h} l ${wn} 0 Z`));
    }

    public drawTriangle(x: number, y: number, dx1: number, dy1: number, dx2: number, dy2: number): SVG.Path {
        return this.svg.path(new PathArray(`M ${x} ${y} L ${dx1} ${dy1} L ${dx2} ${dy2} Z`));
    }

    public drawArrow(x: number, y: number, size: number): SVG.Path {
        const dx1 = -size/2;
        const dy1 = -size;
        const dx2 = size/2;
        const dy2 = size/4;
        const dx3 = size/2;
        const dy3 = -size/4;
        return this.svg.path(new PathArray(`M ${x} ${y} l ${dx1} ${dy1} l ${dx2} ${dy2} l ${dx3} ${dy3} Z`));
    }

    public drawWindDirectionText(coord: Coordinate, text: string, rotateDegrees: number, color: string, size: number): SVG.Text {
        var textElement = this.drawText(coord, text,  TextAttributes.windBarAttribute(color, size, "central", "middle"));
        this.rotate(textElement, rotateDegrees, coord);
        return textElement;
    }

    public getTextLength(text: string, size: number): number{
        const element = this.svg.plain(text).move(-1000, -1000).attr({ "font-size": size, "font-family": "Arial" });
        const textWidth = element.bbox().width;
        element.remove();
        return textWidth;
    }

    public rotate(element: SVG.Element, degrees: number, center: Coordinate) {
        element.rotate(degrees, center.x, center.y);
    }

    public drawCircle(circleCoridnate: CircleCoordinate): SVG.Circle{
        return this.svg.circle(circleCoridnate.radius * 2).center(circleCoridnate.centerPoint.x, circleCoridnate.centerPoint.y);
    }

    public drawText(coordinate: Coordinate, text: string, attributes: TextAttributes): SVG.Text {
        return this.svg.plain(text).dmove(coordinate.x, coordinate.y).attr(attributes);
    }
}
