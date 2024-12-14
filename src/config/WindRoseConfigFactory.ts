import {WindRoseConfig} from "./WindRoseConfig";
import {CardConfigWrapper} from "./CardConfigWrapper";

export class WindRoseConfigFactory {

    constructor(public cardConfig: CardConfigWrapper) {
    }

    createWindRoseConfig(): WindRoseConfig {
        return new WindRoseConfig(
            60,
            this.cardConfig.windDirectionCount,
            this.cardConfig.windDirectionEntity.directionLetters,
            (360 / this.cardConfig.windDirectionCount) - 8,
            this.cardConfig.cardinalDirectionLetters,
            this.cardConfig.windDirectionEntity.directionCompensation,
            this.cardConfig.windRoseDrawNorthOffset,
            this.cardConfig.centerCalmPercentage,
            this.cardConfig.currentDirection.arrowSize,
            this.cardConfig.currentDirection.centerCircleSize,
            this.cardConfig.cornersInfo,
            this.cardConfig.cardColor.roseLines,
            this.cardConfig.cardColor.roseDirectionLetters,
            this.cardConfig.cardColor.roseCenterPercentage,
            this.cardConfig.cardColor.rosePercentages,
            this.cardConfig.cardColor.roseCurrentDirectionArrow,
            this.cardConfig.backgroundImage);
    }
}
