import {WindRoseData} from "./WindRoseData";

export interface WindRoseRenderer {

    drawWindRose(windRoseData: WindRoseData): void;
}
