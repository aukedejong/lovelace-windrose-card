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
    cardinalDirectionLetters: string;
    windDirectionCount: number;

    entities: string[];
    filterEntitiesQueryParameter: string;

    static exampleConfig(): Record<string, unknown>  {
        return {
            title: 'Wind direction',
            hours_to_show: GlobalConfig.defaultHoursToShow,
            max_width: 400,
            refresh_interval: GlobalConfig.defaultRefreshInterval,
            windspeed_bar_location: GlobalConfig.defaultWindspeedBarLocation,
            wind_direction_entity: '',
            windspeed_entities: [
                {
                    entity: '',
                    name: ''
                }
            ],
            direction_compensation: 0,
            cardinal_direction_letters: GlobalConfig.defaultCardinalDirectionLetters
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
        this.cardinalDirectionLetters = this.checkCardinalDirectionLetters();
        this.windDirectionCount = this.checkWindDirectionCount();
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
                throw new Error('WindRoseCard: Invalid windspeed bar location ' + this.cardConfig.windspeed_bar_location +
                    '. Valid options: bottom, right');
            }
            return this.cardConfig.windspeed_bar_location;
        }
        return GlobalConfig.defaultWindspeedBarLocation;
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