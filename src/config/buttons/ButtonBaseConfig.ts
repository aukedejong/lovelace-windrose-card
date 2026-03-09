import {CardConfigButton} from "../../card/CardConfigButton";
import {ButtonColors} from "./ButtonColors";
import {ConfigCheckUtils} from "../ConfigCheckUtils";

export class ButtonBaseConfig {

    constructor(
        public readonly buttonText: string,
        public readonly buttonColors: ButtonColors,
        public readonly newRow: boolean,
        public active: boolean) {
    }

    static fromConfig(config: CardConfigButton, defaultColors: ButtonColors) {
        if (config.button_text === undefined) {
            throw new Error('WindRoseCard: button_text field not set for button.')
        }
        return new ButtonBaseConfig(
            config.button_text,
            ButtonColors.fromConfig(config.colors, defaultColors),
            ConfigCheckUtils.checkBooleanDefaultFalse(config.new_row),
            config.active);
    }
}
