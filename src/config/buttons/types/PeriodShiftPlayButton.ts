import {ButtonInterface} from "../ButtonInterface";
import {ButtonBaseConfig} from "../ButtonBaseConfig";
import {CardConfigButton} from "../../../card/CardConfigButton";
import {ButtonColors} from "../ButtonColors";
import {ConfigCheckUtils} from "../../ConfigCheckUtils";
import {Period} from "../Period";
import {PeriodCodeHelper} from "../../../util/PeriodCodeHelper";

export class PeriodShiftPlayButton
    implements ButtonInterface {

    public paused: boolean = false;

    constructor(
        public readonly baseConfig: ButtonBaseConfig,
        public readonly stepPeriod: string,
        public readonly windowPeriod: string,
        public readonly delay: number,
        public readonly period: Period) {
    }

    static fromConfig(button: CardConfigButton, defaultColors: ButtonColors): PeriodShiftPlayButton {

        const baseConfig = ButtonBaseConfig.fromConfig(button, defaultColors);
        const period = Period.fromConfig(button);
        if (!period) {
            throw new Error("Period not set for period shift play button.");
        }
        let stepPeriod: string;
        if (PeriodCodeHelper.check('step_period', button.step_period)) {
            stepPeriod = button.step_period;
        } else {
            throw new Error('WindRoseCard: step_period not set');
        }
        let windowPeriod: string = '';
        if (PeriodCodeHelper.check('window_period', button.window_period)) {
            windowPeriod = button.window_period;
        } else {
            throw new Error('WindRoseCard: window_period not set');
        }
        const delay = ConfigCheckUtils.checkNumber("delay", button.delay);

        return new PeriodShiftPlayButton(baseConfig, stepPeriod, windowPeriod, delay, period);
    }

    getFirstPeriod(): Period {
        const endDate = PeriodCodeHelper.move(this.windowPeriod, this.period.startTime);
        return new Period('play', this.period.useStatistics, this.period.statisticsPeriod, undefined,
            undefined, undefined, undefined,
            undefined, this.period.startTime, endDate);
    }

}
