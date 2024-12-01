import {CardConfigSpeedRange} from "./CardConfigSpeedRange";

export interface CardConfigWindSpeedEntity {
    entity: string;
    name: string;
    use_statistics: boolean;
    render_relative_scale: boolean;
    windspeed_bar_full: boolean;
    speed_unit: string;

    output_speed_unit: string;
    output_speed_unit_label: string;
    speed_range_beaufort: boolean;
    speed_range_step: number;
    speed_range_max: number;
    speed_ranges: CardConfigSpeedRange[];
}
