import {CardConfigHaAction} from "./CardConfigHaAction";

export interface CardConfigAction {

    tap_action: CardConfigHaAction | undefined;
    hold_action: CardConfigHaAction | undefined;
    double_tap_action: CardConfigHaAction | undefined;

}
