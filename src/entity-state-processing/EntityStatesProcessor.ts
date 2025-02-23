import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindDirectionConverter} from "../converter/WindDirectionConverter";
import {Log2} from "../util/Log2";
import {Log} from "../util/Log";
import {EntityState} from "./EntityState";
import {HomeAssistant} from "../util/HomeAssistant";
import {WindSpeedConverter} from "../converter/WindSpeedConverter";
import {SpeedUnits} from "../converter/SpeedUnits";

export class EntityStatesProcessor {

    private log = new Log2("EntityStatesProcessor");
    private initReady = false;
    private cardConfig!: CardConfigWrapper;
    private windDirectionConverter!: WindDirectionConverter;
    private windSpeedConverterFunc!: (speed: number) => number;

    private windDirectionState!: EntityState;
    private windSpeedState!: EntityState;
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
        this.windSpeedConverterFunc = new WindSpeedConverter(SpeedUnits.getSpeedUnit(cardConfig.windspeedEntities[0].outputSpeedUnit)).getSpeedConverterFunc(cardConfig.windspeedEntities[0].speedUnit);

        this.windDirectionState = new EntityState(this.cardConfig.currentDirection.showArrow,
            this.cardConfig.windDirectionEntity.entity, this.cardConfig.windDirectionEntity.attribute);
        this.windSpeedState = new EntityState(this.cardConfig.currentDirection.showArrow,
            this.cardConfig.windspeedEntities[0].entity, this.cardConfig.windspeedEntities[0].attribute);
        this.compassDirectionState = new EntityState(this.cardConfig.compassConfig.autoRotate,
            this.cardConfig.compassConfig.entity, this.cardConfig.compassConfig.attribute);

        const cornerInfo = this.cardConfig.cornersInfo;
        this.cornerTopLeftState = new EntityState(cornerInfo.topLeftInfo.show, cornerInfo.topLeftInfo.entity, cornerInfo.topLeftInfo.attribute);
        this.cornerTopRightState = new EntityState(cornerInfo.topRightInfo.show, cornerInfo.topRightInfo.entity, cornerInfo.topRightInfo.attribute);
        this.cornerBottomLeftState = new EntityState(cornerInfo.bottomLeftInfo.show, cornerInfo.bottomLeftInfo.entity, cornerInfo.bottomLeftInfo.attribute);
        this.cornerBottomRightState = new EntityState(cornerInfo.bottomRightInfo.show, cornerInfo.bottomRightInfo.entity, cornerInfo.bottomRightInfo.attribute);

        this.cornerInfoStates = [this.cornerTopLeftState, this.cornerTopRightState, this.cornerBottomLeftState, this.cornerBottomRightState];
        this.entityStates = [this.windDirectionState, this.windSpeedState, this.compassDirectionState, this.cornerTopLeftState,
                this.cornerTopRightState, this.cornerBottomLeftState, this.cornerBottomRightState];
        this.initReady = true;
    }

    updateHass(hass: HomeAssistant): void {
        //this.log.debug("Before updated values: "  + this.windDirectionUpdated + "  " + this.compassDirectionUpdated);
        if (this.initReady) {
            this.windDirectionState.updated = false;
            this.windSpeedState.updated = false;
            this.compassDirectionState.updated = false;

            this.entityStates.forEach((state: EntityState) => {
                this.procesState(hass, state);
            });
            this.log.trace("Updated speed values: "  + this.windSpeedState.updated + "  " + this.windSpeedState.state);
            this.log.trace("Updated wind values: "  + this.windDirectionState.updated + "  " + this.windDirectionState.state);
            this.log.trace("Updated compass values: "  + this.compassDirectionState.updated + "  " + this.compassDirectionState.state);
        }
    }

    private procesState(hass: HomeAssistant, entityState: EntityState) {
        if (entityState.entity === undefined || !entityState.active) {
            return;
        }
        let newState;
        if (entityState.attribute) {
            newState = hass.states[entityState.entity].attributes[entityState.attribute];
        } else {
            newState = hass.states[entityState.entity].state;
        }
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
        this.log.trace("Wind direction state: " + this.windDirectionState.state + " Converted: " + converted);
        if (converted === undefined) {
            return undefined;
        }
        this.windDirectionState.updated = false
        return +converted;
    }

    hasWindSpeedUpdate(): boolean {
        return this.windSpeedState.updated;
    }

    getWindSpeed(): number | undefined {
        if (this.windSpeedState.state === undefined) {
            return undefined;
        }
        const converted = this.windSpeedConverterFunc(+this.windSpeedState.state);
        this.log.trace("Wind speed state: " + this.windSpeedState.state + " Converted: " + converted);
        if (converted === undefined) {
            return undefined;
        }
        return converted;
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
