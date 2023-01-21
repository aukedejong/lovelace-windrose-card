import {WindRoseConfig} from "./WindRoseConfig";
import {WindBarConfig} from "./WindBarConfig";
import {GlobalConfig} from "./GlobalConfig";
import {CardConfigWrapper} from "./CardConfigWrapper";

export class WindRoseConfigFactory {

    roseCenterX = 0;
    roseCenterY = 0;
    outerRadius = 0;
    canvasHeight = 100;
    offsetWidth = 0;

    constructor(public cardConfig: CardConfigWrapper) {
    }

    createWindRoseConfig(canvasWidth: number): WindRoseConfig {

        this.calculateDimensions(canvasWidth);

        return new WindRoseConfig(
            this.outerRadius,
            25,
            this.roseCenterX,
            this.roseCenterY,
            this.cardConfig.windDirectionCount,
            (360 / this.cardConfig.windDirectionCount) - 5,
            this.cardConfig.cardinalDirectionLetters,
            this.cardConfig.directionCompensation);
    }

    createWindBarConfigs(canvasWidth: number): WindBarConfig[] {
        this.calculateDimensions(canvasWidth);

        const windBarConfigs: WindBarConfig[] = [];
        for (let i = 0; i < this.cardConfig.windspeedEntities.length; i++) {

            const entity = this.cardConfig.windspeedEntities[i];
            let windBarConfig: WindBarConfig;
            if (this.cardConfig.windspeedBarLocation === 'bottom') {

                windBarConfig = new WindBarConfig(
                    entity.name,
                    this.offsetWidth + 5,
                    this.roseCenterY + this.outerRadius + 30 + ((GlobalConfig.horizontalBarHeight + 20) * i),
                    GlobalConfig.horizontalBarHeight,
                    ((this.outerRadius + 30) * 2),
                    'horizontal');

            } else if (this.cardConfig.windspeedBarLocation === 'right') {

                windBarConfig = new WindBarConfig(
                    entity.name,
                    this.roseCenterX + this.outerRadius + 35 + ((GlobalConfig.horizontalBarHeight + 20) * i),
                    this.roseCenterY + this.outerRadius + 20,
                    GlobalConfig.verticalBarHeight,
                    this.outerRadius * 2 + 40,
                    'vertical');

            } else {
                throw Error('Unknown windspeed bar location: ' + this.cardConfig.windspeedBarLocation);
            }
            windBarConfigs.push(windBarConfig);
        }


        return windBarConfigs;
    }

    private calculateDimensions(canvasWidth: number): void {

        let roseWidth = canvasWidth;
        if (this.cardConfig.maxWidth && canvasWidth > this.cardConfig.maxWidth) {
            roseWidth = this.cardConfig.maxWidth;
            this.offsetWidth = (canvasWidth - roseWidth) / 2;
        }
        if (this.cardConfig.windspeedBarLocation == 'right') {
            roseWidth = roseWidth - ((16 + 12) * this.cardConfig.windBarCount());
            this.offsetWidth = (canvasWidth - roseWidth - ((16 + 12) * this.cardConfig.windBarCount())) / 2;
        }
        this.outerRadius = (roseWidth / 2) - 35;
        this.roseCenterX = this.offsetWidth + (roseWidth / 2);
        this.roseCenterY = this.outerRadius + 25

        if (this.cardConfig.windspeedBarLocation === 'right') {
            this.canvasHeight = this.roseCenterY + this.outerRadius + 25;
        } else if (this.cardConfig.windspeedBarLocation === 'bottom') {
            this.canvasHeight = this.roseCenterY + this.outerRadius + (30 * this.cardConfig.windBarCount()) + 35;
        } else {
            console.log('Unknown windspeed bar location', this.cardConfig.windspeedBarLocation);
        }
    }
}