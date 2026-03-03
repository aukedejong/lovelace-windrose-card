import {ButtonInterface} from "../ButtonInterface";
import {ButtonBaseConfig} from "../ButtonBaseConfig";
import {CardConfigButton} from "../../../card/CardConfigButton";
import {ButtonColors} from "../ButtonColors";
import {PeriodCodeHelper} from "../../../util/PeriodCodeHelper";

export class PeriodShiftButton
    implements ButtonInterface {

    constructor(
        public readonly baseConfig: ButtonBaseConfig,
        public readonly shiftPeriod: string) {
    }

    static fromConfig(button: CardConfigButton, defaultColors: ButtonColors): PeriodShiftButton {
        const baseConfig = ButtonBaseConfig.fromConfig(button, defaultColors);
        if (PeriodCodeHelper.check("shift_period", button.shift_period)) {
            return new PeriodShiftButton(baseConfig, button.shift_period);
        }
        throw new Error("WindRoseCard: ")
    }
}
