import {ButtonInterface} from "../ButtonInterface";
import {ButtonBaseConfig} from "../ButtonBaseConfig";
import {CardConfigButton} from "../../../card/CardConfigButton";
import {ButtonColors} from "../ButtonColors";
import {ConfigCheckUtils} from "../../ConfigCheckUtils";

export class WindRoseSpeedSelectButton implements ButtonInterface {

    constructor(
        public readonly baseConfig: ButtonBaseConfig,
        public readonly index: number) {
    }

    static fromConfig(button: CardConfigButton, defaultColors: ButtonColors): WindRoseSpeedSelectButton {
        const baseConfig = ButtonBaseConfig.fromConfig(button, defaultColors);
        const index = ConfigCheckUtils.checkNumber("windspeed_entity_index", button.windspeed_entity_index);
        return new WindRoseSpeedSelectButton(baseConfig, index);
    }
}
