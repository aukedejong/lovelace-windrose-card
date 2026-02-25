import {ButtonInterface} from "../ButtonInterface";
import {ButtonBaseConfig} from "../ButtonBaseConfig";
import {CardConfigButton} from "../../../card/CardConfigButton";
import {ButtonColors} from "../ButtonColors";
import {ConfigCheckUtils} from "../../ConfigCheckUtils";
import {Period} from "../Period";

export class PeriodShiftPlayButton
    implements ButtonInterface {

    public paused: boolean = false;

    constructor(
        public readonly baseConfig: ButtonBaseConfig,
        public readonly stepHours: number,
        public readonly periodHours: number,
        public readonly delay: number,
        public readonly period: Period) {
    }

    static fromConfig(button: CardConfigButton, defaultColors: ButtonColors): PeriodShiftPlayButton {

        const baseConfig = ButtonBaseConfig.fromConfig(button, defaultColors);
        const period = Period.fromConfig(button);
        if (!period) {
            throw new Error("Period not set for period shift play button.");
        }
        const stepHours = ConfigCheckUtils.checkNumber("step_hours", button.step_hours);
        const periodHours = ConfigCheckUtils.checkNumber("period_hours", button.period_hours);
        const delay = ConfigCheckUtils.checkNumber("delay", button.delay);

        return new PeriodShiftPlayButton(baseConfig, stepHours, periodHours, delay, period);
    }

    getFirstPeriod(): Period {
        const endDate = new Date(this.period.startTime.getTime() + (this.periodHours * 3600000));
        return new Period('play', this.period.useStatistics, this.period.statisticsPeriod, undefined,undefined, undefined,
            undefined, undefined, this.period.startTime, endDate);
    }

}
