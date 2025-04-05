import {RectCoordinates} from "../renderer/RectCoordinates";
import {DimensionCalculatorWindRose} from "./DImensionCalculatorWindRose";
import {DimensionCalculator} from "./DimensionCalculator";
import {DirectionLabels} from "../config/DirectionLabels";
import {WindSpeedEntity} from "../config/WindSpeedEntity";
import {CornersInfo} from "../config/CornersInfo";
import {SvgUtil} from "../renderer/SvgUtil";

export class DimensionCalculatorBarBottom extends DimensionCalculatorWindRose implements DimensionCalculator {

    readonly barWidth2: number;
    readonly barMarginLeft: number = 0;
    readonly barMarginRight: number = 0;
    readonly barBlockMarginTop: number = 20;
    readonly barLabelMargin: number = 10;
    readonly barLabelTextSpace: number[];
    readonly barSpeedTextSpace: number[];
    readonly barPercentageTextSpace: number[];
    readonly multiBarSpacing: number = 15;

    readonly barCount: number;
    readonly cardCompleteHeight: number;

    constructor(readonly directionLabels: DirectionLabels,
                readonly windspeedEntities: WindSpeedEntity[],
                readonly cornersInfo: CornersInfo,
                readonly svgUtil: SvgUtil) {

        super(directionLabels, cornersInfo, svgUtil);

        this.barLabelTextSpace = windspeedEntities.map(config => config.barLabelTextSize);
        this.barSpeedTextSpace = windspeedEntities.map(config => config.barSpeedTextSize);
        this.barPercentageTextSpace = windspeedEntities.map(config => config.barPercentageTextSize);
        this.barCount = this.windspeedEntities.length;
        this.cardCompleteHeight = this.barStartY(this.barCount - 1) + this.barPercentageTextSpace[this.barCount - 1] + 5 + this.barSpeedTextSpace[this.barCount - 1];
        this.barWidth2 = this.roseCompleteWidth - (this.barMarginLeft + this.barMarginRight);
    }

    updateLabelLengths(): void {
    }

    barLength(): number {
        return this.barWidth2;
    }

    barStart(): number {
        return this.barMarginLeft;
    }

    barWidth(): number {
        return this.barWidth2;
    }

    barHeight(positionIndex: number): number {
        return this.barPercentageTextSpace[positionIndex] + 5
    }

    viewBox(): string {
        return "0 0 " + this.roseCompleteWidth + " " + (this.cardCompleteHeight + 5);
    }

    barStartX(): number {
        return this.barMarginLeft;
    }

    barStartY(positionIndex: number): number {
        var top = this.roseCompleteHeight + this.barBlockMarginTop + this.barLabelTextSpace[0] + this.barLabelMargin
        for (let index = 0; index < positionIndex; index++) {
            top += this.barHeight(index) + this.barSpeedTextSpace[index] + this.multiBarSpacing + this.barLabelTextSpace[index + 1] + this.barLabelMargin;
        }
        return top;
    }

    barLabelX(): number {
        return this.barMarginLeft;
    }

    barLabelY(positionIndex: number): number {
        return this.barStartY(positionIndex) - (this.barLabelTextSpace[positionIndex] * 0.3);
    }

    barSpeedLabelX(): number {
        return this.barMarginLeft;
    }

    barSpeedLabelY(positionIndex: number): number {
        return this.barStartY(positionIndex) + this.barHeight(positionIndex) + this.barLabelMargin;
    }

    touchFaceBar(positionIndex: number): RectCoordinates {
        return new RectCoordinates(
            this.barStartX(),
            this.barStartY(positionIndex) - this.barLabelTextSpace[positionIndex],
            this.barWidth2,
            this.barLabelTextSpace[0] + this.barLabelMargin + this.barHeight(positionIndex) + this.barSpeedTextSpace[positionIndex]);
    }

}
