import {WindRoseRendererStandaard} from "./WindRoseRendererStandaard";
import {WindBarRenderer} from "./WindBarRenderer";
import {PercentageCalculator} from "./PercentageCalculator";
import {WindSpeedConverter} from "../converter/WindSpeedConverter";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindRoseConfigFactory} from "../config/WindRoseConfigFactory";
import {MeasurementCounter} from "../counter/MeasurementCounter";
import {WindRoseData} from "./WindRoseData";
import {Log} from "../util/Log";
import {WindRoseRendererCenterCalm} from "./WindRoseRendererCenterCalm";
import {PercentageCalculatorCenterCalm} from "./PercentageCalculatorCenterCalm";
import {WindRoseRenderer} from "./WindRoseRenderer";
import {HomeAssistantMeasurementProvider} from "../measurement-provider/HomeAssistantMeasurementProvider";
import {DimensionConfig} from "./DimensionConfig";
import {CurrentDirectionRenderer} from "./CurrentDirectionRenderer";

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
    private dimensionConfig!: DimensionConfig;
    private windRoseRenderer!: WindRoseRenderer;
    private windBarRenderers: WindBarRenderer[] = [];
    private currentDirectionRenderer!: CurrentDirectionRenderer;

    //Calculated data
    private windRoseData: WindRoseData[] = [];

    private initReady = false;
    private dimensionsReady = false;
    private measurementsReady = false;

    init(cardConfig: CardConfigWrapper, measurementProvider: HomeAssistantMeasurementProvider): void {
        this.initReady = true;
        this.measurementsReady = false;
        this.cardConfig = cardConfig;
        this.measurementProvider = measurementProvider;
        this.configFactory = new WindRoseConfigFactory(cardConfig);
        const windRoseConfig = this.configFactory.createWindRoseConfig();
        this.windSpeedConverter = new WindSpeedConverter(cardConfig.outputSpeedUnit, cardConfig.speedRangeBeaufort,
            cardConfig.speedRangeStep, cardConfig.speedRangeMax, cardConfig.speedRanges);

        this.measurementCounter = new MeasurementCounter(windRoseConfig, this.windSpeedConverter);
        this.dimensionConfig = new DimensionConfig(cardConfig.windBarCount(), cardConfig.windspeedBarLocation);

        if (this.cardConfig.centerCalmPercentage) {
            this.percentageCalculator = new PercentageCalculatorCenterCalm();
            this.windRoseRenderer = new WindRoseRendererCenterCalm(windRoseConfig, this.dimensionConfig, this.windSpeedConverter.getSpeedRanges());
        } else {
            this.percentageCalculator = new PercentageCalculator();
            this.windRoseRenderer = new WindRoseRendererStandaard(windRoseConfig, this.dimensionConfig, this.windSpeedConverter.getSpeedRanges());
        }
        this.currentDirectionRenderer = new CurrentDirectionRenderer(windRoseConfig, this.dimensionConfig);

        this.windBarRenderers = [];
        if (!cardConfig.hideWindspeedBar) {
            const barConfigs = this.configFactory.createWindBarConfigs();
            for (let i = 0; i < cardConfig.windBarCount(); i++) {
                this.windBarRenderers.push(new WindBarRenderer(barConfigs[i], this.dimensionConfig, this.windSpeedConverter.getOutputSpeedUnit(), i));
            }
        }

        this.windRoseData = [];
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

    render(svg: Snap.Paper): void {
        if (svg && this.initReady && this.measurementsReady) {
            Log.debug('render()', svg, this.windRoseData, this.windBarRenderers);
            this.windRoseRenderer.drawWindRose(this.windRoseData[0], svg);
            this.currentDirectionRenderer.drawCurrentWindDirection("0", svg);
            for (let i = 0; i < this.windBarRenderers.length; i++) {
                this.windBarRenderers[i].drawWindBar(this.windRoseData[i], svg);
            }
        } else {
            Log.error("render(): Could not render, no svg or windRoseData", svg, this.windRoseData);
        }
    }

    update(currentDirection: string, svg: Snap.Paper): void {
        if (this.initReady) {
            this.currentDirectionRenderer.drawCurrentWindDirection(currentDirection, svg);
        }
    }

}
