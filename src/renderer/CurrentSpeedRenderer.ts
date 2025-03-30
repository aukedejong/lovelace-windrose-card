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

        this.arrowStartX = this.dimensionCalculator.barStartX(this.barIndex);
        this.arrowStartY = this.dimensionCalculator.barStartY(this.barIndex);
        if (this.config.windspeedBarLocation === 'bottom') {
            this.arrowStartY -= 20;
        } else {
            this.arrowStartX -= 20;
        }
    }

    drawCurrentSpeed(currentSpeed: number | undefined, redraw: boolean): void {
        if (!this.initDone) {
            return;
        }
        if (redraw || !this.arrowElement) {
            this.drawArrow();
        }
        console.log('Draw current speed', currentSpeed);
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
                    transform = { position: { x: arrowPos, y: this.arrowStartY }, rotate: -90 };
                } else {
                    transform = { position: { x: arrowPos, y: this.arrowStartY } };
                }
            } else {
                if (currentSpeed > this.segmentPositions[rangeIndex].maxSpeed) {
                    transform = { position: { x: this.arrowStartX, y: arrowPos }, rotate: -90 };
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
            this.arrowElement = this.svgUtil.drawArrowBottom(this.arrowStartX, this.arrowStartY, 40);
        } else {
            this.arrowElement = this.svgUtil.drawArrowRight(this.arrowStartX, this.arrowStartY, 40);
        }
        this.arrowElement.attr({
            stroke: this.config.cardColor.roseCurrentDirectionArrow,
            fill: this.config.cardColor.roseCurrentDirectionArrow
        });
    }
}
