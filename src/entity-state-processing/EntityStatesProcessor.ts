import {HomeAssistant} from "custom-card-helpers";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindDirectionConverter} from "../converter/WindDirectionConverter";
import {EntityStates} from "./EntityStates";
import {WindRoseConfigFactory} from "../config/WindRoseConfigFactory";
import {Log} from "../util/Log";

export class EntityStatesProcessor {

    private initReady = false;
    private cardConfig!: CardConfigWrapper;
    private windDirectionConverter!: WindDirectionConverter;
    private windDirectionEntity!: string;

    private previousWindDirection: string | undefined;

    init(cardConfig: CardConfigWrapper) {
        this.cardConfig = cardConfig;
        this.windDirectionEntity = cardConfig.windDirectionEntity.entity;
        this.windDirectionConverter = new WindDirectionConverter(new WindRoseConfigFactory(cardConfig).createWindRoseConfig());
        this.initReady = true;
    }

    updatedHass(hass: HomeAssistant): EntityStates {
        if (this.initReady && this.cardConfig.showCurrentDirectionArrow) {
            const currentWindDirection = this.readCurrentWindDirection(hass);
            if (currentWindDirection !== undefined) {
                return new EntityStates(currentWindDirection, true);
            }
            return new EntityStates(currentWindDirection, false);
        }
        return EntityStates.doNothing();
    }

    private readCurrentWindDirection(hass: HomeAssistant): number | undefined {
        const state = hass.states[this.windDirectionEntity];
        if (state.state != this.previousWindDirection) {
            this.previousWindDirection = state.state;
            Log.debug("Update current direction state: ", state.state);
            return this.windDirectionConverter.convertDirection(state.state);
        }
        return undefined;
    }


}
