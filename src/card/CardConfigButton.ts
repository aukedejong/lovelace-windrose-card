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
    hours: number;

    //PeriodShiftPlayButton
    step_hours: number;
    period_hours: number;
    delay: number;
}
