import {GlobalConfig} from "./GlobalConfig";
import {CardConfig} from "../card/CardConfig";
import {CardColors} from "./CardColors";
import {Log} from "../util/Log";
import {WindSpeedEntity} from "./WindSpeedEntity";
import {WindDirectionEntity} from "./WindDirectionEntity";
import {DataPeriod} from "./DataPeriod";
import {CompassConfig} from "./CompassConfig";
import {CardConfigCompass} from "../card/CardConfigCompass";
import {CurrentDirectionConfig} from "./CurrentDirectionConfig";
import {CornersInfo} from "./CornersInfo";
import {ConfigCheckUtils} from "./ConfigCheckUtils";
import {CardConfigWindSpeedEntity} from "../card/CardConfigWindSpeedEntity";
import {CardConfigActions} from "../card/CardConfigActions";
import {DirectionLabels} from "./DirectionLabels";


export class CardConfigWrapper {

    title: string;
    dataPeriod: DataPeriod;
    refreshInterval: number;
    windDirectionEntity: WindDirectionEntity;
    windspeedEntities: WindSpeedEntity[];
    windspeedBarLocation: string;
    hideWindspeedBar: boolean;
    centerCalmPercentage: boolean;
    directionLabels: DirectionLabels;
    windDirectionCount: number;
    windRoseDrawNorthOffset: number;
    currentDirection: CurrentDirectionConfig;
    matchingStrategy: string;
    cardColor: CardColors;
    compassConfig: CompassConfig;
    cornersInfo: CornersInfo;
    backgroundImage: string | undefined;
    actions: CardConfigActions | undefined;
    logLevel: string;

    filterEntitiesQueryParameter: string;

    static exampleConfig(): Record<string, unknown>  {
        return {
            title: 'Wind direction',
            data_period: {
                hours_to_show: GlobalConfig.defaultHoursToShow
            },
            refresh_interval: GlobalConfig.defaultRefreshInterval,
            windspeed_bar_location: GlobalConfig.defaultWindspeedBarLocation,
            wind_direction_entity: {
                entity: '',
                use_statistics: false,
                direction_compensation: 0
            },
            windspeed_entities: [
                {
                    entity: '',
                    name: '',
                    speed_unit: GlobalConfig.defaultInputSpeedUnit,
                    use_statistics: false,
                    windspeed_bar_full: GlobalConfig.defaultWindspeedBarFull,
                    output_speed_unit: GlobalConfig.defaultOutputSpeedUnit,
                    speed_range_beaufort: GlobalConfig.defaultSpeedRangeBeaufort,
                    speed_range_step: undefined,
                    speed_range_max: undefined,
                    speed_ranges: undefined,
                }
            ],
            direction_labels: {
                cardinal_direction_letters: 'NESW'
            },
            windrose_draw_north_offset: 0,
            current_direction: {
                show_arrow: false,
                arrow_size: 50,
                center_circle_size: 30
            },
            compass_direction: {
                auto_rotate: false,
                entity: ''
            },
            cardinal_direction_letters: GlobalConfig.defaultCardinalDirectionLettersNotParsed,
            matching_strategy: GlobalConfig.defaultMatchingStategy,
            center_calm_percentage: GlobalConfig.defaultCenterCalmPercentage,
            background_image: undefined,
            log_level: GlobalConfig.defaultLogLevel
        };
    }

    constructor(private readonly cardConfig: CardConfig) {
        this.title = this.cardConfig.title;
        this.dataPeriod = DataPeriod.fromConfig(cardConfig.hours_to_show, cardConfig.data_period);
        this.refreshInterval = this.checkRefreshInterval();
        this.windDirectionEntity = WindDirectionEntity.fromConfig(cardConfig.wind_direction_entity);
        this.windspeedEntities = this.checkWindspeedEntities();
        this.windRoseDrawNorthOffset = this.checkWindRoseDrawNorthOffset();
        this.currentDirection = this.checkCurrentDirection()
        this.windspeedBarLocation = this.checkWindspeedBarLocation();
        this.hideWindspeedBar = ConfigCheckUtils.checkBooleanDefaultFalse(cardConfig.hide_windspeed_bar);
        this.centerCalmPercentage = ConfigCheckUtils.checkBooleanDefaultTrue(cardConfig.center_calm_percentage);
        this.directionLabels = DirectionLabels.fromConfig(cardConfig.direction_labels, cardConfig.cardinal_direction_letters);
        this.windDirectionCount = this.checkWindDirectionCount();
        this.matchingStrategy = this.checkMatchingStrategy();
        this.filterEntitiesQueryParameter = this.createEntitiesQueryParameter();
        this.cardColor = CardColors.fromConfig(cardConfig.colors);
        this.compassConfig = this.checkCompassConfig(cardConfig.compass_direction);
        this.cornersInfo = CornersInfo.create(cardConfig.corner_info);
        this.backgroundImage = ConfigCheckUtils.checkString(cardConfig.background_image);
        this.logLevel = Log.checkLogLevel(this.cardConfig.log_level);
        this.actions = cardConfig.actions;
        Log.info('Config check OK');
    }

    windBarCount(): number {
        if (this.hideWindspeedBar) {
            return 0;
        }
        return this.windspeedEntities.length;
    }

    private checkRefreshInterval(): number {
        if (this.cardConfig.refresh_interval && isNaN(this.cardConfig.refresh_interval)) {
            throw new Error('WindRoseCard: Invalid refresh_interval, should be a number in seconds.');
        } else if (this.cardConfig.refresh_interval) {
            return this.cardConfig.refresh_interval;
        }
        return GlobalConfig.defaultRefreshInterval;
    }

    private checkCurrentDirection(): CurrentDirectionConfig {
        if (this.cardConfig.current_direction) {
            return new CurrentDirectionConfig(
                ConfigCheckUtils.checkBooleanDefaultFalse(this.cardConfig.current_direction.show_arrow),
                ConfigCheckUtils.checkNummerOrDefault(this.cardConfig.current_direction.arrow_size, GlobalConfig.defaultCurrentDirectionArrowSize),
                ConfigCheckUtils.checkNummerOrDefault(this.cardConfig.current_direction.center_circle_size, GlobalConfig.defaultCurrentDirectionCircleSize)
            )
        }
        return new CurrentDirectionConfig(false, undefined, undefined);
    }

    private checkWindspeedEntities(): WindSpeedEntity[] {
        if (!this.cardConfig.windspeed_entities || this.cardConfig.windspeed_entities.length == 0) {
            throw new Error('WindRoseCard: No windspeed_entities configured, minimal 1 needed.');
        }
        const entities:WindSpeedEntity[] = [];
        const parentWindSpeedConfig = {
            entity: '',
            name: '',
            use_statistics: false,
            render_relative_scale: false,
            windspeed_bar_full: this.cardConfig.windspeed_bar_full,
            speed_unit: '',
            output_speed_unit: this.cardConfig.output_speed_unit,
            output_speed_unit_label: this.cardConfig.output_speed_unit_label,
            speed_range_beaufort: this.cardConfig.speed_range_beaufort,
            speed_range_step: this.cardConfig.speed_range_step,
            speed_range_max: this.cardConfig.speed_range_max,
            speed_ranges: this.cardConfig.speed_ranges
        } as CardConfigWindSpeedEntity;
        for (const entityConfig of this.cardConfig.windspeed_entities) {
            entities.push(WindSpeedEntity.fromConfig(entityConfig, parentWindSpeedConfig))
        }
        return entities;
    }

    private checkWindRoseDrawNorthOffset(): number {
        if (this.cardConfig.windrose_draw_north_offset && isNaN(this.cardConfig.windrose_draw_north_offset)) {
            throw new Error('WindRoseCard: Invalid render direction offset, should be a number in degress between 0 and 360.');
        } else if (this.cardConfig.windrose_draw_north_offset) {
            return this.cardConfig.windrose_draw_north_offset;
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

    private checkMatchingStrategy(): string {
        if (this.cardConfig.matching_strategy) {
            if (this.cardConfig.matching_strategy !== 'direction-first' && this.cardConfig.matching_strategy !== 'speed-first'
                && this.cardConfig.matching_strategy !== 'time-frame' && this.cardConfig.matching_strategy !== 'full-time') {
                throw new Error('Invalid matching stategy ' + this.cardConfig.matching_strategy +
                    '. Valid options: direction-first, speed-first, time-frame and full-time');
            }
            return this.cardConfig.matching_strategy;
        }
        return GlobalConfig.defaultMatchingStategy;
    }

    private createEntitiesQueryParameter() {
        return this.windDirectionEntity + ',' + this.windspeedEntities
            .map(config => config.entity)
            .join(',');
    }

    private checkCompassConfig(compassDirection: CardConfigCompass | undefined): CompassConfig {
        let entity = undefined;
        let autoRotate = false;
        let attribute = undefined;
        if (compassDirection) {
            autoRotate = ConfigCheckUtils.checkBooleanDefaultFalse(compassDirection.auto_rotate);
            if (autoRotate) {
                if (compassDirection.entity) {
                    entity = compassDirection.entity;
                    attribute = compassDirection.attribute;
                } else {
                    throw new Error('WindRoseCard: compass direction auto rotate set to true, but no entity configured.');
                }
            }
        }
       return new CompassConfig(autoRotate, entity, attribute);
    }
}
