import {DimensionCalculatorWindRose} from "./DImensionCalculatorWindRose";
import {DimensionCalculator} from "./DimensionCalculator";
import {RectCoordinates} from "../renderer/RectCoordinates";

export class DimensionCalculatorBarHidden extends DimensionCalculatorWindRose implements DimensionCalculator {

    updateLabelLengths(): void {
    }

    viewBox(): string {
        return "0 0 " + this.roseCompleteWidth + " " + this.roseCompleteHeight;
    }

    barStartX(): number {
        throw new Error("NOOP");
    }

    barStartY(): number {
        throw new Error("NOOP");
    }

    barLabelX(): number {
        throw new Error("NOOP");
    }

    barLabelY(): number {
        throw new Error("NOOP");
    }

    barSpeedLabelX(): number {
        throw new Error("NOOP");
    }

    barSpeedLabelY(): number {
        throw new Error("NOOP");
    }

    touchFaceBar(): RectCoordinates {
        throw new Error("NOOP");
    }

    barLength(): number {
        throw new Error("NOOP");
    }

    barStart(): number {
        throw new Error("NOOP");
    }

    barWidth(): number {
        throw new Error("NOOP");
    }

    barHeight(): number {
        throw new Error("NOOP");
    }

}
