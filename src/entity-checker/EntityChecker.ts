import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {HomeAssistant} from "custom-card-helpers";
import {EntityCheckResult} from "./EntityCheckResult";
import {Log} from "../util/Log";

export class EntityChecker {

    private hass!: HomeAssistant;

    async checkEntities(cardConfig: CardConfigWrapper, hass: HomeAssistant): Promise<void> {
        this.hass = hass;
        if (!this.hass) {
            Log.warn('Can\'t check entities, hass not set.');
        }
        const entityCheckResults = await this.getEntityStates(cardConfig);
        for (const result of entityCheckResults) {
            if (result.error) {
                throw new Error(`Entity ${result.entity} not found.`);
            }
            if (result.unit) {
                const speedEntity = cardConfig.windspeedEntities.find(entity => entity.entity === result.entity);

                if (speedEntity && speedEntity.speedUnit === 'auto') {
                    speedEntity.speedUnit = result.unit;
                    Log.info(`Windspeed unit detected for ${speedEntity.entity}: ${result.unit}`)
                }
            }
        }
    }

    private async getEntityStates(cardConfig: CardConfigWrapper): Promise<EntityCheckResult[]> {

        const stateCallResults: EntityCheckResult[] = [];

        for (const entity of cardConfig.windspeedEntities) {
            stateCallResults.push(await this.callEntityState(entity.entity));
        }
        return Promise.resolve(stateCallResults);
    }

    private async callEntityState(entity: string): Promise<EntityCheckResult> {
        try {
            const result = await this.hass.callApi('GET', 'states/' + entity) as any;
            const unit = result?.attributes?.unit_of_measurement;
            return new EntityCheckResult(entity, unit, undefined);
        } catch (error: any) {
            return new EntityCheckResult(entity, undefined, error);
        }
    }
}