import {WindDirectionEntity} from "../config/WindDirectionEntity";
import {WindSpeedEntity} from "../config/WindSpeedEntity";
import {Period} from "../config/buttons/Period";

export class HARequestData {

    constructor(
        public entity: string,
        public attribute: string | undefined,
        public useStatistics: boolean,
        public statisticsPeriod: string | undefined) {
    }

    static fromWindDirectionEntity(config: WindDirectionEntity, period: Period) {
        if (period.useStatistics !== undefined) {
            return new HARequestData(config.entity, config.attribute, period.useStatistics, period.statisticsPeriod);
        }
        return new HARequestData(config.entity, config.attribute, config.useStatistics, config.statisticsPeriod);
    }

    static fromWindSpeedEntity(config: WindSpeedEntity, period: Period) {
        if (period.useStatistics !== undefined) {
            return new HARequestData(config.entity, config.attribute, period.useStatistics, period.statisticsPeriod);
        }
        return new HARequestData(config.entity, config.attribute, config.useStatistics, config.statisticsPeriod);
    }
}
