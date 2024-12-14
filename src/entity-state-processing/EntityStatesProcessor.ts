import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindDirectionConverter} from "../converter/WindDirectionConverter";
import {Log2} from "../util/Log2";
import {Log} from "../util/Log";
import {EntityState} from "./EntityState";
import {HomeAssistant} from "../util/HomeAssistant";

export class EntityStatesProcessor {

    private log = new Log2("EntityStatesProcessor");
    private initReady = false;
    private cardConfig!: CardConfigWrapper;
    private windDirectionConverter!: WindDirectionConverter;

    private windDirectionState!: EntityState;
    private compassDirectionState!: EntityState;
    private cornerTopLeftState!: EntityState;
    private cornerTopRightState!: EntityState;
    private cornerBottomLeftState!: EntityState;
    private cornerBottomRightState!: EntityState;

    private entityStates: EntityState[] = [];
    private cornerInfoStates: EntityState[] = [];

    init(cardConfig: CardConfigWrapper) {
        this.cardConfig = cardConfig;
        this.windDirectionConverter = new WindDirectionConverter(cardConfig.windDirectionEntity);

        this.windDirectionState = new EntityState(this.cardConfig.currentDirection.showArrow, this.cardConfig.windDirectionEntity.entity);
        this.compassDirectionState = new EntityState(this.cardConfig.compassConfig.autoRotate, this.cardConfig.compassConfig.entity);

        const cornerInfo = this.cardConfig.cornersInfo;
        this.cornerTopLeftState = new EntityState(cornerInfo.topLeftInfo.show, cornerInfo.topLeftInfo.entity);
        this.cornerTopRightState = new EntityState(cornerInfo.topRightInfo.show, cornerInfo.topRightInfo.entity);
        this.cornerBottomLeftState = new EntityState(cornerInfo.bottomLeftInfo.show, cornerInfo.bottomLeftInfo.entity);
        this.cornerBottomRightState = new EntityState(cornerInfo.bottomRightInfo.show, cornerInfo.bottomRightInfo.entity);


        this.cornerInfoStates = [this.cornerTopLeftState, this.cornerTopRightState, this.cornerBottomLeftState, this.cornerBottomRightState];
        this.entityStates = [this.windDirectionState, this.compassDirectionState, this.cornerTopLeftState,
                this.cornerTopRightState, this.cornerBottomLeftState, this.cornerBottomRightState];
        this.initReady = true;
    }

    updateHass(hass: HomeAssistant): void {
        //this.log.debug("Before updated values: "  + this.windDirectionUpdated + "  " + this.compassDirectionUpdated);
        if (this.initReady) {
            this.windDirectionState.updated = false;
            this.compassDirectionState.updated = false;

            this.entityStates.forEach((state: EntityState) => {
                this.procesState(hass, state);
            });

            this.log.debug("Updated wind values: "  + this.windDirectionState.updated + "  " + this.windDirectionState.state);
            this.log.debug("Updated compass values: "  + this.compassDirectionState.updated + "  " + this.compassDirectionState.state);
        }
    }

    private procesState(hass: HomeAssistant, entityState: EntityState) {
        if (entityState.entity === undefined || !entityState.active) {
            return;
        }
        const newState = hass.states[entityState.entity].state;
        if (newState !== undefined && entityState.state != newState) {
            entityState.updated = true;
            entityState.state = newState;
        }
    }

    hasUpdates(): boolean {
        return this.entityStates.some(state => state.updated);
    }

    hasWindDirectionUpdate(): boolean {
        return this.windDirectionState.updated;
    }

    getWindDirection(): number | undefined {
        if (this.windDirectionState.state === undefined) {
            return undefined;
        }
        const converted = this.windDirectionConverter.convertDirection(this.windDirectionState.state);
        this.log.debug("Wind state: " + this.windDirectionState.state + " Converted: " + converted);
        if (converted === undefined) {
            return undefined;
        }
        this.windDirectionState.updated = false
        return +converted;
    }

    hasCompassDirectionUpdate(): boolean {
        return this.compassDirectionState.updated;
    }

    getCompassDirection(): number {
        if (this.compassDirectionState.state === undefined) {
            Log.warn("Current compass direction is undefined, showing north");
            this.compassDirectionState.state = "0";
        }
        this.compassDirectionState.updated = false;
        return +this.compassDirectionState.state;
    }

    hasCornerInfoUpdates(): boolean {
        return this.cornerInfoStates.some((state) => state.updated);
    }

    getCornerInfoStates(): EntityState[] {
        return [this.cornerTopLeftState, this.cornerTopRightState, this.cornerBottomLeftState, this.cornerBottomRightState];
    }

}
