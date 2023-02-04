import {WindRoseConfig} from "./WindRoseConfig";
import {WindRoseData} from "./WindRoseData";
import {DrawUtil} from "./DrawUtil";
import {WindDirectionData} from "./WindDirectionData";
import {ColorUtil} from "./ColorUtil";
import {GlobalConfig} from "./GlobalConfig";
import {SpeedUnits} from "./WindSpeedConverter";

export class WindRoseCanvas {
    readonly colorUtil: ColorUtil;
    readonly config: WindRoseConfig;
    readonly rangeCount: number;
    windRoseData!: WindRoseData;

    constructor(config: WindRoseConfig) {
        this.config = config;
        this.rangeCount = SpeedUnits.getSpeedUnit(this.config.outputUnit).speedRanges.length;
        this.colorUtil = new ColorUtil(this.rangeCount);
    }

    drawWindRose(windRoseData: WindRoseData, canvasContext: CanvasRenderingContext2D) {
        // console.log('Drawing windrose', this.config.outerRadius);
        this.windRoseData = windRoseData;
        canvasContext.clearRect(0, 0, 700, 500);
        this.drawBackground(canvasContext);
        this.drawWindDirections(canvasContext);
        this.drawCircleLegend(canvasContext);
        this.drawCenterZeroSpeed(canvasContext);
    }

    private drawWindDirections(canvasContext: CanvasRenderingContext2D) {
        for (const windDirection of this.windRoseData.windDirections) {
            this.drawWindDirection(windDirection, canvasContext);
        }
    }

    private drawWindDirection(windDirection: WindDirectionData, canvasContext: CanvasRenderingContext2D) {
        if (windDirection.speedRangePercentages.length === 0) return;

        const percentages = Array(13).fill(0);
        for (let i = windDirection.speedRangePercentages.length - 1; i >= 0; i--) {
            percentages[i] = windDirection.speedRangePercentages[i];
            if (windDirection.speedRangePercentages[i] > 0) {
                for (let x = i - 1; x >= 1; x--) {
                    percentages[i] += windDirection.speedRangePercentages[x];
                }
            }
        }
        const maxRadius = (this.config.outerRadius - this.config.centerRadius) * (windDirection.directionPercentage / 100);

        for (let i = 12; i >= 1; i--) {
            this.drawSpeedPart(canvasContext,
                windDirection.centerDegrees - 90,
                (maxRadius * (percentages[i] / 100)) + this.config.centerRadius,
                this.colorUtil.colors[i]);
        }
    }

    private drawSpeedPart(canvasContext: CanvasRenderingContext2D, degrees: number, radius: number, color: string) {
        //var x = Math.cos(DrawUtil.toRadians(degreesCompensated - (this.config.leaveArc / 2)));
        //var y = Math.sin(DrawUtil.toRadians(degreesCompensated - (this.config.leaveArc / 2)));
        canvasContext.strokeStyle = GlobalConfig.leaveBorderColor;
        canvasContext.lineWidth = 2;
        canvasContext.beginPath();
        canvasContext.moveTo(this.config.centerX, this.config.centerY);
        //canvasContext.lineTo(this.config.centerX + x, this.config.centerY + y);
        canvasContext.arc(this.config.centerX, this.config.centerY, radius,
            DrawUtil.toRadians(degrees - (this.config.leaveArc / 2)),
            DrawUtil.toRadians(degrees + (this.config.leaveArc / 2)));
        canvasContext.lineTo(this.config.centerX, this.config.centerY);
        canvasContext.stroke();
        canvasContext.fillStyle = color;
        canvasContext.fill();
    }

    private drawBackground(canvasContext: CanvasRenderingContext2D): void {
        // Clear
        canvasContext.clearRect(0, 0, 5000, 5000);

        // Cross
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = GlobalConfig.crossColor;
        canvasContext.moveTo(this.config.centerX - this.config.outerRadius, this.config.centerY);
        canvasContext.lineTo(this.config.centerX + this.config.outerRadius, this.config.centerY);
        canvasContext.stroke();
        canvasContext.moveTo(this.config.centerX, this.config.centerY - this.config.outerRadius);
        canvasContext.lineTo(this.config.centerX, this.config.centerY + this.config.outerRadius);
        canvasContext.stroke();

        // console.log('Cirlce center:', this.config.centerX, this.config.centerY);
        // Cirlces
        canvasContext.strokeStyle = GlobalConfig.circlesColor;
        const radiusStep = (this.config.outerRadius - this.config.centerRadius) / this.windRoseData.numberOfCircles
        for (let i = 1; i <= this.windRoseData.numberOfCircles; i++) {
            canvasContext.beginPath();
            canvasContext.arc(this.config.centerX, this.config.centerY, this.config.centerRadius + (radiusStep * i), 0, 2 * Math.PI);
            canvasContext.stroke();
        }

        // Wind direction text
        const textCirlceSpace = 3;
        canvasContext.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color')
        canvasContext.font = '22px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillText(this.config.cardinalDirectionLetters[0], this.config.centerX, this.config.centerY - this.config.outerRadius - textCirlceSpace + 4);
        canvasContext.textBaseline = 'top';
        canvasContext.fillText(this.config.cardinalDirectionLetters[2], this.config.centerX, this.config.centerY + this.config.outerRadius + textCirlceSpace);
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'middle';
        canvasContext.fillText(this.config.cardinalDirectionLetters[1], this.config.centerX + this.config.outerRadius + textCirlceSpace, this.config.centerY);
        canvasContext.textAlign = 'right';
        canvasContext.textBaseline = 'middle';
        canvasContext.fillText(this.config.cardinalDirectionLetters[3], this.config.centerX - this.config.outerRadius - textCirlceSpace, this.config.centerY);
    }

    private drawCircleLegend(canvasContext: CanvasRenderingContext2D) {
        canvasContext.font = "10px Arial";
        canvasContext.fillStyle = GlobalConfig.getTextColor();
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'bottom';
        const radiusStep = (this.config.outerRadius - this.config.centerRadius) / this.windRoseData.numberOfCircles
        const centerXY = Math.cos(DrawUtil.toRadians(45)) * this.config.centerRadius;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;

        for (let i = 1; i <= this.windRoseData.numberOfCircles; i++) {
            const xPos = this.config.centerX + centerXY + (xy * i);
            const yPos = this.config.centerY + centerXY + (xy * i);
            canvasContext.fillText((this.windRoseData.percentagePerCircle * i) + "%", xPos, yPos);
        }
    }

    private drawCenterZeroSpeed(canvasContext: CanvasRenderingContext2D) {
        canvasContext.strokeStyle = GlobalConfig.circlesColor;
        canvasContext.lineWidth = 1;
        canvasContext.beginPath();
        canvasContext.arc(this.config.centerX, this.config.centerY, this.config.centerRadius, 0, 2 * Math.PI);
        canvasContext.stroke();
        canvasContext.fillStyle = this.colorUtil.colors[0];
        canvasContext.fill();
        canvasContext.font = '12px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        canvasContext.strokeStyle = 'white';
        canvasContext.fillStyle = 'white';
        canvasContext.fillText( Math.round(this.windRoseData.calmSpeedPercentage) + '%', this.config.centerX, this.config.centerY + 2);
    }
}