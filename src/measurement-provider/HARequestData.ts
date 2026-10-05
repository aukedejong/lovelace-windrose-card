import { WindDirectionEntity } from "../config/WindDirectionEntity";
import { WindSpeedEntity } from "../config/WindSpeedEntity";
import { Period } from "../config/buttons/Period";

export class HARequestData {

    constructor(
        public entity: string,
        public attribute: string | undefined,
        public useStatistics: boolean,
        public statisticsPeriod: string | undefined,
        public statisticsType: string | undefined,
        public useForecast: boolean = false) {
    }

    static fromWindDirectionEntity(config: WindDirectionEntity, period: Period) {
        if (period.forecastPeriod) {
            return HARequestData.forecast(config.entity, config.forecastAttribute);
        }
        if (period.useStatistics !== undefined) {
            return new HARequestData(config.entity, config.attribute, period.useStatistics, period.statisticsPeriod, 'mean');
        }
        return new HARequestData(config.entity, config.attribute, config.useStatistics, config.statisticsPeriod, 'mean');
    }

    static fromWindSpeedEntity(config: WindSpeedEntity, period: Period) {
        if (period.forecastPeriod) {
            return HARequestData.forecast(config.entity, config.forecastAttribute);
        }
        if (period.useStatistics !== undefined) {
            return new HARequestData(config.entity, config.attribute, period.useStatistics, period.statisticsPeriod, period.statisticsType);
        }
        return new HARequestData(config.entity, config.attribute, config.useStatistics, config.statisticsPeriod, config.statisticsType);
    }

    private static forecast(entity: string, attribute: string | undefined) {
        if (!attribute) {
            throw new Error(`WindRoseCard: forecast_attribute is required for ${entity} when using a forecast period.`);
        }
        return new HARequestData(entity, attribute, false, undefined, undefined, true);
    }
}
