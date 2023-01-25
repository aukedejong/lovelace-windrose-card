import {DrawUtil} from "./DrawUtil";
import {ColorUtil} from "./ColorUtil";
import {WindBarData} from "./WindBarData";
import {WindBarConfig} from "./WindBarConfig";
import {GlobalConfig} from "./GlobalConfig";

export class WindBarCanvas {

    readonly colorUtil = new ColorUtil(13);
    readonly config: WindBarConfig;

    constructor(config: WindBarConfig) {
        this.config = config;
    }

    drawWindBar(windBarData: WindBarData, canvasContext: CanvasRenderingContext2D) {

        // console.log('Data', windBarData);
        if (this.config.orientation === 'horizontal') {
            this.drawBarLegendHorizontal(windBarData.speedRangePercentages, canvasContext);

        } else if (this.config.orientation === 'vertical') {
            this.drawBarLegendVertical(windBarData.speedRangePercentages, canvasContext);
        }
    }

    private drawBarLegendHorizontal(speedRangePercentages: number[],
                                    canvasContext: CanvasRenderingContext2D) {

        canvasContext.font = '13px Arial';
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'middle';
        canvasContext.lineWidth = 1;
        canvasContext.fillStyle = GlobalConfig.getTextColor();
        canvasContext.fillText(this.config.label, this.config.posX, this.config.posY);
        let posX = this.config.posX;
        for (let i = 0; i <= speedRangePercentages.length; i++) {
            if (speedRangePercentages[i] > 0) {

                length = speedRangePercentages[i] * (this.config.length / 100);

                canvasContext.beginPath();
                canvasContext.strokeStyle = GlobalConfig.barBorderColor;
                canvasContext.fillStyle = this.colorUtil.colors[i];
                canvasContext.rect(posX, this.config.posY + 6, length, this.config.height);
                canvasContext.fill();

                canvasContext.fillStyle = 'black';
                canvasContext.fillText(`${i}`, posX + (length / 2) - 3, this.config.posY + (this.config.height / 2) + 7);
                canvasContext.stroke();
                posX += length;
            }
        }
    }

    private drawBarLegendVertical(speedRangePercentages: number[],
                                  canvasContext: CanvasRenderingContext2D) {

        canvasContext.font = '13px Arial';
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'bottom';
        //canvasContext.strokeStyle = this.config.borderColor;
        canvasContext.lineWidth = 1;
        canvasContext.fillStyle = GlobalConfig.getTextColor();

        canvasContext.save();
        canvasContext.translate(this.config.posX, this.config.posY);
        canvasContext.rotate(DrawUtil.toRadians(-90));

        canvasContext.fillText(this.config.label, 0, 0);
        canvasContext.restore();
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        let posY = this.config.posY;
        for (let i = 0; i <= speedRangePercentages.length; i++) {
            if (speedRangePercentages[i] > 0) {

                length = speedRangePercentages[i] * (this.config.length / 100) * -1;

                canvasContext.beginPath();
                canvasContext.strokeStyle = GlobalConfig.barBorderColor;
                canvasContext.fillStyle = this.colorUtil.colors[i];
                canvasContext.rect(this.config.posX, posY, this.config.height, length);
                canvasContext.fill();

                canvasContext.fillStyle = 'black'
                canvasContext.fillText(`${i}`, this.config.posX + (this.config.height / 2), posY + (length / 2));
                canvasContext.stroke();
                posY += length;
            }
        }
    }
}