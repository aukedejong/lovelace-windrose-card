import {WindRoseDimensions} from "../dimensions/WindRoseDimensions";
import {WindRoseData} from "./WindRoseData";

export interface WindRoseRenderer {

    updateDimensions(dimensions: WindRoseDimensions): void;

    drawWindRose(windRoseData: WindRoseData, canvasContext: CanvasRenderingContext2D): void;
}