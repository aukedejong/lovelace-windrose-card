import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {SvgUtil} from "./SvgUtil";
import SVG, {Svg} from "@svgdotjs/svg.js";
import {SpeedRangeService} from "../speed-range/SpeedRangeService";
import {WindRoseData} from "./WindRoseData";
import {WindBarRangeCalcUtil} from "../render-bar/WindBarRangeCalcUtil";
import {SegmentPosition} from "../render-bar/SegmentPosition";
import {WindSpeedEntity} from "../config/WindSpeedEntity";
import {DimensionCalculator} from "../dimensions/DimensionCalculator";

export class CurrentSpeedRenderer {

    private readonly config: CardConfigWrapper;
    private readonly windSpeedEntityConfig: WindSpeedEntity;
    private readonly dimensionCalculator: DimensionCalculator;
    private readonly speedRangeService: SpeedRangeService;
    private readonly barIndex: number;
    private svgUtil!: SvgUtil;
    private arrowStartX: number = 0;
    private arrowStartY: number = 0;
    private initDone = false;
    private segmentPositions: SegmentPosition[] = [];
    private readonly positionMinus: boolean;
    private readonly arrowSize: number;
    private readonly arrowNameSide: boolean;
    private readonly maxRotation: number;

    private arrowElement: SVG.Path | undefined = undefined;

    constructor(config: CardConfigWrapper,
                windSpeedEntityConfig: WindSpeedEntity,
                dimensionCalculator: DimensionCalculator,
                speedRangeService: SpeedRangeService,
                positionIndex: number,
                svg: Svg) {
        this.config = config;
        this.windSpeedEntityConfig = windSpeedEntityConfig;
        this.svgUtil = new SvgUtil(svg);
        this.dimensionCalculator = dimensionCalculator;
        this.speedRangeService = speedRangeService;
        this.barIndex = positionIndex;
        this.positionMinus = config.windspeedBarLocation !== 'bottom';
        this.arrowSize = this.windSpeedEntityConfig.currentSpeedArrowSize;
        this.arrowNameSide = this.windSpeedEntityConfig.currentSpeedArrowLocation === 'left' ||
            this.windSpeedEntityConfig.currentSpeedArrowLocation === 'above';
        if (this.arrowNameSide) {
            this.maxRotation = -90;
        } else {
            this.maxRotation = 90;
        }
    }

    getBarIndex(): number {
        return this.barIndex;
    }

    initScale(windBarData:  WindRoseData) {
        const segmentCount = WindBarRangeCalcUtil.determineSegmentCount(windBarData.speedRangePercentages, this.windSpeedEntityConfig.windspeedBarFull);
        let barStart = this.dimensionCalculator.barStart();
        let barLength = this.dimensionCalculator.barLength();
        if (this.windSpeedEntityConfig.renderRelativeScale) {
            this.segmentPositions = WindBarRangeCalcUtil.calcRelativeSegments(this.speedRangeService.getSpeedRanges(), barStart, barLength, this.positionMinus, segmentCount);
        } else {
            this.segmentPositions = WindBarRangeCalcUtil.calcFixedSizeSegments(this.speedRangeService.getSpeedRanges(), barStart, barLength, this.positionMinus, segmentCount);
        }
        this.initDone = true;

        if (this.config.windspeedBarLocation === 'bottom') {
            this.arrowStartX = this.dimensionCalculator.barStartX(this.barIndex);
            if (this.arrowNameSide) {
                this.arrowStartY = this.dimensionCalculator.barStartY(this.barIndex) - (this.arrowSize / 2);
            } else {
                this.arrowStartY = this.dimensionCalculator.barStartY(this.barIndex) +
                    this.dimensionCalculator.barHeight(this.barIndex) + (this.arrowSize / 2);
            }
        } else { // location = right
            this.arrowStartY = this.dimensionCalculator.barStartY(this.barIndex);
            if (this.arrowNameSide) {
                this.arrowStartX = this.dimensionCalculator.barStartX(this.barIndex) - (this.arrowSize / 2);
            } else {
                this.arrowStartX = this.dimensionCalculator.barStartX(this.barIndex) +
                    this.dimensionCalculator.barWidth(this.barIndex) + (this.arrowSize / 2);
            }
        }
    }

    drawCurrentSpeed(currentSpeed: number | undefined): void {
        if (!this.initDone) {
            return;
        }
        if (!this.arrowElement) {
            this.drawArrow();
        }
        let arrowPos = 0;
        if (currentSpeed || currentSpeed === 0) {
            let rangeIndex = this.speedRangeService.determineSpeedRangeIndex(currentSpeed);
            if (rangeIndex > this.segmentPositions.length - 1) {
                rangeIndex = this.segmentPositions.length - 1;
            }
            arrowPos = this.segmentPositions[rangeIndex].calcPosition(currentSpeed, this.positionMinus);

            //Animate arrow.
            let transform;
            if (this.config.windspeedBarLocation === 'bottom') {
                if (currentSpeed > this.segmentPositions[rangeIndex].maxSpeed) {
                    transform = { position: { x: arrowPos - (this.arrowSize / 2), y: this.arrowStartY }, rotate: this.maxRotation };
                } else {
                    transform = { position: { x: arrowPos, y: this.arrowStartY } };
                }
            } else {
                if (currentSpeed > this.segmentPositions[rangeIndex].maxSpeed) {
                    transform = { position: { x: this.arrowStartX, y: arrowPos }, rotate: this.maxRotation };
                } else {
                    transform = { position: { x: this.arrowStartX, y: arrowPos } };
                }
            }
            this.arrowElement!.animate(700, 0, 'now')
                .transform(transform)
                .ease('<>');
        }
    }

    private drawArrow() {
        if (this.config.windspeedBarLocation === 'bottom') {
            if (this.arrowNameSide) {
                this.arrowElement = this.svgUtil.drawArrowDown(this.arrowStartX, this.arrowStartY, this.arrowSize);
            } else {
                this.arrowElement = this.svgUtil.drawArrowUp(this.arrowStartX, this.arrowStartY, this.arrowSize);
            }
        } else { // location = right
            if (this.arrowNameSide) {
                this.arrowElement = this.svgUtil.drawArrowRight(this.arrowStartX, this.arrowStartY, this.arrowSize);
            } else {
                this.arrowElement = this.svgUtil.drawArrowLeft(this.arrowStartX, this.arrowStartY, this.arrowSize);
            }
        }
        this.arrowElement.attr({
            stroke: this.config.cardColor.roseCurrentDirectionArrow,
            fill: this.config.cardColor.roseCurrentDirectionArrow
        });
    }
}
