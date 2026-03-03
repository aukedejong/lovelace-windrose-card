export interface CardConfigDataPeriod {

    use_statistics: boolean;
    statistics_period: string;

    preset_period: string;

    from_hour_of_day: number;

    from_period_ago: string;
    to_period_ago: string;

    from_date: string;
    to_date: string;

    period_back: string; //Old hours_to_show
}
