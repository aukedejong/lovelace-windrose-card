import {WindRoseData} from "./WindRoseData";
import {Element} from "@svgdotjs/svg.js";

export interface WindRoseRenderer {

    drawEmptyWindrose(): void;

    drawWindRose(windRoseData: WindRoseData, animate: boolean): void;

    drawBackgroundImage(): Element | undefined;

    animateRemoveGraphs(): boolean;

    removeGraphs(): void;

    rotateWindRose(): void;
}
