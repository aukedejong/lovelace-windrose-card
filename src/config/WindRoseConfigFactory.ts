import {WindRoseConfig} from "./WindRoseConfig";
import {WindBarConfig} from "./WindBarConfig";
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

    createWindBarConfigs(): WindBarConfig[] {
        const windBarConfigs: WindBarConfig[] = [];
        for (let i = 0; i < this.cardConfig.windspeedEntities.length; i++) {

            const entity = this.cardConfig.windspeedEntities[i];
            let windBarConfig: WindBarConfig;
            if (this.cardConfig.windspeedBarLocation === 'bottom') {

                windBarConfig = new WindBarConfig(
                    entity.name,
                    'horizontal',
                    entity.windspeedBarFull,
                    entity.renderRelativeScale,
                    entity.outputSpeedUnitLabel,
                    entity.speedRangeBeaufort,
                    this.cardConfig.cardColor.barBorder,
                    this.cardConfig.cardColor.barUnitName,
                    this.cardConfig.cardColor.barName,
                    this.cardConfig.cardColor.barUnitValues,
                    this.cardConfig.cardColor.barPercentages);

            } else if (this.cardConfig.windspeedBarLocation === 'right') {

                windBarConfig = new WindBarConfig(
                    entity.name,
                    'vertical',
                    entity.windspeedBarFull,
                    entity.renderRelativeScale,
                    entity.outputSpeedUnitLabel,
                    entity.speedRangeBeaufort,
                    this.cardConfig.cardColor.barBorder,
                    this.cardConfig.cardColor.barUnitName,
                    this.cardConfig.cardColor.barName,
                    this.cardConfig.cardColor.barUnitValues,
                    this.cardConfig.cardColor.barPercentages);

            } else {
                throw Error('Unknown windspeed bar location: ' + this.cardConfig.windspeedBarLocation);
            }
            windBarConfigs.push(windBarConfig);
        }
        return windBarConfigs;
    }
}
