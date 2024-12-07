import {CardConfigAction} from "./CardConfigAction";

export interface CardConfigActions {

    top_left: CardConfigAction | undefined;
    top_right: CardConfigAction | undefined;
    bottom_left: CardConfigAction | undefined;
    bottom_right: CardConfigAction | undefined;
    windrose: CardConfigAction | undefined;
    speed_bar_1: CardConfigAction | undefined;
    speed_bar_2: CardConfigAction | undefined;
}
