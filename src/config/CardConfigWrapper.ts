import {GlobalConfig} from "./GlobalConfig";
import {CardConfig} from "../card/CardConfig";
import {CardColors} from "./CardColors";
import {Log} from "../util/Log";
import {WindSpeedEntity} from "./WindSpeedEntity";
import {WindDirectionEntity} from "./WindDirectionEntity";
import {CompassConfig} from "./CompassConfig";
import {CurrentDirectionConfig} from "./CurrentDirectionConfig";
import {CornersInfo} from "./CornersInfo";
import {ConfigCheckUtils} from "./ConfigCheckUtils";
import {CardConfigActions} from "../card/CardConfigActions";
import {DirectionLabels} from "./DirectionLabels";
import {TextBlocks} from "./TextBlocks";
import {ButtonsConfig} from "./buttons/ButtonsConfig";
import {MatchingStrategy} from "./MatchingStrategy";
import {Period} from "./buttons/Period";
import {RoseConfig} from "./RoseConfig";


export class CardConfigWrapper {

    title: string;
    dataPeriod: Period | undefined;
    activePeriod: Period;
    buttonsConfig: ButtonsConfig | undefined;
    refreshInterval: number;
    windDirectionEntity: WindDirectionEntity;
    windspeedEntities: WindSpeedEntity[];
    windspeedBarLocation: string;
    hideWindspeedBar: boolean;
    roseConfig: RoseConfig;
    directionLabels: DirectionLabels;
    currentDirection: CurrentDirectionConfig;
    matchingStrategy: MatchingStrategy;
    cardColor: CardColors;
    compassConfig: CompassConfig;
    cornersInfo: CornersInfo;
    textBlocks: TextBlocks;
    actions: CardConfigActions | undefined;
    cardWidth: number;
    disableAnimations: boolean;
    logLevel: string;

    filterEntitiesQueryParameter: string;

    static exampleConfig(): Record<string, unknown>  {
        return {
            title: 'Wind direction',
            data_period: {
                hours_to_show: GlobalConfig.defaultHoursToShow
            },
            rose_config: {
                windrose_draw_north_offset: 0,
                center_calm_percentage: GlobalConfig.defaultCenterCalmPercentage,
            },
            refresh_interval: GlobalConfig.defaultRefreshInterval,
            windspeed_bar_location: 'right',
            wind_direction_entity: {
                entity: 'sensor.',
                use_statistics: false,
                direction_compensation: 0
            },
            windspeed_entities: [
                {
                    entity: 'sensor.',
                    name: 'Wind speed',
                    speed_unit: GlobalConfig.defaultInputSpeedUnit,
                    use_statistics: false,
                    windspeed_bar_full: GlobalConfig.defaultWindspeedBarFull,
                    output_speed_unit: GlobalConfig.defaultOutputSpeedUnit,
                    speed_range_beaufort: GlobalConfig.defaultSpeedRangeBeaufort,
                    current_speed_arrow: true
                }
            ],
            buttons_config: {
                location: 'bottom',
                buttons: [
                    {
                        type: 'period_selector',
                        button_text: 'Today',
                        preset_period: 'today'
                    },
                    {
                        type: 'period_selector',
                        button_text: 'Last 7 days',
                        preset_period: 'last_7_days'
                    },
                    {
                        type: 'period_selector',
                        button_text: 'Last 30 days',
                        preset_period: 'last_30_days',
                        use_analytics: true,
                        analytics_period: 'hour'
                    }
                ]
            },
            direction_labels: {
                cardinal_direction_letters: 'NESW'
            },
            current_direction: {
                show_arrow: true
            },
            matching_strategy: {
                name: GlobalConfig.defaultMatchingStategy
            },
            corner_info: {
                top_left: {
                    label: "Wind direction",
                    unit: " °",
                    entity: 'sensor.',
                 },
                top_right: {
                    label: "Wind speed",
                    unit: " bft",
                    entity: 'sensor.',
                },
            },
            text_blocks: {
                top: {
                    text: `      <table>
          <tr>
              <td>Period:</td><td>\${start-date}, \${start-time} - \${end-date}, \${end-time}</td>
          </tr>
      </table>`
                },
            },
            log_level: GlobalConfig.defaultLogLevel
        };
    }

    constructor(private readonly cardConfig: CardConfig) {
        this.title = this.cardConfig.title;
        this.checkDeprecations(cardConfig)
        this.windspeedBarLocation = this.checkWindspeedBarLocation();
        this.dataPeriod = Period.fromConfig(cardConfig.data_period);
        this.buttonsConfig = ButtonsConfig.fromConfig(cardConfig.buttons_config, this.windspeedBarLocation);
        this.activePeriod = Period.determineActivePeriod(this.dataPeriod, this.buttonsConfig);
        this.refreshInterval = this.checkRefreshInterval();
        this.windDirectionEntity = WindDirectionEntity.fromConfig(cardConfig.wind_direction_entity);
        this.windspeedEntities = this.checkWindspeedEntities();
        this.roseConfig = RoseConfig.fromConfig(cardConfig.rose_config);
        this.currentDirection = this.checkCurrentDirection()
        this.disableAnimations = ConfigCheckUtils.checkBooleanDefaultFalse(cardConfig.disable_animations);
        this.hideWindspeedBar = ConfigCheckUtils.checkBooleanDefaultFalse(cardConfig.hide_windspeed_bar);
        this.directionLabels = DirectionLabels.fromConfig(cardConfig.direction_labels);
        this.matchingStrategy = MatchingStrategy.fromConfig(cardConfig.matching_strategy);
        this.filterEntitiesQueryParameter = this.createEntitiesQueryParameter();
        this.cardWidth = !cardConfig.card_width ? 4 : cardConfig.card_width;
        this.cardColor = CardColors.fromConfig(cardConfig.colors);
        this.compassConfig = CompassConfig.fromConfig(cardConfig.compass_direction);
        this.cornersInfo = CornersInfo.create(cardConfig.corner_info);
        this.textBlocks = TextBlocks.fromConfig(cardConfig.text_blocks);
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
            let centerCircleSize;
            if (this.roseConfig.centerCalmPercentage) {
                centerCircleSize = GlobalConfig.defaultCurrentDirectionCircleSizeCenterCalm;
            } else {
                centerCircleSize = ConfigCheckUtils.checkNummerOrDefault(this.cardConfig.current_direction.center_circle_size, GlobalConfig.defaultCurrentDirectionCircleSize);
            }
            return new CurrentDirectionConfig(
                ConfigCheckUtils.checkBooleanDefaultFalse(this.cardConfig.current_direction.show_arrow),
                ConfigCheckUtils.checkNummerOrDefault(this.cardConfig.current_direction.arrow_size, GlobalConfig.defaultCurrentDirectionArrowSize),
                centerCircleSize,
                ConfigCheckUtils.checkNumberOrUndefined('hide_direction_below_speed', this.cardConfig.current_direction.hide_direction_below_speed)
            )
        }
        return new CurrentDirectionConfig(false, undefined, undefined, 0);
    }

    private checkWindspeedEntities(): WindSpeedEntity[] {
        if (!this.cardConfig.windspeed_entities || this.cardConfig.windspeed_entities.length == 0) {
            throw new Error('WindRoseCard: No windspeed_entities configured, minimal 1 needed.');
        }
        const entities:WindSpeedEntity[] = [];
        for (const entityConfig of this.cardConfig.windspeed_entities) {
            entities.push(WindSpeedEntity.fromConfig(entityConfig, this.windspeedBarLocation))
        }
        if (entities.findIndex(entityConfig => entityConfig.useForWindRose) === -1) {
            entities[0].useForWindRose = true;
        }
        return entities;
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

    private createEntitiesQueryParameter() {
        return this.windDirectionEntity + ',' + this.windspeedEntities
            .map(config => config.entity)
            .join(',');
    }

    private checkDeprecations(cardConfig: CardConfig) {
        //Not supported
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'max_width')) {
            throw new Error('max_width option not supported anymore, since using vector graphics.')
        }

        //To data_period
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'hours_to_show')) {
            throw new Error('hours_to_show option on root level is moved to data_period object.')
        }

        //To windspeed_entities
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'windspeed_bar_full')) {
            throw new Error('windspeed_bar_full option on root level is moved to windspeed_entities object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'output_speed_unit')) {
            throw new Error('output_speed_unit option on root level is moved to windspeed_entities object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'output_speed_unit_label')) {
            throw new Error('output_speed_unit_label option on root level is moved to windspeed_entities object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'speed_range_beaufort')) {
            throw new Error('speed_range_beaufort option on root level is moved to windspeed_entities object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'speed_range_step')) {
            throw new Error('speed_range_step option on root level is moved to windspeed_entities object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'speed_range_max')) {
            throw new Error('speed_range_max option on root level is moved to windspeed_entities object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'speed_ranges')) {
            throw new Error('speed_ranges option on root level is moved to windspeed_entities object.')
        }

        //To direction_labels
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'cardinal_direction_letters')) {
            throw new Error('cardinal_direction_letters option on root level is moved to direction_labels object.')
        }

        //To rose_config
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'wind_direction_count')) {
            throw new Error('wind_direction_count option on root level is moved to rose_config object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'background_image')) {
            throw new Error('background_image option on root level is moved to rose_config object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'circle_legend_text_size')) {
            throw new Error('circle_legend_text_size option on root level is moved to rose_config object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'windrose_draw_north_offset')) {
            throw new Error('windrose_draw_north_offset option on root level is moved to rose_config object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'center_calm_percentage')) {
            throw new Error('center_calm_percentage option on root level is moved to rose_config object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'cirlce_count')) {
            throw new Error('cirlce_count option on root level is moved to rose_config object.')
        }
        if (ConfigCheckUtils.checkHasProperty(cardConfig, 'outer_circle_percentage')) {
            throw new Error('outer_circle_percentage option on root level is moved to rose_config object.')
        }
    }
}
