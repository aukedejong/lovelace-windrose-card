import {Button} from "../config/Button";

export interface CardConfigPeriodSelector {
    location: string;
    buttons: Button[] | undefined;
    active_color: string;
    active_bg_color: string;
    color: string;
    bg_color: string;
}
