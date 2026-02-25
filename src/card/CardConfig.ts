import {CardConfigColors} from "./CardConfigColors";
import {CardConfigWindSpeedEntity} from "./CardConfigWindSpeedEntity";
import {CardConfigWindDirectionEntity} from "./CardConfigWindDirectionEntity";
import {CardConfigDataPeriod} from "./CardConfigDataPeriod";
import {CardConfigCompass} from "./CardConfigCompass";
import {CardConfigCurrentDirection} from "./CardConfigCurrentDirection";
import {CardConfigCorners} from "./CardConfigCorners";
import {CardConfigActions} from "./CardConfigActions";
import {CardConfigDirectionLabels} from "./CardConfigDirectionLabels";
import {CardConfigTextBlocks} from "./CardConfigTextBlocks";
import {CardConfigButtonsConfig} from "./CardConfigButtonsConfig";
import {CardConfigMatchingStrategy} from "./CardConfigMatchingStrategy";
import {CardConfigRose} from "./CardConfigRose";

export interface CardConfig {
    type: string;
    title: string;

    data_period: CardConfigDataPeriod;
    buttons_config: CardConfigButtonsConfig;

    refresh_interval: number;
    wind_direction_entity: CardConfigWindDirectionEntity;
    windspeed_entities: CardConfigWindSpeedEntity[];
    disable_animations: boolean;
    rose_config: CardConfigRose;
    compass_direction: CardConfigCompass;
    current_direction: CardConfigCurrentDirection;
    windspeed_bar_location: string;
    hide_windspeed_bar: boolean;
    card_width: number;
    direction_labels: CardConfigDirectionLabels;
    matching_strategy: CardConfigMatchingStrategy;

    log_level: string;
    corner_info: CardConfigCorners;
    text_blocks: CardConfigTextBlocks;
    actions: CardConfigActions;

    colors: CardConfigColors;
}
