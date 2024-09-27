import {HomeAssistant} from "custom-card-helpers";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {WindDirectionConverter} from "../converter/WindDirectionConverter";
import {WindRoseConfigFactory} from "../config/WindRoseConfigFactory";
import {Log2} from "../util/Log2";

export class EntityStatesProcessor {

    private log = new Log2("EntityStatesProcessor");
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
        //this.log.debug("Before updated values: "  + this.windDirectionUpdated + "  " + this.compassDirectionUpdated);
        if (this.initReady) {
            this.windDirectionUpdated = false;
            this.compassDirectionUpdated = false;

            if (this.cardConfig.currentDirection.showArrow) {
                const newWindDirectionState = hass.states[this.cardConfig.windDirectionEntity.entity].state;
                this.log.debug("Old: " + this.windDirectionState + " new: " + newWindDirectionState);
                if (this.windDirectionState != newWindDirectionState) {
                    this.windDirectionUpdated = true;
                    this.windDirectionState = newWindDirectionState;
                }
            }

            if (this.cardConfig.compassConfig.autoRotate) {
                const newCompassDirectionState = hass.states[this.cardConfig.compassConfig.entity as string].state;
                if (newCompassDirectionState !== undefined && this.compassDirectionState != newCompassDirectionState) {
                    this.compassDirectionUpdated = true;
                    this.compassDirectionState = newCompassDirectionState;
                }
            }
            this.log.debug("Updated wind values: "  + this.windDirectionUpdated + "  " + this.windDirectionState);
            this.log.debug("Updated compass values: "  + this.compassDirectionUpdated + "  " + this.compassDirectionState);
        }
    }

    hasUpdates(): boolean {
        return this.windDirectionUpdated || this.compassDirectionUpdated;
    }

    hasWindDirectionUpdate(): boolean {
        return this.windDirectionUpdated;
    }

    getWindDirection(): number | undefined {
        if (this.windDirectionState === undefined) {
            return undefined;
        }
        const converted = this.windDirectionConverter.convertDirection(this.windDirectionState);
        this.log.debug("Wind state: " + this.windDirectionState + " Converted: " + converted);
        if (converted === undefined) {
            return undefined;
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
