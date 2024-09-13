import {Coordinate} from "./Coordinate";

export class RectCoordinates {

    constructor(
       public readonly startPoint: Coordinate,
       public readonly width: number,
       public readonly height: number) {
    }
}
