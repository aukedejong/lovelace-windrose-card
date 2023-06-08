import {DrawUtil} from "../util/DrawUtil";
import {WindBarConfig} from "../config/WindBarConfig";
import {SpeedRange} from "../converter/SpeedRange";
import {WindRoseData} from "./WindRoseData";
import {WindBarDimensions} from "../dimensions/WindBarDimensions";
import {Log} from "../util/Log";
import {SpeedUnit} from "../converter/SpeedUnit";

export class WindBarRenderer {

    config: WindBarConfig;
    dimensions!: WindBarDimensions;
    readonly outputUnitName: string;
    readonly speedRanges: SpeedRange[];

    constructor(config: WindBarConfig, outputSpeedUnit: SpeedUnit) {
        Log.debug('WindBarRenderer init', config, outputSpeedUnit);
        this.config = config;
        if (config.outputUnitLabel) {
            this.outputUnitName = config.outputUnitLabel;
        } else if (config.speedRangeBeaufort) {
            this.outputUnitName = 'Beaufort';
        } else {
            this.outputUnitName = outputSpeedUnit.name;
        }
        this.speedRanges = outputSpeedUnit.speedRanges;
    }

    updateDimensions(dimensions: WindBarDimensions) {
        this.dimensions = dimensions;
        Log.debug('WindBarRenderer.updateDimensions()', this.dimensions);
    }

    drawWindBar(windBarData: WindRoseData, canvasContext: CanvasRenderingContext2D) {
        if (this.dimensions === undefined) {
            Log.error("drawWindBar(): Can't draw bar, dimensions not set.");
            return;
        }
        if (windBarData === undefined) {
            Log.error("drawWindBar(): Can't draw bar, windRoseData not set.");
            return;
        }
        Log.trace('drawWindBar(): ', windBarData, this.dimensions);

        if (this.config.orientation === 'horizontal') {
            this.drawBarLegendHorizontal(windBarData.speedRangePercentages, canvasContext);

        } else if (this.config.orientation === 'vertical') {
            this.drawBarLegendVertical(windBarData.speedRangePercentages, canvasContext);
        }
    }

    private drawBarLegendVertical(speedRangePercentages: number[],
                                  canvasContext: CanvasRenderingContext2D) {

        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.config.full) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }

        const lengthMaxRange = (this.dimensions.length / highestRangeMeasured)
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;
        canvasContext.font = '13px Arial';
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barNameColor;
        canvasContext.save();
        canvasContext.translate(this.dimensions.posX, this.dimensions.posY);
        canvasContext.rotate(DrawUtil.toRadians(-90));

        canvasContext.fillText(this.config.label, 0, 0);
        canvasContext.restore();
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        let posY = this.dimensions.posY;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (i === highestRangeMeasured - 1) {
                length = lengthMaxRange * -1;
            } else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.dimensions.length - lengthMaxRange) / maxScale) * -1;
            }

            canvasContext.beginPath();
            canvasContext.fillStyle = this.speedRanges[i].color;
            canvasContext.fillRect(this.dimensions.posX, posY, this.dimensions.height, length);
            canvasContext.fill();

            canvasContext.textAlign = 'left';
            canvasContext.fillStyle = this.config.barUnitValuesColor;

            if (this.config.speedRangeBeaufort === true) {
                if (i == 12) {
                    canvasContext.fillText(i+'', this.dimensions.posX + this.dimensions.height + 5, posY - 6);
                } else {
                    canvasContext.fillText(i+'', this.dimensions.posX + this.dimensions.height + 5, posY + (length / 2));
                }
            } else {
                canvasContext.fillText(this.speedRanges[i].minSpeed + '', this.dimensions.posX + this.dimensions.height + 5, posY);
            }

            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barPercentagesColor;
            if (speedRangePercentages[i] > 0) {
                canvasContext.fillText(`${Math.round(speedRangePercentages[i])}%`, this.dimensions.posX + (this.dimensions.height / 2), posY + (length / 2));
            }
            canvasContext.stroke();

            posY += length;
        }
        if (!this.config.speedRangeBeaufort && !this.config.full && highestRangeMeasured < speedRangePercentages.length) {
            canvasContext.textAlign = 'left';
            canvasContext.fillStyle = this.config.barUnitValuesColor;
            canvasContext.fillText(this.speedRanges[highestRangeMeasured].minSpeed + '', this.dimensions.posX + this.dimensions.height + 5, posY);
        }
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.barBorderColor;
        canvasContext.rect(this.dimensions.posX, this.dimensions.posY, this.dimensions.height, this.dimensions.length * -1);
        canvasContext.stroke();

        canvasContext.beginPath();
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barUnitNameColor;
        canvasContext.fillText(this.outputUnitName, this.dimensions.posX + (this.dimensions.height / 2), this.dimensions.posY - this.dimensions.length - 2);
        canvasContext.fill();
    }

    private drawBarLegendHorizontal(speedRangePercentages: number[],
                                  canvasContext: CanvasRenderingContext2D) {
        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.config.full) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }

        const lengthMaxRange = (this.dimensions.length / highestRangeMeasured)
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;

        canvasContext.font = '13px Arial';
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'bottom';
        canvasContext.lineWidth = 1;
        canvasContext.fillStyle = this.config.barNameColor;
        canvasContext.fillText(this.config.label, this.dimensions.posX, this.dimensions.posY);

        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'top';
        let posX = this.dimensions.posX;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (i === highestRangeMeasured - 1) {
                length = lengthMaxRange;
            } else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.dimensions.length - lengthMaxRange) / maxScale);
            }

            canvasContext.beginPath();
            canvasContext.fillStyle = this.speedRanges[i].color;
            canvasContext.fillRect(posX, this.dimensions.posY, length, this.dimensions.height);
            canvasContext.fill();

            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barUnitValuesColor;

            if (this.config.speedRangeBeaufort === true) {
                canvasContext.fillText(i+'', posX + (length / 2), this.dimensions.posY + this.dimensions.height + 2);
            } else {
                canvasContext.fillText(this.speedRanges[i].minSpeed + '', posX, this.dimensions.posY + this.dimensions.height + 2);
            }

            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barPercentagesColor;
            if (speedRangePercentages[i] > 0) {
                canvasContext.fillText(`${Math.round(speedRangePercentages[i])}%`, posX + (length / 2), this.dimensions.posY + 2);
            }
            canvasContext.stroke();

            posX += length;
        }
        if (!this.config.speedRangeBeaufort && !this.config.full && highestRangeMeasured < speedRangePercentages.length) {
            canvasContext.fillStyle = this.config.barUnitValuesColor;
            canvasContext.fillText(this.speedRanges[highestRangeMeasured].minSpeed + '', posX, this.dimensions.posY + this.dimensions.height + 2);
        }
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.barBorderColor;
        canvasContext.rect(this.dimensions.posX, this.dimensions.posY, this.dimensions.length, this.dimensions.height);
        canvasContext.stroke();

        canvasContext.beginPath();
        canvasContext.textAlign = 'right';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barUnitNameColor;
        canvasContext.fillText(this.outputUnitName, this.dimensions.posX + this.dimensions.length, this.dimensions.posY);
        canvasContext.fill();
    }


    private getIndexHighestRangeWithMeasurements(speedRangePercentages: number[]) {
        for (let i = speedRangePercentages.length - 1; i >= 0; i--) {
            if (speedRangePercentages[i] > 0) {
                return i + 1;
            }
        }
        return speedRangePercentages.length;
    }
}