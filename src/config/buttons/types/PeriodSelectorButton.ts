import {Period} from "../Period";
import {ButtonBaseConfig} from "../ButtonBaseConfig";
import {CardConfigButton} from "../../../card/CardConfigButton";
import {ButtonColors} from "../ButtonColors";
import {ButtonInterface} from "../ButtonInterface";

export class PeriodSelectorButton implements ButtonInterface {

    constructor(
        public readonly baseConfig: ButtonBaseConfig,
        public readonly period: Period) {
    }

    static fromConfig(config: CardConfigButton, defaultColors: ButtonColors): PeriodSelectorButton {
        const baseConfig = ButtonBaseConfig.fromConfig(config, defaultColors);
        const period = Period.fromConfig(config);

        return new PeriodSelectorButton(baseConfig, period!);
    }
}
