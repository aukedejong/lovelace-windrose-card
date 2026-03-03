import {CardConfigButtonColors} from "./CardConfigButtonColors";
import {CardConfigDataPeriod} from "./CardConfigDataPeriod";

export interface CardConfigButton extends CardConfigDataPeriod {

    type: string;
    button_text: string;
    colors: CardConfigButtonColors;
    active: boolean;

    //WindRoseSpeedSelectButton
    windspeed_entity_index: number;

    //PeriodShiftButton
    shift_period: string;

    //PeriodShiftPlayButton
    step_period: string;
    window_period: string;
    delay: number;
}
