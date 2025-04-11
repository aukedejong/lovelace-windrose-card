import {WindRoseData} from "./WindRoseData";

export interface WindRoseRenderer {

    drawEmptyWindrose(): void;

    drawWindRose(windRoseData: WindRoseData): void;

    animateRemoveGraphs(): boolean;

    removeGraphs(): void;

    rotateWindRose(): void;
}
