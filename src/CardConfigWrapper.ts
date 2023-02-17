import {GlobalConfig} from "./GlobalConfig";
import {CardConfig} from "./CardConfig";

export class CardConfigWrapper {

    title: string;
    hoursToShow: number;
    refreshInterval: number;
    maxWidth: number | undefined;
    windDirectionEntity: string;
    windspeedEntities: {entity: string, name: string}[];
    directionCompensation: number;
    windspeedBarLocation: string;
    windspeedBarFull: boolean;
    cardinalDirectionLetters: string;
    windDirectionCount: number;
    windDirectionUnit: string;
    inputSpeedUnit: string;
    outputSpeedUnit: string;
    matchingStrategy: string;
    directionSpeedTimeDiff: number;

    entities: string[];
    filterEntitiesQueryParameter: string;

    static exampleConfig(): Record<string, unknown>  {
        return {
            title: 'Wind direction',
            hours_to_show: GlobalConfig.defaultHoursToShow,
            max_width: 400,
            refresh_interval: GlobalConfig.defaultRefreshInterval,
            windspeed_bar_location: GlobalConfig.defaultWindspeedBarLocation,
            windspeed_bar_full: GlobalConfig.defaultWindspeedBarFull,
            wind_direction_entity: '',
            windspeed_entities: [
                {
                    entity: '',
                    name: ''
                }
            ],
            wind_direction_unit: GlobalConfig.defaultWindDirectionUnit,
            input_speed_unit: GlobalConfig.defaultInputSpeedUnit,
            output_speed_unit: GlobalConfig.defaultOutputSpeedUnit,
            direction_compensation: 0,
            cardinal_direction_letters: GlobalConfig.defaultCardinalDirectionLetters,
            matching_strategy: GlobalConfig.defaultMatchingStategy,
            direction_speed_time_diff: GlobalConfig.defaultDirectionSpeedTimeDiff
        };
    }

    constructor(private readonly cardConfig: CardConfig) {
        this.title = this.cardConfig.title;
        this.hoursToShow = this.checkHoursToShow();
        this.refreshInterval = this.checkRefreshInterval();
        this.maxWidth = this.checkMaxWidth();
        this.windDirectionEntity = this.checkWindDirectionEntity();
        this.windspeedEntities = this.checkWindspeedEntities();
        this.directionCompensation = this.checkDirectionCompensation();
        this.windspeedBarLocation = this.checkWindspeedBarLocation();
        this.windspeedBarFull = this.checkWindspeedBarFull();
        this.cardinalDirectionLetters = this.checkCardinalDirectionLetters();
        this.windDirectionCount = this.checkWindDirectionCount();
        this.windDirectionUnit = this.checkWindDirectionUnit();
        this.inputSpeedUnit = this.checkInputSpeedUnit();
        this.outputSpeedUnit = this.checkOutputSpeedUnit();
        this.matchingStrategy = this.checkMatchingStrategy();
        this.directionSpeedTimeDiff = this.checkDirectionSpeedTimeDiff();
        this.filterEntitiesQueryParameter = this.createEntitiesQueryParameter();
        this.entities = this.createEntitiesArray();
    }

    windBarCount(): number {
        return this.windspeedEntities.length;
    }

    private checkHoursToShow(): number {
        if (this.cardConfig.hours_to_show && isNaN(this.cardConfig.hours_to_show)) {
            throw new Error('WindRoseCard: Invalid hours_to_show, should be a number.');
        } else if (this.cardConfig.hours_to_show) {
            return this.cardConfig.hours_to_show;
        }
        return GlobalConfig.defaultHoursToShow;
    }

    private checkRefreshInterval(): number {
        if (this.cardConfig.refresh_interval && isNaN(this.cardConfig.refresh_interval)) {
            throw new Error('WindRoseCard: Invalid refresh_interval, should be a number in seconds.');
        } else if (this.cardConfig.refresh_interval) {
            return this.cardConfig.refresh_interval;
        }
        return GlobalConfig.defaultRefreshInterval;
    }

    private checkMaxWidth(): number | undefined {
        if (this.cardConfig.max_width && isNaN(this.cardConfig.max_width)) {
            throw new Error('WindRoseCard: Invalid max_width, should be a number in pixels.');
        } else if (this.cardConfig.max_width <= 0) {
            throw new Error('WindRoseCard: Invalid max_width, should be a positive number.')
        } else if (this.cardConfig.max_width) {
            return this.cardConfig.max_width;
        }
        return undefined;
    }

    private checkWindDirectionEntity(): string {
        if (this.cardConfig.wind_direction_entity) {
            return this.cardConfig.wind_direction_entity;
        }
        throw new Error("WindRoseCard: No wind_direction_entity configured.");
    }

    private checkWindspeedEntities(): {entity: string, name: string}[] {
        if (!this.cardConfig.windspeed_entities || this.cardConfig.windspeed_entities.length == 0) {
            throw new Error('WindRoseCard: No wind_speed_entities configured, minimal 1 needed.');
        }
        return this.cardConfig.windspeed_entities;
    }

    private checkDirectionCompensation(): number {
        if (this.cardConfig.direction_compensation && isNaN(this.cardConfig.direction_compensation)) {
            throw new Error('WindRoseCard: Invalid direction compensation, should be a number in degress between 0 and 360.');
        } else if (this.cardConfig.direction_compensation) {
            return this.cardConfig.direction_compensation;
        }
        return 0;
    }

    private checkWindspeedBarLocation(): string {
        if (this.cardConfig.windspeed_bar_location) {
            if (this.cardConfig.windspeed_bar_location !== 'bottom' && this.cardConfig.windspeed_bar_location !== 'right') {
                throw new Error('Invalid windspeed bar location ' + this.cardConfig.windspeed_bar_location +
                    '. Valid options: bottom, right');
            }
            return this.cardConfig.windspeed_bar_location;
        }
        return GlobalConfig.defaultWindspeedBarLocation;
    }

    private checkWindspeedBarFull(): boolean {
        return this.cardConfig.windspeed_bar_full;
    }

    private checkCardinalDirectionLetters(): string {
        if (this.cardConfig.cardinal_direction_letters) {
            if (this.cardConfig.cardinal_direction_letters.length !== 4) {
                throw new Error("Cardinal direction letters option should contain 4 letters.");
            }
            return this.cardConfig.cardinal_direction_letters;
        }
        return GlobalConfig.defaultCardinalDirectionLetters;
    }

    private checkWindDirectionCount(): number {
        if (this.cardConfig.wind_direction_count) {
            if (isNaN(this.cardConfig.wind_direction_count) || this.cardConfig.wind_direction_count < 4 ||
                    this.cardConfig.wind_direction_count > 32) {
                throw new Error("Wind direction count can a number between 4 and 32");
            }
            return this.cardConfig.wind_direction_count;
        }
        return GlobalConfig.defaultWindDirectionCount;
    }

    private checkWindDirectionUnit(): string {
        if (this.cardConfig.wind_direction_unit) {
            if (this.cardConfig.wind_direction_unit !== 'degrees'
                && this.cardConfig.wind_direction_unit !== 'letters') {
                throw new Error('Invalid wind direction unit configured: ' + this.cardConfig.wind_direction_unit +
                    '. Valid options: degrees, letters');
            }
            return this.cardConfig.wind_direction_unit;
        }
        return GlobalConfig.defaultWindDirectionUnit;
    }
    
    private checkInputSpeedUnit(): string {
        if (this.cardConfig.input_speed_unit) {
            if (this.cardConfig.input_speed_unit !== 'mps'
                && this.cardConfig.input_speed_unit !== 'kph'
                && this.cardConfig.input_speed_unit !== 'mph'
                && this.cardConfig.input_speed_unit !== 'fps'
                && this.cardConfig.input_speed_unit !== 'knots') {
                throw new Error('Invalid input windspeed unit configured: ' + this.cardConfig.input_speed_unit +
                    '. Valid options: mps, fps, kph, mph, knots');
            }
            return this.cardConfig.input_speed_unit;
        }
        return GlobalConfig.defaultInputSpeedUnit;
    }

    private checkOutputSpeedUnit(): string {
        if (this.cardConfig.output_speed_unit) {
            if (this.cardConfig.output_speed_unit !== 'mps'
                && this.cardConfig.output_speed_unit !== 'kph'
                && this.cardConfig.output_speed_unit !== 'mph'
                && this.cardConfig.output_speed_unit !== 'fps'
                && this.cardConfig.output_speed_unit !== 'knots'
                && this.cardConfig.output_speed_unit !== 'bft') {
                throw new Error('Invalid output windspeed unit configured: ' + this.cardConfig.output_speed_unit +
                    '. Valid options: mps, fps, kph, mph, knots, bft');
            }
            return this.cardConfig.output_speed_unit;
        }
        return GlobalConfig.defaultOutputSpeedUnit;
    }

    private checkMatchingStrategy(): string {
        if (this.cardConfig.matching_strategy) {
            if (this.cardConfig.matching_strategy !== 'direction-first' && this.cardConfig.matching_strategy !== 'speed-first') {
                throw new Error('Invalid matching stategy ' + this.cardConfig.matching_strategy +
                    '. Valid options: direction-first, speed-first');
            }
            return this.cardConfig.matching_strategy;
        }
        return GlobalConfig.defaultMatchingStategy;
    }

    private checkDirectionSpeedTimeDiff(): number {
        if (this.cardConfig.direction_speed_time_diff) {
            if (isNaN(this.cardConfig.direction_speed_time_diff)) {
                throw new Error("Direction speed time difference is not a number: " +
                    this.cardConfig.direction_speed_time_diff);
            }
            return this.cardConfig.direction_speed_time_diff;
        }
        return GlobalConfig.defaultDirectionSpeedTimeDiff;
    }


    private createEntitiesQueryParameter() {
        return this.windDirectionEntity + ',' + this.windspeedEntities
            .map(config => config.entity)
            .join(',');
    }

    private createEntitiesArray(): string[] {
        const entities: string[] = [];
        entities.push(this.windDirectionEntity);
        return entities.concat(this.windspeedEntities.map(config => config.entity));
    }
}