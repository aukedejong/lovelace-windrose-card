import {CardConfigButton} from "./CardConfigButton";
import {CardConfigButtonColors} from "./CardConfigButtonColors";

export interface CardConfigButtonsConfig {

    location: string | undefined;
    buttons: CardConfigButton[];
    default_colors: CardConfigButtonColors;
}
