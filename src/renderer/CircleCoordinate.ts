import {Coordinate} from "./Coordinate";

export class CircleCoordinate {
    constructor(
        public readonly centerPoint: Coordinate,
        public readonly radius: number) {
    }
}
