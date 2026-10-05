import { HAWebservice } from "./HAWebservice";
import { MeasurementHolder } from "./MeasurementHolder";
import { CardConfigWrapper } from "../config/CardConfigWrapper";
import { Measurement } from "./Measurement";
import { Log } from "../util/Log";
import { WindDirectionEntity } from "../config/WindDirectionEntity";
import { HARequestData } from "./HARequestData";
import { DateTimeFormatter } from "../formatter/DateTimeFormatter";

export class HAMeasurementProvider {

    private readonly cardConfig: CardConfigWrapper;
    private readonly directionEntity: WindDirectionEntity;

    constructor(private readonly haWebservice: HAWebservice,
                private readonly dateTimeFormatter: DateTimeFormatter,
                cardConfig: CardConfigWrapper) {

        this.cardConfig = cardConfig;
        this.directionEntity = cardConfig.windDirectionEntity;
    }

    getMeasurements(): Promise<MeasurementHolder> {
        const activePeriod = this.cardConfig.activePeriod;
        const requests = [];
        let directionRequestData: HARequestData; 
        let speedRequestDatas:  HARequestData[];
        try {
            directionRequestData = HARequestData.fromWindDirectionEntity(this.cardConfig.windDirectionEntity, activePeriod);
            speedRequestDatas = [];
            requests.push(this.haWebservice.getMeasurementData(activePeriod.startTime, activePeriod.endTime, directionRequestData));
            for (const windspeedEntity of this.cardConfig.windspeedEntities) {
                const haSpeedRequestdata = HARequestData.fromWindSpeedEntity(windspeedEntity, activePeriod);
                speedRequestDatas.push(haSpeedRequestdata);
                requests.push(this.haWebservice.getMeasurementData(activePeriod.startTime, activePeriod.endTime, haSpeedRequestdata));
            }            
        } catch (error: any) {
            // forecasts can throw sync errors outside promise chain below
            const holder = new MeasurementHolder(this.dateTimeFormatter);
            holder.setErrorState(error, this.cardConfig.windspeedEntities.length);
            return Promise.resolve(holder);
        }
            

        return Promise.all(requests).then(results => {
            Log.debug('WebSocket results: ', results);
            const measurementHolder = new MeasurementHolder(this.dateTimeFormatter);
            const from = activePeriod.startTime.getTime() / 1000;
            const to = activePeriod.endTime.getTime() / 1000;
            const fullTime = this.cardConfig.matchingStrategy.name === 'full-time';
            try {
                measurementHolder.directionMeasurements = HAMeasurementProvider.parse(
                    results[0][this.directionEntity.entity], directionRequestData, false, from, to, fullTime
                );

                speedRequestDatas.forEach((req, i) => {
                measurementHolder.addSpeedMeasurements(
                    HAMeasurementProvider.parse(results[i + 1][req.entity], req, true, from, to, fullTime));
                });
            } catch(error: any) {
                measurementHolder.setErrorState(error, this.cardConfig.windspeedEntities.length);
            }
            return Promise.resolve(measurementHolder);
        });
    }

    private static parse(data: any[], req: HARequestData, numeric: boolean,
                        from: number, to: number, fullTime: boolean): Measurement[] {
        if (req.useForecast) {
            return HAMeasurementProvider.parseForecastMeasurements(data, req.entity, numeric, from, to, fullTime);
        }
        if (req.useStatistics) {
            return HAMeasurementProvider.parseStatsMeasurements(data, req.entity, numeric);
        }
        const m = HAMeasurementProvider.parseHistoryMeasurements(data, req.entity, req.attribute, numeric);
        HAMeasurementProvider.sortAndFillEndTime(m);
        return m;
    }

    private static parseForecastMeasurements(
        data: { datetime: string; value: string | number }[],
        entity: string, numeric: boolean, from: number, to: number, fullTime: boolean): Measurement[] {

        if (!data || data.length === 0) {
            throw new Error('No forecast data found for entity ' + entity);
        }

        const result: Measurement[] = [];
        for (const item of data) {
            const start = Date.parse(item.datetime) / 1000;
            const ok = !isNaN(start)
            && HAMeasurementProvider.hasValue(item.value)
            && (!numeric || HAMeasurementProvider.isNumeric(item.value));
            if (!ok) {
            Log.info(`Forecast value from ${entity} ignored: `, item);
            continue;
            }
            result.push(new Measurement(start, start, String(item.value)));
        }
        result.sort((a, b) => a.startTime - b.startTime);

        // Each value lasts until just before the next one (1 ms gap, see Revision 9);
        // the last repeats the previous interval (1 h if single).
        const GAP = 0.001; // seconds
        for (let i = 0; i < result.length; i++) {
            result[i].endTime = i < result.length - 1
            ? result[i + 1].startTime - GAP
            : result[i].startTime + (i > 0 ? result[i].startTime - result[i - 1].startTime : 3600);
        }

        // Keep entries overlapping the window and clip them to it.
        const clipped = result
            .filter(m => m.endTime > from && m.startTime < to)
            .map(m => new Measurement(Math.max(m.startTime, from), Math.min(m.endTime, to), m.value));

        // FullTimeMatcher drops the last merged entry (no known duration), so add a zero-length
        // sentinel at the end of the window to keep the final real interval.
        // Not for direction-first: there the sentinel would count as an extra sample.
        if (fullTime && clipped.length > 0) {
            const last = clipped[clipped.length - 1];
            clipped.push(new Measurement(last.endTime, last.endTime, last.value));
        }
        return clipped;
    }
    
    private static parseHistoryMeasurements(historyData: HistoryData[], entity: string, attribute: string | undefined, numeric: boolean): Measurement[] {
        const measurements: Measurement[] = [];
        let ignoreCounter = 0;
        if (historyData === undefined || historyData.length === 0) {
            throw new Error('No history data found for entity ' + entity);
        }
        Measurement.initHistory(attribute);
        for (const data of historyData) {
            const value = Measurement.getHistoryValue(data);
            if (numeric) {
                if (HAMeasurementProvider.hasValue(value) && HAMeasurementProvider.isNumeric(value)) {
                    measurements.push(Measurement.fromHistory(data));
                } else {
                    Log.info(`Value from ${entity} ignored: `, data);
                    ignoreCounter++;
                }
            } else {
                if (HAMeasurementProvider.hasValue(value)) {
                    measurements.push(Measurement.fromHistory(data));
                } else {
                    Log.info(`Value from ${entity} ignored: `, data);
                    ignoreCounter++;
                }
            }
        }
        if (ignoreCounter > 10) {
            Log.warn(`More then 10 values from ${entity} are ignored, sest log_level to INFO to investigate.`);
        }
        return measurements;
    }
    private static parseStatsMeasurements(statisticsData: StatisticsData[], entity: string, numeric: boolean): Measurement[] {
        const measurements: Measurement[] = [];
        let ignoreCounter = 0;
        if (statisticsData === undefined || statisticsData.length === 0) {
            throw new Error('No statistics data found for entity ' + entity);
        }
        Measurement.initStats(statisticsData[0]);
        for (const data of statisticsData) {
            const value = Measurement.getStatsValue(data);
            if (numeric) {
                if (HAMeasurementProvider.hasValue(value) && HAMeasurementProvider.isNumeric(value)) {
                    measurements.push(Measurement.fromStats(data));
                } else {
                    Log.info(`Value from ${entity} ignored: `, data);
                    ignoreCounter++;
                }
            } else {
                if (HAMeasurementProvider.hasValue(value)) {
                    measurements.push(Measurement.fromStats(data));
                } else {
                    Log.info(`Value from ${entity} ignored: `, data);
                    ignoreCounter++;
                }
            }
        }
        if (ignoreCounter > 10) {
            Log.warn(`More then 10 values from ${entity} are ignored, set log_level to INFO to investigate. Count: ${ignoreCounter}`);
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
