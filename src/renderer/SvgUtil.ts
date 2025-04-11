import {LineCoordinates} from "./LineCoordinates";
import {RectCoordinates} from "./RectCoordinates";
import {CircleCoordinate} from "./CircleCoordinate";
import {TextAttributes} from "./TextAttributes";
import {Coordinate} from "./Coordinate";
import SVG, {PathArray, Svg} from "@svgdotjs/svg.js";

export class SvgUtil {

    constructor(public readonly svg: Svg) {
    }

    public createGroup() {
        return this.svg.group();
    }

    public drawLine(lineCoordinates: LineCoordinates): SVG.Line {
        return this.svg.line(lineCoordinates.startPoint.x, lineCoordinates.startPoint.y, lineCoordinates.endPoint.x,
            lineCoordinates.endPoint.y);
    }

    public drawRect(rectCoordinates: RectCoordinates): SVG.Rect {
        return this.svg.rect(rectCoordinates.width, rectCoordinates.height)
            .move(rectCoordinates.x, rectCoordinates.y);
    }

    public drawPathRect(x: number, y: number, x2: number, y2: number): SVG.Path {
        return this.svg.path(new PathArray(`M ${x} ${y} L ${x2} ${y} L ${x2} ${y2} L ${x} ${y2} Z`));
    }

    public drawTriangle(x: number, y: number, dx1: number, dy1: number, dx2: number, dy2: number): SVG.Path {
        return this.svg.path(new PathArray(`M ${x} ${y} L ${dx1} ${dy1} L ${dx2} ${dy2} Z`));
    }

    public drawArrowDown(x: number, y: number, size: number): SVG.Path {
        const dx1 = -size/2;
        const dy1 = -size;
        const dx2 = size/2;
        const dy2 = size/4;
        const dx3 = size/2;
        const dy3 = -size/4;
        return this.svg.path(new PathArray(`M ${x} ${y} l ${dx1} ${dy1} l ${dx2} ${dy2} l ${dx3} ${dy3} Z`));
    }

    public drawArrowUp(x: number, y: number, size: number): SVG.Path {
        const dx1 = -size/2;
        const dy1 = size;
        const dx2 = size/2;
        const dy2 = -size/4;
        const dx3 = size/2;
        const dy3 = size/4;
        return this.svg.path(new PathArray(`M ${x} ${y} l ${dx1} ${dy1} l ${dx2} ${dy2} l ${dx3} ${dy3} Z`));
    }

    public drawArrowRight(x: number, y: number, size: number): SVG.Path {
        const dx1 = -size/4;
        const dy1 = -size/2;
        const dx2 = size;
        const dy2 = size/2;
        const dx3 = -size;
        const dy3 = size/2;
        return this.svg.path(new PathArray(`M ${x} ${y} l ${dx1} ${dy1} l ${dx2} ${dy2} l ${dx3} ${dy3} Z`));
    }

    public drawArrowLeft(x: number, y: number, size: number): SVG.Path {
        const dx1 = size/4;
        const dy1 = -size/2;
        const dx2 = -size;
        const dy2 = size/2;
        const dx3 = size;
        const dy3 = size/2;
        return this.svg.path(new PathArray(`M ${x} ${y} l ${dx1} ${dy1} l ${dx2} ${dy2} l ${dx3} ${dy3} Z`));
    }

    public drawWindDirectionText(coord: Coordinate, text: string, rotateDegrees: number, color: string, size: number): SVG.Text {
        var textElement = this.drawText2(coord.x, coord.y, text,  TextAttributes.windBarAttribute(color, size, "central", "middle"));
        this.rotate(textElement, rotateDegrees, coord);
        return textElement;
    }

    public getLengthLongest(texts: string[], size: number): number {
        const lenghts: number[] = [];
        texts.forEach(text => {
            if (text) {
                lenghts.push(this.getTextLength(text, size));
            }
        });
        return this.getMax(lenghts);
    }

    private getMax(values: number[]): number {
        if (values.length === 0) {
            throw new Error("List to get max from is empty.");
        }
        return values.reduce((prev, current) => (prev > current) ? prev : current);
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

    public drawText2(x: number, y: number, text: string, attributes: TextAttributes): SVG.Text {
        return this.svg.plain(text).dmove(x, y).attr(attributes);
    }
}
