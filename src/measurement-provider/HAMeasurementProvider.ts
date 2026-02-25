import {HAWebservice} from "./HAWebservice";
import {MeasurementHolder} from "./MeasurementHolder";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {Measurement} from "./Measurement";
import {Log} from "../util/Log";
import {WindDirectionEntity} from "../config/WindDirectionEntity";
import {HARequestData} from "./HARequestData";

export class HAMeasurementProvider {

    private readonly cardConfig: CardConfigWrapper;
    private readonly directionEntity: WindDirectionEntity;

    constructor(private readonly haWebservice: HAWebservice,
                cardConfig: CardConfigWrapper) {

        this.cardConfig = cardConfig;
        this.directionEntity = cardConfig.windDirectionEntity;
    }

    getMeasurements(): Promise<MeasurementHolder> {
        const activePeriod = this.cardConfig.activePeriod;
        const requests = [];
        const directionRequestData = HARequestData.fromWindDirectionEntity(this.cardConfig.windDirectionEntity, activePeriod);
        const speedRequestDatas:  HARequestData[] = [];
        requests.push(this.haWebservice.getMeasurementData(activePeriod.startTime, activePeriod.endTime, directionRequestData));
        for (const windspeedEntity of this.cardConfig.windspeedEntities) {
            const haSpeedRequestdata = HARequestData.fromWindSpeedEntity(windspeedEntity, activePeriod);
            speedRequestDatas.push(haSpeedRequestdata);
            requests.push(this.haWebservice.getMeasurementData(activePeriod.startTime, activePeriod.endTime, haSpeedRequestdata));
        }

        return Promise.all(requests).then(results => {
            Log.debug('WebSocket results: ', results);
            const measurementHolder = new MeasurementHolder();
            try {
                if (directionRequestData.useStatistics) {
                    measurementHolder.directionMeasurements = HAMeasurementProvider.parseStatsMeasurements(
                        results[0][this.directionEntity.entity],
                        this.directionEntity.entity,
                        false);
                } else {
                    measurementHolder.directionMeasurements = HAMeasurementProvider.parseHistoryMeasurements(
                        results[0][this.directionEntity.entity],
                        this.directionEntity.entity,
                        this.directionEntity.attribute,
                        false);
                    HAMeasurementProvider.sortAndFillEndTime(measurementHolder.directionMeasurements);
                }

                speedRequestDatas.forEach((speedEntity, i) => {
                    if (speedEntity.useStatistics) {
                        measurementHolder.addSpeedMeasurements(HAMeasurementProvider.parseStatsMeasurements(
                            results[i + 1][speedEntity.entity],
                            speedEntity.entity,
                            true));
                    } else {
                        const measurements = HAMeasurementProvider.parseHistoryMeasurements(
                            results[i + 1][speedEntity.entity],
                            speedEntity.entity,
                            speedEntity.attribute,
                            true);
                        HAMeasurementProvider.sortAndFillEndTime(measurements);
                        measurementHolder.addSpeedMeasurements(measurements);
                    }
                });
            } catch(error: any) {
                measurementHolder.setErrorState(error, this.cardConfig.windspeedEntities.length);
            }
            return Promise.resolve(measurementHolder);
        });
    }

    private static parseHistoryMeasurements(historyData: HistoryData[], entity: string, attribute: string | undefined, numeric: boolean): Measurement[] {
        const measurements: Measurement[] = [];
        if (historyData === undefined || historyData.length === 0) {
            throw new Error('No history data found for entity ' + entity);
        }
        Measurement.init(attribute, false);
        for (const data of historyData) {
            const value = Measurement.getHistoryValue(data);
            if (numeric) {
                if (HAMeasurementProvider.hasValue(value) && HAMeasurementProvider.isNumeric(value)) {
                    measurements.push(Measurement.fromHistory(data));
                } else {
                    Log.warn(`Value from ${entity} ignored: `, data);
                }
            } else {
                if (HAMeasurementProvider.hasValue(value)) {
                    measurements.push(Measurement.fromHistory(data));
                } else {
                    Log.warn(`Value from ${entity} ignored: `, data);
                }
            }
        }
        return measurements;
    }

    private static parseStatsMeasurements(statisticsData: StatisticsData[], entity: string, numeric: boolean): Measurement[] {
        const measurements: Measurement[] = [];
        if (statisticsData === undefined || statisticsData.length === 0) {
            throw new Error('No statistics data found for entity ' + entity);
        }
        Measurement.init(undefined, true);
        for (const data of statisticsData) {
            const value = Measurement.getStatsValue(data);
            if (numeric) {
                if (HAMeasurementProvider.hasValue(value) && HAMeasurementProvider.isNumeric(value)) {
                    measurements.push(Measurement.fromStats(data));
                } else {
                    Log.warn(`Value from ${entity} ignored: `, data);
                }
            } else {
                if (HAMeasurementProvider.hasValue(value)) {
                    measurements.push(Measurement.fromStats(data));
                } else {
                    Log.warn(`Value from ${entity} ignored: `, data);
                }
            }
        }
        return measurements;
    }

    private static hasValue(value: string | number | undefined | null): boolean {
        if (value === null || value === undefined || value === '') {
            return false;
        }
        return true;
    }

    private static isNumeric(value: string | number ): boolean {
        return !isNaN(+value);
    }

    private static sortAndFillEndTime(measurements: Measurement[]) {
        // Allready sorted, first first
        let prevM: Measurement | undefined;
        for (const m of measurements) {
            if (prevM) {
                prevM.endTime = m.startTime;
            }
            prevM = m;
        }
        if (prevM) {
            prevM.endTime = Date.now() / 1000;
        }
    }

}
