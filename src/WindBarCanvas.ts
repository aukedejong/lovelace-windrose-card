import {DrawUtil} from "./DrawUtil";
import {WindBarData} from "./WindBarData";
import {WindBarConfig} from "./WindBarConfig";
import {SpeedRange, WindSpeedConverter} from "./WindSpeedConverter";

export class WindBarCanvas {

    readonly config: WindBarConfig;
    readonly windSpeedConverter: WindSpeedConverter;
    readonly outputUnitName: string;
    readonly speedRanges: SpeedRange[];

    constructor(config: WindBarConfig, windSpeedConverter: WindSpeedConverter) {
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.outputUnitName = this.windSpeedConverter.getOutputSpeedUnit().name;
        this.speedRanges = this.windSpeedConverter.getOutputSpeedUnit().speedRanges;
    }

    drawWindBar(windBarData: WindBarData, canvasContext: CanvasRenderingContext2D) {

        // console.log('Data', windBarData);
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

        const lengthMaxRange = (this.config.length / highestRangeMeasured)
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;
        canvasContext.font = '13px Arial';
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barNameColor;
        canvasContext.save();
        canvasContext.translate(this.config.posX, this.config.posY);
        canvasContext.rotate(DrawUtil.toRadians(-90));

        canvasContext.fillText(this.config.label, 0, 0);
        canvasContext.restore();
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        let posY = this.config.posY;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (i === highestRangeMeasured - 1) {
                length = lengthMaxRange * -1;
            } else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.config.length - lengthMaxRange) / maxScale) * -1;
            }

            canvasContext.beginPath();
            canvasContext.fillStyle = this.speedRanges[i].color;
            canvasContext.fillRect(this.config.posX, posY, this.config.height, length);
            canvasContext.fill();

            canvasContext.textAlign = 'left';
            canvasContext.fillStyle = this.config.barUnitValuesColor;

            if (this.config.outputUnit === 'bft') {
                if (i == 12) {
                    canvasContext.fillText(i+'', this.config.posX + this.config.height + 5, posY - 6);
                } else {
                    canvasContext.fillText(i+'', this.config.posX + this.config.height + 5, posY + (length / 2));
                }
            } else {
                canvasContext.fillText(this.speedRanges[i].minSpeed + '', this.config.posX + this.config.height + 5, posY);
            }

            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barPercentagesColor;
            if (speedRangePercentages[i] > 0) {
                canvasContext.fillText(`${Math.round(speedRangePercentages[i])}%`, this.config.posX + (this.config.height / 2), posY + (length / 2));
            }
            canvasContext.stroke();

            posY += length;
        }
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.barBorderColor;
        canvasContext.rect(this.config.posX, this.config.posY, this.config.height, this.config.length * -1);
        canvasContext.stroke();

        canvasContext.beginPath();
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barUnitNameColor;
        canvasContext.fillText(this.outputUnitName, this.config.posX + (this.config.height / 2), this.config.posY - this.config.length - 2);
        canvasContext.fill();
    }

    private drawBarLegendHorizontal(speedRangePercentages: number[],
                                  canvasContext: CanvasRenderingContext2D) {
        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.config.full) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }

        const lengthMaxRange = (this.config.length / highestRangeMeasured)
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;

        canvasContext.font = '13px Arial';
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'bottom';
        canvasContext.lineWidth = 1;
        canvasContext.fillStyle = this.config.barNameColor;
        canvasContext.fillText(this.config.label, this.config.posX, this.config.posY);

        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'top';
        let posX = this.config.posX;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (i === highestRangeMeasured - 1) {
                length = lengthMaxRange;
            } else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.config.length - lengthMaxRange) / maxScale);
            }

            canvasContext.beginPath();
            canvasContext.fillStyle = this.speedRanges[i].color;
            canvasContext.fillRect(posX, this.config.posY, length, this.config.height);
            canvasContext.fill();

            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barUnitValuesColor;

            if (this.config.outputUnit === 'bft') {
                canvasContext.fillText(i+'', posX + (length / 2), this.config.posY + this.config.height + 2);
            } else {
                canvasContext.fillText(this.speedRanges[i].minSpeed + '', posX, this.config.posY + this.config.height + 2);
            }

            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barPercentagesColor;
            if (speedRangePercentages[i] > 0) {
                canvasContext.fillText(`${Math.round(speedRangePercentages[i])}%`, posX + (length / 2), this.config.posY + 2);
            }
            canvasContext.stroke();

            posX += length;
        }
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.barBorderColor;
        canvasContext.rect(this.config.posX, this.config.posY, this.config.length, this.config.height);
        canvasContext.stroke();

        canvasContext.beginPath();
        canvasContext.textAlign = 'right';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barUnitNameColor;
        canvasContext.fillText(this.outputUnitName, this.config.posX + this.config.length, this.config.posY);
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