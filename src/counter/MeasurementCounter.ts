import {WindSpeedConverter} from "../converter/WindSpeedConverter";
import {WindCounts} from "./WindCounts";
import {Log} from "../util/Log";
import {WindDirection} from "./WindDirection";
import {WindDirectionConverter} from "../converter/WindDirectionConverter";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {SpeedRangeService} from "../speed-range/SpeedRangeService";

export class MeasurementCounter {

    private readonly windSpeedConverter: WindSpeedConverter;
    private readonly speedRangeService: SpeedRangeService;
    private readonly windDirectionConverter: WindDirectionConverter;

    private windDirections: WindDirection[] = [];
    private config: CardConfigWrapper;

    private windData = new WindCounts();

    private speedConverterFunction!: (speed: number) => number;

    constructor(config: CardConfigWrapper, windSpeedConverter: WindSpeedConverter, speedRangeService: SpeedRangeService) {
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.speedRangeService = speedRangeService;
        this.windDirectionConverter = new WindDirectionConverter(config.windDirectionEntity);

        const leaveDegrees = 360 / config.windDirectionCount;
        for (let i = 0; i < config.windDirectionCount; i++) {
            const degrees = (i * leaveDegrees);
            const minDegrees = degrees - (leaveDegrees / 2);
            const maxDegrees = degrees + (leaveDegrees / 2);
            this.windDirections.push(new WindDirection(minDegrees, maxDegrees));
            this.windData.speedRangeDegrees.push(degrees);
        }
    }

    init(inputSpeedUnit: string) {
        this.windData.init(this.speedRangeService.getRangeCount(), this.config.windDirectionCount);
        this.speedConverterFunction = this.windSpeedConverter.getSpeedConverterFunc(inputSpeedUnit);
    }

    getMeasurementCounts(): WindCounts {
        Log.debug('Wind counts: ', this.windData);
        return this.windData;
    }

    addWindMeasurements(direction: number | string, speed: number, seconds: number): void {
        const convertedSpeed = this.speedConverterFunction(speed);
        const speedRangeIndex = this.speedRangeService.determineSpeedRangeIndex(convertedSpeed);

        const convertedDirection = this.windDirectionConverter.convertDirection(direction);
        if (convertedDirection === undefined) {
            return;
        }
        const windDirectionIndex = this.windDirections.findIndex(
            windDirection => windDirection.checkDirection(convertedDirection));
        if (windDirectionIndex < 0) {
            Log.info("Wind direction not found: " + convertedDirection);
            return;
        }
        Log.trace("Wind measurement: ", direction, speed, windDirectionIndex, speedRangeIndex);
        this.windData.add(windDirectionIndex, speedRangeIndex, seconds);
    }

}
