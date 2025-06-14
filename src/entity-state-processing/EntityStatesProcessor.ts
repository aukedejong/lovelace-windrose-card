import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindDirectionConverter} from "../converter/WindDirectionConverter";
import {Log2} from "../util/Log2";
import {Log} from "../util/Log";
import {EntityState} from "./EntityState";
import {HomeAssistant} from "../util/HomeAssistant";
import {WindSpeedConverter} from "../converter/WindSpeedConverter";
import {SpeedUnits} from "../converter/SpeedUnits";
import {TemplateParser} from "../textblocks/TemplateParser";

export class EntityStatesProcessor {

    private log = new Log2("EntityStatesProcessor");
    private initReady = false;
    private cardConfig!: CardConfigWrapper;
    private windDirectionConverter!: WindDirectionConverter;
    private windSpeedConverterFuncs: ((speed: number) => number)[] = [];

    private windDirectionState!: EntityState;
    private windSpeedStates: EntityState[] = [];
    private compassDirectionState!: EntityState;
    private cornerTopLeftState!: EntityState;
    private cornerTopRightState!: EntityState;
    private cornerBottomLeftState!: EntityState;
    private cornerBottomRightState!: EntityState;

    private entityStates: EntityState[] = [];
    private cornerInfoStates: EntityState[] = [];
    private textBlockStates: EntityState[] = [];

    init(cardConfig: CardConfigWrapper) {
        this.cardConfig = cardConfig;
        this.windDirectionConverter = new WindDirectionConverter(cardConfig.windDirectionEntity);

        this.windDirectionState = new EntityState(this.cardConfig.currentDirection.showArrow,
            this.cardConfig.windDirectionEntity.entity, this.cardConfig.windDirectionEntity.attribute);

        this.windSpeedStates = [];
        this.cardConfig.windspeedEntities.forEach((windSpeedEntity, index) => {
            this.windSpeedStates.push(new EntityState(windSpeedEntity.currentSpeedArrow, windSpeedEntity.entity, windSpeedEntity.attribute));
            this.windSpeedConverterFuncs.push(new WindSpeedConverter(SpeedUnits.getSpeedUnit(cardConfig.windspeedEntities[index].outputSpeedUnit))
                .getSpeedConverterFunc(cardConfig.windspeedEntities[index].speedUnit));
        });

        this.compassDirectionState = new EntityState(this.cardConfig.compassConfig.autoRotate,
            this.cardConfig.compassConfig.entity, this.cardConfig.compassConfig.attribute);

        const cornerInfo = this.cardConfig.cornersInfo;
        this.cornerTopLeftState = new EntityState(cornerInfo.topLeftInfo.show, cornerInfo.topLeftInfo.entity, cornerInfo.topLeftInfo.attribute);
        this.cornerTopRightState = new EntityState(cornerInfo.topRightInfo.show, cornerInfo.topRightInfo.entity, cornerInfo.topRightInfo.attribute);
        this.cornerBottomLeftState = new EntityState(cornerInfo.bottomLeftInfo.show, cornerInfo.bottomLeftInfo.entity, cornerInfo.bottomLeftInfo.attribute);
        this.cornerBottomRightState = new EntityState(cornerInfo.bottomRightInfo.show, cornerInfo.bottomRightInfo.entity, cornerInfo.bottomRightInfo.attribute);

        const entitiesTop = TemplateParser.findEntityPlaceholders(cardConfig.textBlocks?.top?.text);
        const entitiesBottom = TemplateParser.findEntityPlaceholders(cardConfig.textBlocks?.bottom?.text);
        this.textBlockStates = entitiesTop.concat(entitiesBottom);

        this.cornerInfoStates = [this.cornerTopLeftState, this.cornerTopRightState, this.cornerBottomLeftState, this.cornerBottomRightState];
        this.entityStates = [this.windDirectionState, this.compassDirectionState].concat(this.windSpeedStates).concat(this.cornerInfoStates).concat(this.textBlockStates);
        this.initReady = true;
    }

    updateHass(hass: HomeAssistant): void {
        if (this.initReady) {
            this.entityStates.forEach((state: EntityState) => {
                this.procesState(hass, state);
            });
            this.log.trace("Updated wind direction values: "  + this.windDirectionState.updated + "  " + this.windDirectionState.state);
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

    hasWindSpeedUpdate(index: number): boolean {
        return this.windSpeedStates[index].updated;
    }

    getWindSpeed(index: number, resetUpdated: boolean = true): number | undefined {
        if (this.windSpeedStates[index].state === undefined) {
            return undefined;
        }
        const converted = this.windSpeedConverterFuncs[index](+this.windSpeedStates[index].state);
        this.log.trace("Wind speed state: " + this.windSpeedStates[index].state + " Converted: " + converted);
        if (converted === undefined) {
            return undefined;
        }
        if (resetUpdated) {
            this.windSpeedStates[index].updated = false;
        }
        return converted;
    }

    hasCompassDirectionUpdate(): boolean {
        return this.compassDirectionState.updated;
    }

    getCompassDirection(): number {
        this.log.method('getCompassDirection()', this.compassDirectionState);
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
        return this.cornerInfoStates;
    }

    hasTextBlockUpdates(): boolean {
        return this.textBlockStates.some((state) => state.updated);
    }

    getTextBlockStates(): EntityState[] {
        return this.textBlockStates;
    }

}
