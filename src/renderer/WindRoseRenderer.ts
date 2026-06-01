import { WindRoseData } from "./WindRoseData";
import { Element } from "@svgdotjs/svg.js";
import { SpeedRangeService } from "../speed-range/SpeedRangeService";

export interface WindRoseRenderer {

    drawEmptyWindrose(): void;

    drawWindRose(windRoseData: WindRoseData, speedRangeService: SpeedRangeService, animate: boolean): void;

    drawBackgroundImage(): Element | undefined;

    animateRemoveGraphs(): boolean;

    removeGraphs(): void;

    rotateWindRose(): void;
}
