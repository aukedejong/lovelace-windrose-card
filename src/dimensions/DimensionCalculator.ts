import {RectCoordinates} from "../renderer/RectCoordinates";
import {Coordinate} from "../renderer/Coordinate";
import {LineCoordinates} from "../renderer/LineCoordinates";
import {CircleCoordinate} from "../renderer/CircleCoordinate";
import {WindRoseData} from "../renderer/WindRoseData";

export interface DimensionCalculator {

    readonly roseRadius: number;

    updateLabelLengths(windRoseData: WindRoseData[]): void;

    barStart(): number;

    barLength(): number;

    barWidth(positionIndex: number): number;

    barHeight(positionIndex: number): number;

    barLabelX(positionIndex: number): number;

    barLabelY(positionIndex: number): number;

    barStartX(positionIndex: number): number;

    barStartY(positionIndex: number): number;

    barSpeedLabelX(positionIndex: number): number;

    barSpeedLabelY(positionIndex: number): number;

    barPercLabelX(positionIndex: number): number;

    barPercLabelY(positionIndex: number): number;

    touchFaceBar(positionIndex: number): RectCoordinates;

    viewBox(): string;

    // WindRose

    roseCenter(): Coordinate;

    crossHorizontalLine(): LineCoordinates;

    crossVerticalLine(): LineCoordinates;

    roseCircle(radius: number): CircleCoordinate;

    north(): Coordinate;

    east(): Coordinate;

    south(): Coordinate;

    west(): Coordinate;

    northEast(): Coordinate;

    northWest(): Coordinate;

    southEast(): Coordinate;

    southWest(): Coordinate;

    northNorthEast(): Coordinate;

    eastNorthEast(): Coordinate;

    eastSouthEast(): Coordinate;

    southSouthEast(): Coordinate;

    northNorthWest(): Coordinate;

    westNorthWest(): Coordinate;

    westSouthWest(): Coordinate;

    southSouthWest(): Coordinate;

    infoCornerLeftTop(): Coordinate;

    infoCornerRightTop(): Coordinate;

    infoCornetLeftBottom(): Coordinate;

    infoCornetRightBottom(): Coordinate;

    infoCornerLabelLeftTop(): Coordinate;

    infoCornerLabelRightTop(): Coordinate;

    infoCornetLabelLeftBottom(): Coordinate;

    infoCornetLabelRightBottom(): Coordinate;
}
