import {WindRoseRendererStandaard} from "./WindRoseRendererStandaard";
import {WindBarRenderer} from "./WindBarRenderer";
import {PercentageCalculator} from "./PercentageCalculator";
import {WindSpeedConverter} from "../converter/WindSpeedConverter";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindRoseConfigFactory} from "../config/WindRoseConfigFactory";
import {MeasurementCounter} from "../counter/MeasurementCounter";
import {WindRoseData} from "./WindRoseData";
import {WindRoseRendererCenterCalm} from "./WindRoseRendererCenterCalm";
import {PercentageCalculatorCenterCalm} from "./PercentageCalculatorCenterCalm";
import {WindRoseRenderer} from "./WindRoseRenderer";
import {HomeAssistantMeasurementProvider} from "../measurement-provider/HomeAssistantMeasurementProvider";
import {DimensionConfig} from "./DimensionConfig";
import {CurrentDirectionRenderer} from "./CurrentDirectionRenderer";
import {DegreesCalculator} from "./DegreesCalculator";
import {Log2} from "../util/Log2";
import {EntityStatesProcessor} from "../entity-state-processing/EntityStatesProcessor";
import {InfoCornersRenderer} from "./InfoCornersRenderer";
import {Svg} from "@svgdotjs/svg.js";
import {TouchFacesRenderer} from "./TouchFacesRenderer";
import {MatchedMeasurements} from "../matcher/MatchedMeasurements";

export class WindRoseDirigent {
    //Util
    private readonly log = new Log2("WindRoseDirigent");
    private windSpeedConverters: WindSpeedConverter[] = [];

    //Config
    private configFactory!: WindRoseConfigFactory;
    private cardConfig!: CardConfigWrapper;

    //Measurements
    private measurementProvider!: HomeAssistantMeasurementProvider;
    private entityStatesProcessor!: EntityStatesProcessor;
    private measurementCounters: MeasurementCounter[] = [];
    private percentageCalculator!: PercentageCalculator;

    //Rendering
    private degreesCalculator!: DegreesCalculator;
    private dimensionConfig!: DimensionConfig;
    private windRoseRenderer!: WindRoseRenderer;
    private windBarRenderers: WindBarRenderer[] = [];
    private currentDirectionRenderer!: CurrentDirectionRenderer;
    private infoCornersRendeerer!: InfoCornersRenderer;
    private touchFacesRenderer!: TouchFacesRenderer;

    //Calculated data
    private windRoseData: WindRoseData[] = [];

    private readonly svg: Svg;
    private readonly sendEvent: (event: CustomEvent) => void;
    private initReady = false;
    private measurementsReady = false;

    constructor(svg: Svg, sendEvent: (event: CustomEvent) => void) {
        this.svg = svg;
        this.sendEvent = sendEvent;
    }

    init(cardConfig: CardConfigWrapper,
         measurementProvider: HomeAssistantMeasurementProvider,
         entityStatesProcessor: EntityStatesProcessor): void {

        this.log.debug("init()");
        this.initReady = true;
        this.measurementsReady = false;
        this.cardConfig = cardConfig;
        this.measurementProvider = measurementProvider;
        this.entityStatesProcessor = entityStatesProcessor;
        this.configFactory = new WindRoseConfigFactory(cardConfig);
        const windRoseConfig = this.configFactory.createWindRoseConfig();

        for (const windSpeedEntity of this.cardConfig.windspeedEntities) {
            const windSpeedConverter = new WindSpeedConverter(windSpeedEntity.outputSpeedUnit,
                windSpeedEntity.speedRangeBeaufort,  windSpeedEntity.speedRangeStep, windSpeedEntity.speedRangeMax,
                windSpeedEntity.speedRanges)
            this.windSpeedConverters.push(windSpeedConverter);
            this.measurementCounters.push(new MeasurementCounter(windRoseConfig, windSpeedConverter));
        }

        this.dimensionConfig = new DimensionConfig(cardConfig.windBarCount(), cardConfig.windspeedBarLocation, cardConfig.cardinalDirectionLetters, this.svg);
        this.degreesCalculator = new DegreesCalculator(cardConfig.windRoseDrawNorthOffset, cardConfig.compassConfig.autoRotate);

        this.touchFacesRenderer = new TouchFacesRenderer(cardConfig, this.dimensionConfig, this.sendEvent, this.svg);

        if (this.cardConfig.centerCalmPercentage) {
            this.percentageCalculator = new PercentageCalculatorCenterCalm();
            this.windRoseRenderer = new WindRoseRendererCenterCalm(windRoseConfig, this.dimensionConfig, this.windSpeedConverters[0].getSpeedRanges(), this.svg, this.degreesCalculator);
        } else {
            this.percentageCalculator = new PercentageCalculator();
            this.windRoseRenderer = new WindRoseRendererStandaard(windRoseConfig, this.dimensionConfig, this.windSpeedConverters[0].getSpeedRanges(), this.svg, this.degreesCalculator);
        }
        if (this.cardConfig.currentDirection.showArrow) {
            this.currentDirectionRenderer = new CurrentDirectionRenderer(windRoseConfig, this.dimensionConfig, this.svg);
        }
        if (this.cardConfig.cornersInfo.isCornerInfoSet()) {
            this.infoCornersRendeerer = new InfoCornersRenderer(windRoseConfig, this.dimensionConfig, this.svg);
        }

        this.windBarRenderers = [];
        if (!cardConfig.hideWindspeedBar) {
            const barConfigs = this.configFactory.createWindBarConfigs();
            for (let i = 0; i < cardConfig.windBarCount(); i++) {
                this.windBarRenderers.push(new WindBarRenderer(barConfigs[i], this.dimensionConfig, this.windSpeedConverters[i].getOutputSpeedUnit(), i, this.svg));
            }
        }

        this.windRoseData = [];
    }

    refreshData(): Promise<boolean> {
        if (this.initReady) {
            this.log.debug('refreshData()');
            return this.measurementProvider.getMeasurements().then((matchedGroups: MatchedMeasurements[]) => {
                this.windRoseData = [];
                this.log.debug('Matched measurements:', matchedGroups);
                for (let i = 0; i < matchedGroups.length; i++) {
                    this.measurementCounters[i].init(this.cardConfig.windspeedEntities[i].speedUnit);
                    for (const measurement of matchedGroups[i].getMeasurements()) {
                        this.measurementCounters[i].addWindMeasurements(measurement.direction, measurement.speed, measurement.seconds);
                    }
                    const windCounts = this.measurementCounters[i].getMeasurementCounts();
                    this.windRoseData.push(this.percentageCalculator.calculate(windCounts));
                }
                this.measurementsReady = true;
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
            if (this.cardConfig.backgroundImage !== undefined) {
                this.svg.image(this.cardConfig.backgroundImage)
                    .size(1000, 1000)
                    .move(this.dimensionConfig.marginLeft, this.dimensionConfig.marginTop);
            }
            this.windRoseRenderer.drawWindRose(this.windRoseData[0]);
            for (let i = 0; i < this.windBarRenderers.length; i++) {
                this.windBarRenderers[i].drawWindBar(this.windRoseData[i]);
            }
            this.currentDirectionRenderer?.drawCurrentWindDirection(this.degreesCalculator.getWindDirectionRenderDegrees(), true);
            this.infoCornersRendeerer?.drawCornerLabel();
            this.infoCornersRendeerer?.drawCornerValues(this.entityStatesProcessor.getCornerInfoStates());
            this.touchFacesRenderer.renderTouchFaces();
        } else {
            this.log.error("render(): Could not render, init or measurements not ready " + this.initReady + " - "  + this.measurementsReady);
        }
    }

    updateRender(): void {
        if (this.entityStatesProcessor.hasWindDirectionUpdate()) {
            this.degreesCalculator.setWindDirectionDegrees(this.entityStatesProcessor.getWindDirection());
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
    }
}
