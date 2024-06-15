import {Log} from "../util/Log";
import {WindRoseDimensions} from "./WindRoseDimensions";
import {WindBarDimensions} from "./WindBarDimensions";
import {GlobalConfig} from "../config/GlobalConfig";

export class DimensionsCalculator {

    public calculateWindRoseDimensions(canvasWidth: number,
                                maxWidth: number | undefined,
                                windBarCount: number,
                                windspeedBarLocation: string,
                                showWindText: boolean): WindRoseDimensions {

        let offsetWidth = 0;
        let roseWidth = canvasWidth;
        if (maxWidth && canvasWidth > maxWidth) {
            roseWidth = maxWidth;
            offsetWidth = (canvasWidth - roseWidth) / 2;
        }
        if (windspeedBarLocation == 'right') {
            roseWidth = roseWidth - ((60 + 12) * windBarCount);
            offsetWidth = (canvasWidth - roseWidth - ((60 + 12) * windBarCount)) / 2;
        }
        let outerRadius = (roseWidth / 2) - (showWindText ? 35 : 5);
        let roseCenterX = offsetWidth + (roseWidth / 2);
        let roseCenterY = outerRadius + 25
        let canvasHeight = 0;

        if (windspeedBarLocation === 'right') {
            canvasHeight = roseCenterY + outerRadius + 25;
        } else if (windspeedBarLocation === 'bottom') {
            canvasHeight = roseCenterY + outerRadius + (40 * windBarCount) + 35;
        } else {
            Log.error('Unknown windspeed bar location', windspeedBarLocation);
        }
        return new WindRoseDimensions(roseCenterX, roseCenterY, offsetWidth, outerRadius, canvasHeight);
    }

    public calculatorWindBarDimensions(dimensions: WindRoseDimensions, barLocation: string, index: number, showWindText: boolean) {
        if (barLocation === 'bottom') {
            return new WindBarDimensions(
                dimensions.offsetWidth + 5,
                dimensions.centerY + dimensions.outerRadius + (showWindText ? 30 : 5) + ((GlobalConfig.horizontalBarHeight + 40) * index),
                GlobalConfig.horizontalBarHeight,
                ((dimensions.outerRadius + (showWindText ? 30: 0)) * 2)
            )
        }
        if (barLocation === 'right') {
            return new WindBarDimensions(
                dimensions.centerX + dimensions.outerRadius + (showWindText ? 35 : 5) + ((GlobalConfig.verticalBarHeight + 60) * index),
                dimensions.centerY + dimensions.outerRadius + 20,
                GlobalConfig.verticalBarHeight,
                dimensions.outerRadius * 2 + 24
            )
        }
        throw Error('Unknown windspeed bar location: ' + barLocation);
    }

}