import {HomeAssistant} from "custom-card-helpers";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindDirectionConverter} from "../converter/WindDirectionConverter";
import {WindRoseConfigFactory} from "../config/WindRoseConfigFactory";

export class EntityStatesProcessor {

    private initReady = false;
    private cardConfig!: CardConfigWrapper;
    private windDirectionConverter!: WindDirectionConverter;

    private windDirectionState: string | undefined;
    private windDirectionUpdated = false;

    private compassDirectionState: string | undefined;
    private compassDirectionUpdated = false;


    init(cardConfig: CardConfigWrapper) {
        this.cardConfig = cardConfig;
        this.windDirectionConverter = new WindDirectionConverter(new WindRoseConfigFactory(cardConfig).createWindRoseConfig());
        this.initReady = true;
    }

    updateHass(hass: HomeAssistant): void {
        if (this.initReady) {

            if (this.cardConfig.showCurrentDirectionArrow) {
                const newWindDirectionState = hass.states[this.cardConfig.windDirectionEntity.entity].state;
                if (newWindDirectionState !== undefined && this.windDirectionState !== newWindDirectionState) {
                    this.windDirectionUpdated = true;
                    this.windDirectionState = newWindDirectionState;
                }
            }

            if (this.cardConfig.compassConfig.autoRotate) {
                const newCompassDirectionState = hass.states[this.cardConfig.compassConfig.entity as string].state;
                if (newCompassDirectionState !== undefined && this.compassDirectionState !== newCompassDirectionState) {
                    this.compassDirectionUpdated = true;
                    this.compassDirectionState = newCompassDirectionState;
                }
            }

        }
    }

    hasUpdates(): boolean {
        return this.windDirectionUpdated || this.compassDirectionUpdated;
    }

    hasWindDirectionUpdate(): boolean {
        return this.windDirectionUpdated;
    }

    getWindDirection(): number {
        if (this.windDirectionState === undefined) {
            throw new Error("Current wind direction is undefined.");
        }
        const converted = this.windDirectionConverter.convertDirection(this.windDirectionState);
        if (converted === undefined) {
            throw new Error("Current converted wind direction is undefined.");
        }
        this.windDirectionUpdated = false
        return +converted;
    }

    hasCompassDirectionUpdate(): boolean {
        return this.compassDirectionUpdated;
    }

    getCompassDirection(): number {
        if (this.compassDirectionState === undefined) {
            throw new Error("Current compass direction is undefined.");
        }
        this.compassDirectionUpdated = false;
        return +this.compassDirectionState;
    }


}
