export interface CardConfigWindDirectionEntity {
    entity: string;
    attribute: string;
    forecast_attribute?: string;
    use_statistics: boolean;
    statistics_period: string;
    direction_compensation: number;
    direction_letters: string;
}
