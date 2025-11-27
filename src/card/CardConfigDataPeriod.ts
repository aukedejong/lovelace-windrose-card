import {CardConfigPeriodSelector} from "./CardConfigPeriodSelector";

export interface CardConfigDataPeriod {
    hours_to_show: number;
    period_selector: CardConfigPeriodSelector;
    from_hour_of_day: number;
    from_hours_ago: number;
    to_hours_ago: number;
    time_interval: number;
    log_measurement_counts: boolean;
}
