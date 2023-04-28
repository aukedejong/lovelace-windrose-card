import {WindRoseConfig} from "./WindRoseConfig";
import {WindRoseData} from "./WindRoseData";
import {DrawUtil} from "./DrawUtil";
import {WindDirectionData} from "./WindDirectionData";
import {SpeedRange, WindSpeedConverter} from "./WindSpeedConverter";

export class WindRoseCanvas {
    readonly config: WindRoseConfig;
    readonly windSpeedConverter: WindSpeedConverter;
    readonly speedRanges: SpeedRange[];
    readonly rangeCount: number;
    windRoseData!: WindRoseData;

    constructor(config: WindRoseConfig, windSpeedConverter: WindSpeedConverter) {
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.speedRanges = this.windSpeedConverter.getSpeedRanges();
        this.rangeCount = this.speedRanges.length;
    }

    drawWindRose(windRoseData: WindRoseData, canvasContext: CanvasRenderingContext2D) {
        // console.log('Drawing windrose', this.config.outerRadius);
        this.windRoseData = windRoseData;
        canvasContext.clearRect(0, 0, 700, 500);
        canvasContext.save();
        canvasContext.translate(this.config.centerX, this.config.centerY);
        canvasContext.rotate(DrawUtil.toRadians(this.config.windRoseDrawNorthOffset));
        this.drawBackground(canvasContext);
        this.drawWindDirections(canvasContext);
        this.drawCircleLegend(canvasContext);
        this.drawCenterZeroSpeed(canvasContext);
        canvasContext.restore();
    }

    private drawWindDirections(canvasContext: CanvasRenderingContext2D) {
        for (const windDirection of this.windRoseData.windDirections) {
            this.drawWindDirection(windDirection, canvasContext);
        }
    }

    private drawWindDirection(windDirection: WindDirectionData, canvasContext: CanvasRenderingContext2D) {
        if (windDirection.speedRangePercentages.length === 0) return;

        const percentages = Array(windDirection.speedRangePercentages.length).fill(0);
        for (let i = windDirection.speedRangePercentages.length - 1; i >= 0; i--) {
            percentages[i] = windDirection.speedRangePercentages[i];
            if (windDirection.speedRangePercentages[i] > 0) {
                for (let x = i - 1; x >= 1; x--) {
                    percentages[i] += windDirection.speedRangePercentages[x];
                }
            }
        }
        const maxRadius = (this.config.outerRadius - this.config.centerRadius) * (windDirection.directionPercentage / 100);
        for (let i = this.speedRanges.length - 1; i >= 1; i--) {
            this.drawSpeedPart(canvasContext,
                windDirection.centerDegrees - 90,
                (maxRadius * (percentages[i] / 100)) + this.config.centerRadius,
                this.speedRanges[i].color);
        }
    }

    private drawSpeedPart(canvasContext: CanvasRenderingContext2D, degrees: number, radius: number, color: string) {
        //var x = Math.cos(DrawUtil.toRadians(degreesCompensated - (this.config.leaveArc / 2)));
        //var y = Math.sin(DrawUtil.toRadians(degreesCompensated - (this.config.leaveArc / 2)));
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.lineWidth = 2;
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        //canvasContext.lineTo(this.config.centerX + x, this.config.centerY + y);
        canvasContext.arc(0, 0, radius,
            DrawUtil.toRadians(degrees - (this.config.leaveArc / 2)),
            DrawUtil.toRadians(degrees + (this.config.leaveArc / 2)));
        canvasContext.lineTo(0, 0);
        canvasContext.stroke();
        canvasContext.fillStyle = color;
        canvasContext.fill();
    }

    private drawBackground(canvasContext: CanvasRenderingContext2D): void {
        // Clear
        canvasContext.clearRect(0, 0, 5000, 5000);

        // Cross
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.moveTo(0 - this.config.outerRadius, 0);
        canvasContext.lineTo(this.config.outerRadius, 0);
        canvasContext.stroke();
        canvasContext.moveTo(0, 0 - this.config.outerRadius);
        canvasContext.lineTo(0, this.config.outerRadius);
        canvasContext.stroke();

        // console.log('Cirlce center:', this.config.centerX, this.config.centerY);
        // Cirlces
        canvasContext.strokeStyle = this.config.roseLinesColor;
        const radiusStep = (this.config.outerRadius - this.config.centerRadius) / this.windRoseData.numberOfCircles
        for (let i = 1; i <= this.windRoseData.numberOfCircles; i++) {
            canvasContext.beginPath();
            canvasContext.arc(0, 0, this.config.centerRadius + (radiusStep * i), 0, 2 * Math.PI);
            canvasContext.stroke();
        }

        // Wind direction text
        const textCirlceSpace = 15;
        canvasContext.fillStyle = this.config.roseDirectionLettersColor;
        canvasContext.font = '22px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[0], 0, 0 - this.config.outerRadius - textCirlceSpace + 2);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[2], 0, this.config.outerRadius + textCirlceSpace);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[1], this.config.outerRadius + textCirlceSpace, 0);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[3], 0 - this.config.outerRadius - textCirlceSpace, 0);
    }

    private drawCircleLegend(canvasContext: CanvasRenderingContext2D) {
        canvasContext.font = "10px Arial";
        canvasContext.fillStyle = this.config.rosePercentagesColor
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'bottom';
        const radiusStep = (this.config.outerRadius - this.config.centerRadius) / this.windRoseData.numberOfCircles
        const centerXY = Math.cos(DrawUtil.toRadians(45)) * this.config.centerRadius;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;

        for (let i = 1; i <= this.windRoseData.numberOfCircles; i++) {
            const xPos = centerXY + (xy * i);
            const yPos = centerXY + (xy * i);
            //canvasContext.fillText((this.windRoseData.percentagePerCircle * i) + "%", xPos, yPos);
            this.drawText(canvasContext, (this.windRoseData.percentagePerCircle * i) + "%", xPos, yPos);
        }
    }

    private drawCenterZeroSpeed(canvasContext: CanvasRenderingContext2D) {
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.lineWidth = 1;
        canvasContext.beginPath();
        canvasContext.arc(0, 0, this.config.centerRadius, 0, 2 * Math.PI);
        canvasContext.stroke();
        canvasContext.fillStyle = this.speedRanges[0].color;
        canvasContext.fill();
        canvasContext.font = '12px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        canvasContext.strokeStyle = this.config.rosePercentagesColor;
        canvasContext.fillStyle = this.config.rosePercentagesColor;
        this.drawText(canvasContext, Math.round(this.windRoseData.calmSpeedPercentage) + '%', 0, 0);
    }

    private drawText(canvasContext: CanvasRenderingContext2D, text: string, x: number, y: number) {
        canvasContext.save();
        canvasContext.translate(x, y);
        canvasContext.rotate(DrawUtil.toRadians(-this.config.windRoseDrawNorthOffset));
        canvasContext.fillText(text, 0, 0);
        canvasContext.restore();
    }
}