import { ConfigCheckUtils } from "./ConfigCheckUtils";
import { CardConfigCurrentDirection } from "../card/CardConfigCurrentDirection";
import { GlobalConfig } from "./GlobalConfig";
import { RoseConfig } from "./RoseConfig";

export class CurrentDirectionConfig {

    constructor(
        public readonly showArrow: boolean,
        public readonly arrowDirection: string,
        public readonly arrowLocation: string,
        public readonly arrowSize: number | undefined,
        public readonly centerCircleSize: number | undefined,
        public readonly hideDirectionBelowSpeed: number | undefined) {
    }

    static fromConfig(currentDirection: CardConfigCurrentDirection | undefined, roseConfig: RoseConfig): CurrentDirectionConfig {
        if (currentDirection) {
            let centerCircleSize;
            if (roseConfig.centerCircleConfig.enabled) {
                centerCircleSize = roseConfig.centerCircleConfig.size;
            } else {
                centerCircleSize = ConfigCheckUtils.checkNummerOrDefault(currentDirection.center_circle_size, GlobalConfig.defaultCurrentDirectionCircleSize);
            }
            const arrowDirection = CurrentDirectionConfig.checkArrowDirection(currentDirection.arrow_direction);
            const arrowDLocation = CurrentDirectionConfig.checkArrowLocation(currentDirection.arrow_location);
            return new CurrentDirectionConfig(
                ConfigCheckUtils.checkBooleanDefaultFalse(currentDirection.show_arrow),
                arrowDirection,
                arrowDLocation,
                ConfigCheckUtils.checkNummerOrDefault(currentDirection.arrow_size, GlobalConfig.defaultCurrentDirectionArrowSize),
                centerCircleSize,
                ConfigCheckUtils.checkNumberOrUndefined('hide_direction_below_speed', currentDirection.hide_direction_below_speed)
            )
        }
        return new CurrentDirectionConfig(false, "in", "from",undefined, undefined, 0);
    }

    static checkArrowDirection(arrowDirection: string | undefined): string {
        if (arrowDirection === undefined) {
            return "in"
        } else if (arrowDirection === "in" || arrowDirection === "out") {
            return arrowDirection
        }
        throw new Error(`WindRoseCard: arrow_direction ${arrowDirection} is invalid, should be in or out`);
    }

    static checkArrowLocation(arrowLocation: string | undefined): string {
        if (arrowLocation === undefined) {
            return "from"
        } else if (arrowLocation === "from" || arrowLocation === "to") {
            return arrowLocation
        }
        throw new Error(`WindRoseCard: arrow_location ${arrowLocation} is invalid, should be from or to`);
    }
}
