import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {HomeAssistant} from "custom-card-helpers";

export class EntityChecker {

    private hass!: HomeAssistant;

    public checkEntities(cardConfig: CardConfigWrapper, hass: HomeAssistant) {
        this.checkEntity(cardConfig.windDirectionEntity.entity, hass);
        for (const entity of cardConfig.windspeedEntities) {
            this.checkEntity(entity.entity, hass);
            if (entity.speedUnit === 'auto' && hass.states[entity.entity].attributes.unit_of_measurement !== undefined) {
                entity.speedUnit = hass.states[entity.entity].attributes.unit_of_measurement as string;
            }
        }
    }

    private checkEntity(entity: string, hass: HomeAssistant) {
        if (hass.states[entity] === undefined) {
            throw new Error(`Entity ${entity} not found.`);
        }
    }
}
