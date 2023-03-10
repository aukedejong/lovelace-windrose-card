export interface CardConfig {
    type: string;
    title: string;

    hours_to_show: number;
    refresh_interval: number;
    max_width: number;
    wind_direction_entity: string;
    windspeed_entities: {entity: string, name: string}[];
    wind_direction_unit: string;
    input_speed_unit: string;
    output_speed_unit: string;
    speed_range_step: number;
    speed_range_max: number;
    speed_ranges: CardConfigSpeedRange[];

    windrose_draw_north_offset: number;
    direction_compensation: number;
    windspeed_bar_location: string;
    windspeed_bar_full: boolean;
    cardinal_direction_letters: string;
    wind_direction_count: number;
    matching_strategy: string;
    direction_speed_time_diff: number;
}

export interface CardConfigSpeedRange {
    from_value: number;
    color: string;
}