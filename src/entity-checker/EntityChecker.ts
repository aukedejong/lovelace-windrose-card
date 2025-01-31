import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CornerInfo} from "../config/CornerInfo";
import {HomeAssistant} from "../util/HomeAssistant";

export class EntityChecker {

    public checkEntities(cardConfig: CardConfigWrapper, hass: HomeAssistant) {

        const windDirectionEntity = cardConfig.windDirectionEntity;
        this.checkEntity(windDirectionEntity.entity, windDirectionEntity.attribute, windDirectionEntity.useStatistics, hass);

        for (const entity of cardConfig.windspeedEntities) {
            this.checkEntity(entity.entity, entity.attribute, entity.useStatistics, hass);
            if (entity.speedUnit === 'auto') {
                if (hass.states[entity.entity].attributes.unit_of_measurement !== undefined) {
                    entity.speedUnit = hass.states[entity.entity].attributes.unit_of_measurement as string;
                } else if (hass.states[entity.entity].attributes.wind_speed_unit !== undefined) {
                    entity.speedUnit = hass.states[entity.entity].attributes.wind_speed_unit as string;
                } else {
                    throw new Error(`Entity ${entity.entity} speed unit could not be auto determined, please configure the unit.`)
                }
            }
        }

        if (cardConfig.compassConfig && cardConfig.compassConfig.autoRotate && cardConfig.compassConfig.entity) {
            this.checkEntity(cardConfig.compassConfig.entity, cardConfig.compassConfig.attribute, false, hass);
        }

        this.checkCornerInfo(cardConfig.cornersInfo.topLeftInfo, hass);
        this.checkCornerInfo(cardConfig.cornersInfo.topRightInfo, hass);
        this.checkCornerInfo(cardConfig.cornersInfo.bottomLeftInfo, hass);
        this.checkCornerInfo(cardConfig.cornersInfo.bottomRightInfo, hass);
    }

    private checkCornerInfo(cornerInfo: CornerInfo, hass: HomeAssistant) {
        if (cornerInfo.show && cornerInfo.entity) {
            this.checkEntity(cornerInfo.entity, cornerInfo.attribute, false, hass);
            if (cornerInfo.precision === undefined) {
                cornerInfo.precision = hass.entities[cornerInfo.entity]?.display_precision;
            }
        }
    }

    private checkEntity(entity: string, attribute: string | undefined, statsSupport: boolean, hass: HomeAssistant) {
        if (hass.states[entity] === undefined) {
            throw new Error(`Entity ${entity} not found.`);
        }
        if (statsSupport) {
            if (hass.states[entity].attributes['state_class'] !== 'measurement') {
                throw new Error(`Entity ${entity} does not support long term statistics, state_class should be measurement.`);
            }
        }
        if (attribute) {
            if (hass.states[entity].attributes[attribute] == undefined) {
                throw new Error(`Attribute ${attribute} not found in entity ${entity}.`);
            }
        }
    }
}
