import {ButtonInterface} from "../ButtonInterface";
import {ButtonBaseConfig} from "../ButtonBaseConfig";
import {CardConfigButton} from "../../../card/CardConfigButton";
import {ButtonColors} from "../ButtonColors";
import {ConfigCheckUtils} from "../../ConfigCheckUtils";

export class PeriodShiftButton
    implements ButtonInterface {

    constructor(
        public readonly baseConfig: ButtonBaseConfig,
        public readonly hours: number) {
    }

    static fromConfig(button: CardConfigButton, defaultColors: ButtonColors): PeriodShiftButton {
        const baseConfig = ButtonBaseConfig.fromConfig(button, defaultColors);
        const hours = ConfigCheckUtils.checkNumber("hours", button.hours);
        return new PeriodShiftButton(baseConfig, hours);
    }
}
