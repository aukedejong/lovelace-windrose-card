import {DirectionSpeed} from "../matcher/DirectionSpeed";
import {HomeAssistant} from "custom-card-helpers";
import {CardConfigWrapper} from "../config/CardConfigWrapper";

export interface MeasurementProvider {

    getMeasurements(): Promise<DirectionSpeed[][]>;

    setHass(hass: HomeAssistant): void;

    setCardConfig(cardConfig: CardConfigWrapper): void;
}

