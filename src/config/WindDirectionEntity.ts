import {CardConfigWindDirectionEntity} from "../card/CardConfigWindDirectionEntity";
import {ConfigCheckUtils} from "./ConfigCheckUtils";
import {HARequestData} from "../measurement-provider/HARequestData";

export class WindDirectionEntity implements HARequestData {

    constructor(
        public readonly entity: string,
        public readonly attribute: string | undefined,
        public readonly useStatistics: boolean,
        public readonly statisticsPeriod: string | undefined,
        public readonly directionCompensation: number,
        public readonly directionLetters: string | undefined,
    ) {}

    static fromConfig(entityConfig: CardConfigWindDirectionEntity): WindDirectionEntity {

        if (entityConfig) {
            if (entityConfig.entity === undefined) {
                throw new Error("WindRoseCard: No wind_direction_entity.entity configured.");
            }
            const entity = entityConfig.entity;
            const useStatistics = ConfigCheckUtils.checkBooleanDefaultFalse(entityConfig.use_statistics);
            const statsPeriod = ConfigCheckUtils.checkStatisticsPeriod(entityConfig.statistics_period);
            const directionCompensation = this.checkDirectionCompensation(entityConfig.direction_compensation);
            const directionLetters = this.checkDirectionLetters(entityConfig.direction_letters);
            this.checkAttribuutStatsCombi(useStatistics, entityConfig.attribute);
            return new WindDirectionEntity(entity, entityConfig.attribute, useStatistics, statsPeriod, directionCompensation, directionLetters);
        }
        throw new Error("WindRoseCard: No wind_direction_entity configured.");
    }

    private static checkDirectionCompensation(directionCompensation: number): number {
        if (directionCompensation && isNaN(directionCompensation)) {
            throw new Error('WindRoseCard: Invalid direction compensation, should be a number in degress between 0 and 360.');
        } else if (directionCompensation) {
            return directionCompensation;
        }
        return 0;
    }

    private static checkDirectionLetters(directionLetters: string): string | undefined {
        if (directionLetters) {

            if (directionLetters && directionLetters.length === 5) {
                return directionLetters.toUpperCase();
            } else {
                throw new Error('WindRoseCard: direction_letters config should be 5 letters.');
            }
        }
        return undefined;
    }

    private static checkAttribuutStatsCombi(useStatistics: boolean, attribute: string) {
        if (useStatistics && attribute) {
            throw new Error("Statistics not supported for attribute values.");
        }
    }
}
