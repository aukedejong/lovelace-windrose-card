import {WindRoseConfig} from "../config/WindRoseConfig";
import {DrawUtil} from "../util/DrawUtil";
import {SpeedRange} from "../converter/SpeedRange";
import {WindRoseData} from "./WindRoseData";
import {WindRoseDimensions} from "../dimensions/WindRoseDimensions";
import {Log} from "../util/Log";

export class WindRoseRendererCenterCalm {
    private config: WindRoseConfig;
    private dimensions!: WindRoseDimensions;
    private readonly speedRanges: SpeedRange[];
    private readonly rangeCount: number;
    windRoseData!: WindRoseData;

    constructor(config: WindRoseConfig, speedRanges: SpeedRange[]) {
        this.config = config;
        this.speedRanges = speedRanges;
        this.rangeCount = this.speedRanges.length;
    }

    updateDimensions(dimensions: WindRoseDimensions): void {
        this.dimensions = dimensions;
    }

    drawWindRose(windRoseData: WindRoseData, canvasContext: CanvasRenderingContext2D): void {
        if (this.dimensions === undefined) {
            Log.error("drawWindRose(): Can't draw, dimensions not set");
            return;
        }
        if (windRoseData === undefined) {
            Log.error("drawWindRose(): Can't draw, no windrose data.");
            return;
        }
        Log.trace('drawWindRose()', windRoseData);
        this.windRoseData = windRoseData;
        canvasContext.clearRect(0, 0, 7000, 5000);
        canvasContext.save();
        canvasContext.translate(this.dimensions.centerX, this.dimensions.centerY);
        canvasContext.rotate(DrawUtil.toRadians(this.config.windRoseDrawNorthOffset));
        this.drawBackground(canvasContext);
        this.drawWindDirections(canvasContext);
        this.drawCircleLegend(canvasContext);
        this.drawCenterZeroSpeed(canvasContext);
        canvasContext.restore();
    }

    private drawWindDirections(canvasContext: CanvasRenderingContext2D) {
        for (let i = 0; i < this.windRoseData.directionPercentages.length; i++) {
            this.drawWindDirection(this.windRoseData.directionSpeedRangePercentages[i],
                this.windRoseData.directionPercentages[i],
                this.windRoseData.directionDegrees[i], canvasContext);
        }
    }

    private drawWindDirection(speedRangePercentages: number[], directionPercentage: number, degrees: number,
                              canvasContext: CanvasRenderingContext2D) {
        if (directionPercentage === 0) return;

        const percentages = Array(speedRangePercentages.length).fill(0);
        for (let i = speedRangePercentages.length - 1; i >= 0; i--) {
            percentages[i] = speedRangePercentages[i];
            if (speedRangePercentages[i] > 0) {
                for (let x = i - 1; x >= 0; x--) {
                    percentages[i] += speedRangePercentages[x];
                }
            }
        }
        const maxDirectionRadius = (directionPercentage * (this.dimensions.outerRadius - this.config.centerRadius)) / this.windRoseData.maxCirclePercentage;
        for (let i = this.speedRanges.length - 1; i >= 0; i--) {
            this.drawSpeedPart(canvasContext,
                degrees - 90,
                (maxDirectionRadius * (percentages[i] / 100)) + this.config.centerRadius,
                this.speedRanges[i].color);
        }
    }

    private drawSpeedPart(canvasContext: CanvasRenderingContext2D, degrees: number, radius: number, color: string) {
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.lineWidth = 2;
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
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
        canvasContext.moveTo(0 - this.dimensions.outerRadius, 0);
        canvasContext.lineTo(this.dimensions.outerRadius, 0);
        canvasContext.stroke();
        canvasContext.moveTo(0, 0 - this.dimensions.outerRadius);
        canvasContext.lineTo(0, this.dimensions.outerRadius);
        canvasContext.stroke();

        // Cirlces
        const circleCount = this.windRoseData.circleCount;
        canvasContext.strokeStyle = this.config.roseLinesColor;
        const radiusStep = (this.dimensions.outerRadius - this.config.centerRadius) / circleCount;
        let circleRadius = this.config.centerRadius + radiusStep;
        for (let i = 1; i <= circleCount; i++) {
            canvasContext.beginPath();
            canvasContext.arc(0, 0, circleRadius, 0, 2 * Math.PI);
            canvasContext.stroke();
            circleRadius += radiusStep;
        }

        // Wind direction text
        if (this.config.showWindText) {
            const textCirlceSpace = 15;
            canvasContext.fillStyle = this.config.roseDirectionLettersColor;
            canvasContext.font = '22px Arial';
            canvasContext.textAlign = 'center';
            canvasContext.textBaseline = 'middle';
            this.drawText(canvasContext, this.config.cardinalDirectionLetters[0], 0, 0 - this.dimensions.outerRadius - textCirlceSpace + 2);
            this.drawText(canvasContext, this.config.cardinalDirectionLetters[2], 0, this.dimensions.outerRadius + textCirlceSpace);
            this.drawText(canvasContext, this.config.cardinalDirectionLetters[1], this.dimensions.outerRadius + textCirlceSpace, 0);
            this.drawText(canvasContext, this.config.cardinalDirectionLetters[3], 0 - this.dimensions.outerRadius - textCirlceSpace, 0);
        }
    }

    private drawCircleLegend(canvasContext: CanvasRenderingContext2D) {
        canvasContext.font = "10px Arial";
        canvasContext.fillStyle = this.config.rosePercentagesColor
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        const radiusStep = (this.dimensions.outerRadius - this.config.centerRadius) / this.windRoseData.circleCount;
        const centerXY = Math.cos(DrawUtil.toRadians(45)) * this.config.centerRadius;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;
        let lastYPos = centerXY + (xy * this.windRoseData.circleCount) + 12;

        for (let i = this.windRoseData.circleCount; i >= 1; i--) {
            const xPos = centerXY + (xy * i);
            const yPos = centerXY + (xy * i);
            const yDiff = lastYPos - yPos;
            if (yDiff > 10) {
                lastYPos = yPos;
                this.drawText(canvasContext, (this.windRoseData.percentagePerCircle * i) + "%", xPos, yPos);
            }
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
        this.drawText(canvasContext, Math.round(this.windRoseData.speedRangePercentages[0]) + '%', 0, 0);
    }

    private drawText(canvasContext: CanvasRenderingContext2D, text: string, x: number, y: number) {
        canvasContext.save();
        canvasContext.translate(x, y);
        canvasContext.rotate(DrawUtil.toRadians(-this.config.windRoseDrawNorthOffset));
        canvasContext.fillText(text, 0, 0);
        canvasContext.restore();
    }
}