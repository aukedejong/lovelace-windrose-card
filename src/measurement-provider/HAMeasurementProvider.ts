import {HAWebservice} from "./HAWebservice";
import {MeasurementHolder} from "./MeasurementHolder";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {DataPeriod} from "../config/DataPeriod";
import {Measurement} from "./Measurement";
import {Log} from "../util/Log";
import {WindDirectionEntity} from "../config/WindDirectionEntity";

export class HAMeasurementProvider {

    private readonly cardConfig: CardConfigWrapper;
    private readonly dataPeriod: DataPeriod;
    private readonly directionEntity: WindDirectionEntity;

    constructor(private readonly haWebservice: HAWebservice,
                cardConfig: CardConfigWrapper) {

        this.cardConfig = cardConfig;
        this.dataPeriod = cardConfig.dataPeriod;
        this.directionEntity = cardConfig.windDirectionEntity;
    }

    getMeasurements(): Promise<MeasurementHolder> {
        const startTime = HAMeasurementProvider.calculateStartTime(this.dataPeriod);

        const requests = [];
        requests.push(this.haWebservice.getMeasurementData(startTime, this.cardConfig.windDirectionEntity));
        for (const windspeedEntity of this.cardConfig.windspeedEntities) {
            requests.push(this.haWebservice.getMeasurementData(startTime, windspeedEntity));
        }

        return Promise.all(requests).then(results => {
            Log.debug('WebSocket results: ', results);

            const measurementHolder = new MeasurementHolder();
            if (this.cardConfig.windDirectionEntity.useStatistics) {
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

            this.cardConfig.windspeedEntities.forEach((speedEntity, i) => {
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
            return Promise.resolve(measurementHolder);
        });
    }

    private static calculateStartTime(dataPeriod: DataPeriod): Date {
        const startTime = new Date();
        if (dataPeriod.hourstoShow) {
            startTime.setHours(startTime.getHours() - dataPeriod.hourstoShow);
        } else if ((dataPeriod.fromHourOfDay && dataPeriod.fromHourOfDay > 0) || dataPeriod.fromHourOfDay === 0) {
            if (startTime.getHours() < dataPeriod.fromHourOfDay) {
                startTime.setDate(startTime.getDate() - 1);
            }
            startTime.setHours(dataPeriod.fromHourOfDay, 0, 0, 0);
        } else {
            throw new Error("No data period config option available.");
        }
        Log.info('Using start time for data query', startTime);
        return startTime;
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
