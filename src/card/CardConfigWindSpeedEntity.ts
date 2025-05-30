import {CardConfigSpeedRange} from "./CardConfigSpeedRange";
import {CardConfigDynamicSpeedRange} from "./CardConfigDynamicSpeedRange";

export interface CardConfigWindSpeedEntity {
    entity: string;
    attribute: string;
    name: string;
    use_statistics: boolean;
    statistics_period: string;
    render_relative_scale: boolean;
    windspeed_bar_full: boolean;
    speed_unit: string;

    output_speed_unit: string;
    output_speed_unit_label: string;
    speed_range_beaufort: boolean;
    speed_range_step: number;
    speed_range_max: number;
    speed_ranges: CardConfigSpeedRange[];
    dynamic_speed_ranges: CardConfigDynamicSpeedRange[];
    current_speed_arrow: boolean;
    current_speed_arrow_size: number;
    current_speed_arrow_location: string;

    bar_label_text_size: number;
    bar_speed_text_size: number;
    bar_percentage_text_size: number;

    speed_compensation_factor: number;
    speed_compensation_absolute: number;
}
