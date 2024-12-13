import {HomeAssistant} from "../util/HomeAssistant";
import {Log} from "../util/Log";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {MeasurementMatcher} from "../matcher/MeasurementMatcher";
import {DataPeriod} from "../config/DataPeriod";
import {SpeedFirstMatcher} from "../matcher/SpeedFirstMatcher";
import {DirectionFirstMatcher} from "../matcher/DirectionFirstMatcher";
import {TimeFrameMatcher} from "../matcher/TimeFrameMatcher";
import {FullTimeMatcher} from "../matcher/FullTimeMatcher";
import {MatchedMeasurements} from "../matcher/MatchedMeasurements";

export class HomeAssistantMeasurementProvider {

    private hass!: HomeAssistant;
    private cardConfig: CardConfigWrapper;
    private rawEntities: string[];
    private statsEntities: string[];
    private measurementMatcher!: MeasurementMatcher;
    private waitingForMeasurements = false;

    constructor(cardConfig: CardConfigWrapper) {
        this.cardConfig = cardConfig;
        this.rawEntities = cardConfig.createRawEntitiesArray();
        this.statsEntities = cardConfig.createStatisticsEntitiesArray();

        if (this.cardConfig.matchingStrategy === 'speed-first') {
            this.measurementMatcher = new SpeedFirstMatcher();
        } else if (this.cardConfig.matchingStrategy === 'direction-first') {
            this.measurementMatcher = new DirectionFirstMatcher();
        } else if (this.cardConfig.matchingStrategy === 'time-frame') {
            this.measurementMatcher = new TimeFrameMatcher(this.cardConfig.dataPeriod.timeInterval);
        } else if (this.cardConfig.matchingStrategy === 'full-time') {
            this.measurementMatcher = new FullTimeMatcher();
        }
    }

    setHass(hass: HomeAssistant): void {
        this.hass = hass;
    }

    getMeasurements(): Promise<MatchedMeasurements[]> {
        Log.debug('getMeasurements()');
        if (this.hass === undefined) {
            Log.error('Cant read measurements, HASS not set.');
            return Promise.resolve([]);
        }
        if (this.waitingForMeasurements) {
            Log.error('Measurements already requested, waiting');
            return Promise.resolve([]);
        }
        this.waitingForMeasurements = true;
        return Promise.all([this.getHistory(), this.getStatistics()]).then(results => {
            this.checkLoadedData(results);
            this.waitingForMeasurements = false;
            Log.debug("Measurements loaded:", results);
            const matchedMeasurementsList: MatchedMeasurements[] = [];
            if (this.cardConfig.windDirectionEntity.useStatistics) {
                const directionStats = results[1][this.cardConfig.windDirectionEntity.entity] as StatisticsData[];
                for (let speedEntity of this.cardConfig.windspeedEntities) {
                    if (speedEntity.useStatistics) {
                        const speedStats = results[1][speedEntity.entity];
                        const matchedMeasurements = this.measurementMatcher.matchStatsStats(directionStats, speedStats)
                        matchedMeasurementsList.push(matchedMeasurements);
                        this.logMatchingStats(speedEntity.entity, directionStats.length, speedStats.length, matchedMeasurements.getMeasurementCount());
                    } else {
                        const speedHistory = results[0][speedEntity.entity];
                        const matchedMeasurements = this.measurementMatcher.matchStatsHistory(directionStats, speedHistory);
                        matchedMeasurementsList.push(matchedMeasurements);
                        this.logMatchingStats(speedEntity.entity, directionStats.length, speedHistory.length, matchedMeasurements.getMeasurementCount());
                    }
                }

            } else {
                const directionHistory = results[0][this.cardConfig.windDirectionEntity.entity] as HistoryData[];
                for (let speedEntity of this.cardConfig.windspeedEntities) {
                    if (speedEntity.useStatistics) {
                        const speedStats = results[1][speedEntity.entity];
                        const matchedMeasurements = this.measurementMatcher.matchHistoryStats(directionHistory, speedStats);
                        matchedMeasurementsList.push(matchedMeasurements);
                        this.logMatchingStats(speedEntity.entity, directionHistory.length, speedStats.length,
                            matchedMeasurements.getMeasurementCount());
                    } else {
                        const speedHistory = results[0][speedEntity.entity];
                        const matchedMeasurements = this.measurementMatcher.matchHistoryHistory(directionHistory, speedHistory);
                        matchedMeasurementsList.push(matchedMeasurements);
                        this.logMatchingStats(speedEntity.entity, directionHistory.length, speedHistory.length,
                            matchedMeasurements.getMeasurementCount());
                    }
                }
            }
            return Promise.resolve(matchedMeasurementsList);
        });
    }

    private checkLoadedData(results: any) {
        const directionEntity = this.cardConfig.windDirectionEntity.entity;
        if (results[0][directionEntity] === undefined && results[1][directionEntity] === undefined) {
            throw new Error(`Entity ${directionEntity} did not return data, is this the correct entity name?`);
        }
        for (const speedEntity of this.cardConfig.windspeedEntities) {
            if (results[0][speedEntity.entity] === undefined && results[1][speedEntity.entity] === undefined) {
                throw new Error(`Entity ${speedEntity.entity} did not return data, is this the correct entity name?`);
            }
        }
    }

    private logMatchingStats(speedEntity: string, directionMeasurements: number, speedMeasurements: number, matchedMeasurements: number) {
        Log.info(`Loaded measurements: directions: ${directionMeasurements}, speeds: ${speedMeasurements}, entity: ${speedEntity}`);
        if (this.cardConfig.matchingStrategy === 'direction-first') {
            if (matchedMeasurements < directionMeasurements) {
                Log.warn(`Matching results entity ${speedEntity}, ${directionMeasurements - matchedMeasurements} not matched of total ${directionMeasurements} direction measurements`);
            } else {
                Log.info(`Matched measurements, direction-first: ${matchedMeasurements}`);
            }
        } else if (this.cardConfig.matchingStrategy === 'speed-first') {
            if (matchedMeasurements < speedMeasurements) {
                Log.warn(`Matching results entity ${speedEntity}, ${speedMeasurements - matchedMeasurements}  not matched of total ${speedMeasurements} speed measurements`);
            } else {

            }
        } else {
            Log.info(`Matched measurements: ${matchedMeasurements}`);
        }
    }

    private getHistory(): Promise<any> {
        if (this.rawEntities.length === 0) {
            return Promise.resolve({});
        }
        const startTime = this.calculateStartTime(this.cardConfig.dataPeriod);
        const endTime = new Date();

        const historyMessage = {
            "type": "history/history_during_period",
            "start_time": startTime,
            "end_time": endTime,
            "minimal_response": true,
            "no_attributes": true,
            "entity_ids": this.rawEntities
        }
        return this.hass.callWS(historyMessage);
    }

    private getStatistics(): Promise<any> {
        if (this.statsEntities.length === 0) {
            return Promise.resolve({});
        }
        const startTime = this.calculateStartTime(this.cardConfig.dataPeriod);

        const statisticsMessage = {
            "type": "recorder/statistics_during_period",
            "start_time": startTime,
            "period": "5minute",
            "statistic_ids": this.statsEntities,
            "types":["mean"]
        }
        return this.hass.callWS(statisticsMessage);
    }

    private calculateStartTime(dataPeriod: DataPeriod): Date {
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
}
