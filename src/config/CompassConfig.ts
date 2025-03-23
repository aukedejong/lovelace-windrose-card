import {CardConfigCompass} from "../card/CardConfigCompass";
import {ConfigCheckUtils} from "./ConfigCheckUtils";

export class CompassConfig {

    constructor(
        public readonly autoRotate: boolean,
        public readonly entity: string | undefined,
        public readonly attribute: string | undefined,
        public readonly asHeading: boolean) {
    }

    static fromConfig(compassConfig: CardConfigCompass | undefined): CompassConfig {
        let entity = undefined;
        let autoRotate = false;
        let attribute = undefined;
        let asHeading = false;
        if (compassConfig) {
            autoRotate = ConfigCheckUtils.checkBooleanDefaultFalse(compassConfig.auto_rotate);
            if (autoRotate) {
                asHeading = ConfigCheckUtils.checkBooleanDefaultFalse(compassConfig.as_heading);
                if (compassConfig.entity) {
                    entity = compassConfig.entity;
                    attribute = compassConfig.attribute;
                } else {
                    throw new Error('WindRoseCard: compass direction auto rotate set to true, but no entity configured.');
                }
            }
        }
        return new CompassConfig(autoRotate, entity, attribute, asHeading);

    }
}
