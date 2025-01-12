import {CardConfigSpeedRange} from "./CardConfigSpeedRange";
import {CardConfigColors} from "./CardConfigColors";
import {CardConfigWindSpeedEntity} from "./CardConfigWindSpeedEntity";
import {CardConfigWindDirectionEntity} from "./CardConfigWindDirectionEntity";
import {CardConfigDataPeriod} from "./CardConfigDataPeriod";
import {CardConfigCompass} from "./CardConfigCompass";
import {CardConfigCurrentDirection} from "./CardConfigCurrentDirection";
import {CardConfigCorners} from "./CardConfigCorners";
import {CardConfigActions} from "./CardConfigActions";
import {CardConfigDirectionLabels} from "./CardConfigDirectionLabels";

export interface CardConfig {
    type: string;
    title: string;

    hours_to_show: number;
    data_period: CardConfigDataPeriod;

    refresh_interval: number;
    wind_direction_entity: CardConfigWindDirectionEntity;
    windspeed_entities: CardConfigWindSpeedEntity[];
    //Deprecated
    output_speed_unit: string;
    output_speed_unit_label: string;
    speed_range_beaufort: boolean;
    speed_range_step: number;
    speed_range_max: number;
    speed_ranges: CardConfigSpeedRange[];
    //----------
    center_calm_percentage: boolean;
    windrose_draw_north_offset: number;
    compass_direction: CardConfigCompass;
    current_direction: CardConfigCurrentDirection;
    windspeed_bar_location: string;
    windspeed_bar_full: boolean;
    hide_windspeed_bar: boolean;
    cardinal_direction_letters: string; //Deprecated
    direction_labels: CardConfigDirectionLabels;
    wind_direction_count: number;
    matching_strategy: string;
    background_image: string;
    log_level: string;
    corner_info: CardConfigCorners;
    actions: CardConfigActions;

    colors: CardConfigColors;
}
