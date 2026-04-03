import {CardConfigCenterCircle} from "../card/CardConfigCenterCircle";
import {ConfigCheckUtils} from "./ConfigCheckUtils";

export class CenterCircleConfig {

    constructor(
        public readonly enabled: boolean,
        public readonly size: number,
        public readonly text: string | undefined,
        public readonly textSize: number) {
    }

    static fromConfig(config: CardConfigCenterCircle, centerCalmPercentage: boolean | undefined) {
        if (config) {
            const enabled = ConfigCheckUtils.checkBooleanDefaultTrue(config.enabled);
            const size = ConfigCheckUtils.checkNummerOrDefault(config.size, 60);
            const text = ConfigCheckUtils.checkStringOrDefault(config.text, "${calm-percentage}%");
            const textSize = ConfigCheckUtils.checkNummerOrDefault(config.text_size, 40);

            return new CenterCircleConfig(enabled, size, text, textSize);

        } else if (centerCalmPercentage === false) {
            return new CenterCircleConfig(false, 60, undefined, 40);

        }
        return new CenterCircleConfig(true, 60, "${calm-percentage}%", 40);
    }
}
