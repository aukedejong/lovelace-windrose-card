import {WindRoseRendererStandaard} from "./WindRoseRendererStandaard";
import {WindBarRenderer} from "../render-bar/WindBarRenderer";
import {PercentageCalculator} from "./PercentageCalculator";
import {WindSpeedConverter} from "../converter/WindSpeedConverter";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {MeasurementCounter} from "../counter/MeasurementCounter";
import {WindRoseData} from "./WindRoseData";
import {WindRoseRendererCenterCalm} from "./WindRoseRendererCenterCalm";
import {PercentageCalculatorCenterCalm} from "./PercentageCalculatorCenterCalm";
import {WindRoseRenderer} from "./WindRoseRenderer";
import {CurrentDirectionRenderer} from "./CurrentDirectionRenderer";
import {DegreesCalculator} from "./DegreesCalculator";
import {Log2} from "../util/Log2";
import {EntityStatesProcessor} from "../entity-state-processing/EntityStatesProcessor";
import {InfoCornersRenderer} from "./InfoCornersRenderer";
import {Element, Svg} from "@svgdotjs/svg.js";
import {TouchFacesRenderer} from "./TouchFacesRenderer";
import {SpeedUnit} from "../converter/SpeedUnit";
import {SpeedUnits} from "../converter/SpeedUnits";
import {SpeedRangeService} from "../speed-range/SpeedRangeService";
import {HAMeasurementProvider} from "../measurement-provider/HAMeasurementProvider";
import {MeasurementHolder} from "../measurement-provider/MeasurementHolder";
import {MeasurementMatcher} from "../matcher/MeasurementMatcher";
import {CurrentSpeedRenderer} from "./CurrentSpeedRenderer";
import {DimensionCalculator} from "../dimensions/DimensionCalculator";
import {DimensionCalculatorBarHidden} from "../dimensions/DimensionCalculatorBarHidden";
import {SvgUtil} from "./SvgUtil";
import {DimensionCalculatorBarRight} from "../dimensions/DimensionCalculatorBarRight";
import {DimensionCalculatorBarBottom} from "../dimensions/DimensionCalculatorBarBottom";

export class WindRoseDirigent {
    //Util
    private readonly log = new Log2("WindRoseDirigent");

    //Config
    private cardConfig!: CardConfigWrapper;

    //Measurements
    private measurementProvider!: HAMeasurementProvider;
    private measurementMatcher!: MeasurementMatcher;
    private entityStatesProcessor!: EntityStatesProcessor;
    private percentageCalculator!: PercentageCalculator;
    public infoText: string = '';

    //For every windspeed entity
    private measurementCounters: MeasurementCounter[] = [];
    private outputSpeedUnits: SpeedUnit[] = [];
    private speedRangeServices: SpeedRangeService[] = [];

    //Rendering
    private degreesCalculator!: DegreesCalculator;
    private dimensionCalculator!: DimensionCalculator;
    private windRoseRenderer!: WindRoseRenderer;
    private windBarRenderers: WindBarRenderer[] = [];
    private currentDirectionRenderer!: CurrentDirectionRenderer;
    private currentSpeedRenderers: CurrentSpeedRenderer[] = [];
    private infoCornersRendeerer!: InfoCornersRenderer;
    private touchFacesRenderer!: TouchFacesRenderer;

    //Calculated data
    private windRoseData: WindRoseData[] = [];

    private readonly svg: Svg;
    private svgUtil!: SvgUtil;
    private backgroundElement: Element | undefined;
    private readonly sendEvent: (event: CustomEvent) => void;
    private initReady = false;
    private measurementsReady = false;

    constructor(svg: Svg, sendEvent: (event: CustomEvent) => void) {
        this.svg = svg;
        this.sendEvent = sendEvent;
    }

    init(cardConfig: CardConfigWrapper,
         measurementProvider: HAMeasurementProvider,
         entityStatesProcessor: EntityStatesProcessor): void {

        this.log.debug("init()");
        this.initReady = true;
        this.measurementsReady = false;
        this.cardConfig = cardConfig;
        this.measurementProvider = measurementProvider;
        this.measurementMatcher = new MeasurementMatcher(cardConfig);
        this.svgUtil = new SvgUtil(this.svg);
        this.entityStatesProcessor = entityStatesProcessor;

        for (const windSpeedEntity of this.cardConfig.windspeedEntities) {
            const outputSpeedUnit = SpeedUnits.getSpeedUnit(windSpeedEntity.outputSpeedUnit);
            const speedRangeService = new SpeedRangeService(outputSpeedUnit, windSpeedEntity);
            this.outputSpeedUnits.push(outputSpeedUnit);
            this.speedRangeServices.push(speedRangeService);

            const windSpeedConverter = new WindSpeedConverter(outputSpeedUnit);
            this.measurementCounters.push(new MeasurementCounter(cardConfig, windSpeedConverter, speedRangeService));
        }

        if (this.cardConfig.hideWindspeedBar) {
            this.dimensionCalculator = new DimensionCalculatorBarHidden(cardConfig.directionLabels, cardConfig.cornersInfo, this.svgUtil);
        } else if (this.cardConfig.windspeedBarLocation === 'right') {
            this.dimensionCalculator = new DimensionCalculatorBarRight(cardConfig.directionLabels, this.speedRangeServices, this.cardConfig.windspeedEntities, cardConfig.cornersInfo, this.svgUtil);
        } else if (this.cardConfig.windspeedBarLocation === 'bottom') {
            this.dimensionCalculator = new DimensionCalculatorBarBottom(cardConfig.directionLabels, cardConfig.windspeedEntities, cardConfig.cornersInfo, this.svgUtil);
        }

        this.degreesCalculator = new DegreesCalculator(cardConfig.windRoseDrawNorthOffset, cardConfig.compassConfig.autoRotate,
            cardConfig.compassConfig.asHeading, cardConfig.currentDirection.hideDirectionBelowSpeed);

        this.touchFacesRenderer = new TouchFacesRenderer(cardConfig, this.dimensionCalculator, this.sendEvent, this.svg);

        if (this.cardConfig.centerCalmPercentage) {
            this.percentageCalculator = new PercentageCalculatorCenterCalm();
            this.windRoseRenderer = new WindRoseRendererCenterCalm(cardConfig, this.dimensionCalculator, this.speedRangeServices[0], this.svg, this.degreesCalculator);
        } else {
            this.percentageCalculator = new PercentageCalculator();
            this.windRoseRenderer = new WindRoseRendererStandaard(cardConfig, this.dimensionCalculator, this.speedRangeServices[0], this.svg, this.degreesCalculator);
        }
        if (this.cardConfig.currentDirection.showArrow) {
            this.currentDirectionRenderer = new CurrentDirectionRenderer(cardConfig, this.dimensionCalculator, this.svg);
        }
        if (this.cardConfig.cornersInfo.isCornerInfoSet()) {
            this.infoCornersRendeerer = new InfoCornersRenderer(cardConfig.cornersInfo, this.dimensionCalculator, this.svg);
        }

        this.windBarRenderers = [];
        if (!cardConfig.hideWindspeedBar) {
            for (let i = 0; i < cardConfig.windBarCount(); i++) {
                this.windBarRenderers.push(new WindBarRenderer(this.cardConfig, this.dimensionCalculator, this.outputSpeedUnits[i], this.speedRangeServices[i], i, this.svg));
                if (cardConfig.windspeedEntities[i].currentSpeedArrow) {
                    this.currentSpeedRenderers.push(new CurrentSpeedRenderer(cardConfig, cardConfig.windspeedEntities[i], this.dimensionCalculator, this.speedRangeServices[i], i, this.svg));
                }
            }
        }

        this.windRoseData = [];
    }

    refreshData(): Promise<boolean> {
        if (this.initReady) {
            this.log.debug('refreshData()');
            return this.measurementProvider.getMeasurements().then((measurementHolder: MeasurementHolder) => {
                this.windRoseData = [];
                const matchedGroups = this.measurementMatcher.match(measurementHolder);
                for (let i = 0; i < matchedGroups.length; i++) {
                    this.measurementCounters[i].init(this.cardConfig.windspeedEntities[i].speedUnit, matchedGroups[i].getAverageSpeed());
                    for (const measurement of matchedGroups[i].getMeasurements()) {
                        this.measurementCounters[i].addWindMeasurements(measurement.direction, measurement.speed, measurement.seconds);
                    }
                    const windCounts = this.measurementCounters[i].getMeasurementCounts();
                    this.windRoseData.push(this.percentageCalculator.calculate(windCounts));
                }
                this.dimensionCalculator.updateLabelLengths(this.windRoseData);
                this.measurementsReady = true;

                if (this.cardConfig.dataPeriod.logMeasurementCounts) {
                    console.log(`Measurements:\n${measurementHolder.getInfoText()}${matchedGroups[0].getInfo()} - strategy: ${this.cardConfig.matchingStrategy}`);
                }
                return Promise.resolve(true);
            });
        } else {
            this.log.debug('refreshData() ignored, not inited yet');
            return Promise.resolve(false);
        }
    }

    render(): void {
        this.svg.clear();
        if (this.initReady && this.measurementsReady) {
            this.log.debug('render()', this.svg, this.windRoseData, this.windBarRenderers);
            this.windRoseRenderer.drawWindRose(this.windRoseData[0]);
            for (let i = 0; i < this.windBarRenderers.length; i++) {
                this.windBarRenderers[i].drawWindBar(this.windRoseData[i]);
            }
            for(const currentSpeedRenderer of this.currentSpeedRenderers) {
                const barIndex = currentSpeedRenderer.getBarIndex();
                currentSpeedRenderer.initScale(this.windRoseData[barIndex]);
                currentSpeedRenderer.drawCurrentSpeed(this.entityStatesProcessor.getWindSpeed(barIndex), true);
            }
            this.currentDirectionRenderer?.drawCurrentWindDirection(this.degreesCalculator.getWindDirectionRenderDegrees(), true);
            this.infoCornersRendeerer?.drawCornerLabel();
            this.infoCornersRendeerer?.drawCornerValues(this.entityStatesProcessor.getCornerInfoStates());
            this.touchFacesRenderer.renderTouchFaces();
            if (this.cardConfig.backgroundImage !== undefined) {
                this.backgroundElement = this.svg.image(this.cardConfig.backgroundImage)
                    .size(1000, 1000)
                    .move(this.dimensionCalculator.roseCenter().x - 500, this.dimensionCalculator.roseCenter().y - 500)
                    .back();
            }
        } else {
            this.log.debug("render(): Could not render, init or measurements not ready yet " + this.initReady + " - "  + this.measurementsReady);
        }
    }

    updateRender(): void {
        for (const currentSpeedRenderer of this.currentSpeedRenderers) {
            if (this.entityStatesProcessor.hasWindSpeedUpdate(currentSpeedRenderer.getBarIndex())) {
                currentSpeedRenderer.drawCurrentSpeed(this.entityStatesProcessor.getWindSpeed(currentSpeedRenderer.getBarIndex()), false);
            }
        }
        if (this.entityStatesProcessor.hasWindDirectionUpdate() || this.entityStatesProcessor.hasWindSpeedUpdate(0)) {
            this.degreesCalculator.setWindDirectionDegrees(this.entityStatesProcessor.getWindDirection());
            this.degreesCalculator.setWindSpeed(this.entityStatesProcessor.getWindSpeed(0));
            this.currentDirectionRenderer.drawCurrentWindDirection(this.degreesCalculator.getWindDirectionRenderDegrees(), false);
        }
        if (this.entityStatesProcessor.hasCompassDirectionUpdate()) {
            this.degreesCalculator.setCompassDegrees(this.entityStatesProcessor.getCompassDirection());
            this.currentDirectionRenderer.drawCurrentWindDirection(this.degreesCalculator.getWindDirectionRenderDegrees(), false);
            this.windRoseRenderer.rotateWindRose();
        }
        if (this.entityStatesProcessor.hasCornerInfoUpdates()) {
            this.infoCornersRendeerer.updateCornerValues(this.entityStatesProcessor.getCornerInfoStates());
        }
        this.backgroundElement?.back();
    }
}
