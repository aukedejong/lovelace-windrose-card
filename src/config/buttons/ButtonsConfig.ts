import {CardConfigButtonsConfig} from "../../card/CardConfigButtonsConfig";
import {PeriodSelectorButton} from "./types/PeriodSelectorButton";
import {ButtonColors} from "./ButtonColors";
import {ButtonInterface} from "./ButtonInterface";
import {PeriodShiftButton} from "./types/PeriodShiftButton";
import {WindRoseSpeedSelectButton} from "./types/WindRoseSpeedSelectButton";
import {PeriodShiftPlayButton} from "./types/PeriodShiftPlayButton";

export class ButtonsConfig {

    constructor(
        public readonly location: string,
        public readonly buttons: ButtonInterface[]) {
    }

    disablePeriodSelectors() {
        this.buttons?.filter((button: ButtonInterface) => button instanceof PeriodSelectorButton)
            .forEach((button: ButtonInterface) => button.baseConfig.active = false);
        this.buttons?.filter((button: ButtonInterface) => button instanceof PeriodShiftPlayButton)
            .forEach((button: ButtonInterface) => button.baseConfig.active = false);
    }

    undoPausedPlays() {
        this.buttons?.filter((button: ButtonInterface) => button instanceof PeriodShiftPlayButton)
            .forEach((button: ButtonInterface) => (button as PeriodShiftPlayButton).paused = false);
    }

    disableWindRoseSpeedSelectors() {
        this.buttons?.filter((button: ButtonInterface) => button instanceof WindRoseSpeedSelectButton)
            .forEach((button: ButtonInterface) => button.baseConfig.active = false);
    }

    static getActivePeriodSelector(buttons: ButtonsConfig | undefined): ButtonInterface | undefined {
        const activeButton = buttons?.buttons?.filter(
            (button: ButtonInterface) => button.baseConfig.active && button instanceof PeriodSelectorButton);
        if (activeButton && activeButton.length > 0) {
            return activeButton[0];
        }
        return undefined;
    }

    static fromConfig(buttonsConfig: CardConfigButtonsConfig, windspeedBarLocation: string): ButtonsConfig | undefined {
        if (buttonsConfig == null) {
            return undefined;
        }
        if (buttonsConfig.buttons === undefined || buttonsConfig.buttons.length === 0) {
            throw new Error("WindRoseCard: No buttons configured in buttons_config block.")
        }
        const location = this.checkLocation(buttonsConfig.location);
        const defaultColors = ButtonColors.fromConfig(buttonsConfig.default_colors, undefined);

        const buttons: ButtonInterface[] = [];
        for (const button of buttonsConfig.buttons) {
            switch (button.type) {
                case 'period_selector':
                    buttons.push(PeriodSelectorButton.fromConfig(button, defaultColors));
                    break;
                case 'period_shift':
                    buttons.push(PeriodShiftButton.fromConfig(button, defaultColors));
                    break;
                case 'period_shift_play':
                    buttons.push(PeriodShiftPlayButton.fromConfig(button, defaultColors));
                    break;
                case 'windrose_speed_selector':
                    buttons.push(WindRoseSpeedSelectButton.fromConfig(button, defaultColors));
                    break;
                default: throw new Error('WindRoseCard: button type should be period_selector, period_shift, period_shift_play or windrose_speed_selector')
            }
        }

        return new ButtonsConfig(location, buttons);
    }

    private static checkLocation(location: string | undefined) {
        if (location) {
            if (location !== 'top' && location !== 'bottom' && location !== 'top-below-text' && location !== 'bottom-above-text') {
                throw new Error('WindRoseCard: Buttons location should be top, top-below-text, bottom or bottom-above-text, not ' + location);
            }
            return location;
        }
        return 'top';
    }
}
