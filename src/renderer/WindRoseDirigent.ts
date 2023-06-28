import {WindRoseRendererStandaard} from "./WindRoseRendererStandaard";
import {WindBarRenderer} from "./WindBarRenderer";
import {PercentageCalculator} from "./PercentageCalculator";
import {WindSpeedConverter} from "../converter/WindSpeedConverter";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindRoseConfigFactory} from "../config/WindRoseConfigFactory";
import {DimensionsCalculator} from "../dimensions/DimensionsCalculator";
import {MeasurementCounter} from "../counter/MeasurementCounter";
import {WindRoseData} from "./WindRoseData";
import {Log} from "../util/Log";
import {WindRoseRendererCenterCalm} from "./WindRoseRendererCenterCalm";
import {PercentageCalculatorCenterCalm} from "./PercentageCalculatorCenterCalm";
import {WindRoseRenderer} from "./WindRoseRenderer";
import {HomeAssistantMeasurementProvider} from "../measurement-provider/HomeAssistantMeasurementProvider";

export class WindRoseDirigent {
    //Util
    private windSpeedConverter!: WindSpeedConverter;

    //Config
    private configFactory!: WindRoseConfigFactory;
    private cardConfig!: CardConfigWrapper;

    //Measurements
    private measurementProvider!: HomeAssistantMeasurementProvider;
    private measurementCounter!: MeasurementCounter;
    private percentageCalculator!: PercentageCalculator;

    //Rendering
    private dimensionCalculator!: DimensionsCalculator;
    private windRoseRenderer!: WindRoseRenderer;
    private windBarRenderers: WindBarRenderer[] = [];

    //Calculated data
    private windRoseData: WindRoseData[] = [];

    private initReady = false;
    private dimensionsReady = false;
    private measurementsReady = false;

    init(cardConfig: CardConfigWrapper, measurementProvider: HomeAssistantMeasurementProvider): void {
        this.initReady = true;
        this.dimensionsReady = false;
        this.measurementsReady = false;
        this.cardConfig = cardConfig;
        this.measurementProvider = measurementProvider;
        this.configFactory = new WindRoseConfigFactory(cardConfig);
        const windRoseConfig = this.configFactory.createWindRoseConfig();
        this.windSpeedConverter = new WindSpeedConverter(cardConfig.outputSpeedUnit, cardConfig.speedRangeBeaufort,
            cardConfig.speedRangeStep, cardConfig.speedRangeMax, cardConfig.speedRanges);

        this.measurementCounter = new MeasurementCounter(windRoseConfig, this.windSpeedConverter);
        this.dimensionCalculator = new DimensionsCalculator();

        if (this.cardConfig.centerCalmPercentage) {
            this.percentageCalculator = new PercentageCalculatorCenterCalm();
            this.windRoseRenderer = new WindRoseRendererCenterCalm(windRoseConfig, this.windSpeedConverter.getSpeedRanges());
        } else {
            this.percentageCalculator = new PercentageCalculator();
            this.windRoseRenderer = new WindRoseRendererStandaard(windRoseConfig, this.windSpeedConverter.getSpeedRanges());
        }

        this.windBarRenderers = [];
        const barConfigs = this.configFactory.createWindBarConfigs();
        for (let i = 0; i < cardConfig.windBarCount(); i++) {
            this.windBarRenderers.push(new WindBarRenderer(barConfigs[i], this.windSpeedConverter.getOutputSpeedUnit()));
        }
        this.windRoseData = [];
    }

    resize(width: number): number | undefined {
        if (this.initReady) {
            Log.debug('resize()', width);
            const roseDimensions = this.dimensionCalculator.calculateWindRoseDimensions(
                width,
                this.cardConfig.maxWidth,
                this.cardConfig.windBarCount(),
                this.cardConfig.windspeedBarLocation);
            this.windRoseRenderer.updateDimensions(roseDimensions);

            for (let i = 0; i < this.cardConfig.windBarCount(); i++) {
                this.windBarRenderers[i].updateDimensions(this.dimensionCalculator.calculatorWindBarDimensions(
                    roseDimensions, this.cardConfig.windspeedBarLocation, i));
            }
            this.dimensionsReady = true;
            return roseDimensions.canvasHeight;
        } else {
            Log.debug('resize() ignored, not inited yet');
        }
        return 400;
    }

    refreshData(): Promise<boolean> {
        if (this.initReady) {
            Log.debug('refreshData()');
            return this.measurementProvider.getMeasurements().then((matchedGroups) => {
                this.windRoseData = [];
                Log.debug('Matched measurements:', matchedGroups);
                for (let i = 0; i < matchedGroups.length; i++) {
                    this.measurementCounter.init(this.cardConfig.windspeedEntities[i].speedUnit);
                    for (const measurement of matchedGroups[i]) {
                        this.measurementCounter.addWindMeasurements(measurement.direction, measurement.speed);
                    }
                    const windCounts = this.measurementCounter.getMeasurementCounts();
                    this.windRoseData.push(this.percentageCalculator.calculate(windCounts));
                }
                this.measurementsReady = true;
                return Promise.resolve(true);
            });
        } else {
            Log.debug('refreshData() ignored, not inited yet');
            return Promise.resolve(false);
        }
    }

    render(canvasContext: CanvasRenderingContext2D): void {
        if (canvasContext && this.initReady && this.dimensionsReady && this.measurementsReady) {
            Log.debug('render()', canvasContext, this.windRoseData, this.windBarRenderers);
            this.windRoseRenderer.drawWindRose(this.windRoseData[0], canvasContext);
            for (let i = 0; i < this.windBarRenderers.length; i++) {
                this.windBarRenderers[i].drawWindBar(this.windRoseData[i], canvasContext);
            }
        } else {
            Log.debug("render(): Could not render, no canvasContext, dimensions or windRoseData", canvasContext, this.windRoseData);
        }
    }

}