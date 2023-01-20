export class WindRoseConfigxx {
    title = 'Windrose';
    hoursToShow = 4;
    circlesColor = 'rgb(160, 160, 160)';
    crossColor = this.circlesColor;
    leaveBorderColor = this.circlesColor
    //legendBorderColor = 'rgb(60, 60, 60)';
    showGustSpeed = false;

    canvasWidth = 0; //calc
    maxCanvasWidth = 0; //calc
    outerRadius = 0; //calc
    centerX = 0; //calc
    centerY = 0; //calc
    centerRadius = 25; //fixed
    leaveCount = 16; //fixed
    leaveArc = (360 / this.leaveCount) - 5;
    //speedPartColor = ['darkgreen' , 'green', 'yellow', 'orange',  'darkorange', 'red'];
    directionCompensation = 0;
    northText = 'N';
    eastText = 'E';
    southText = 'S';
    westText = 'W';
    legendPosition = 'bottom'; //left, right, bottom, auto
    legendTopX = 0;//calc
    legendTopY = 0;//calc
    legendBarLength = 0;//calc
    legendBarHeight = 0;//calc

    windDirectionEntity: string | undefined;
    averageWindspeedEntity: string | undefined;
    gustWindspeedEntity: string | undefined;


    constructor() {
        this.setCanvasWidth(600);
    }

    setCanvasWidth(canvasWidth: number): void {
        let roseWidth = canvasWidth;
        if (this.maxCanvasWidth > 0 && canvasWidth > this.maxCanvasWidth) {
            roseWidth = this.maxCanvasWidth;
        }
        if (this.legendPosition == 'right') {
            roseWidth = roseWidth - 25 - 20 - 25 - 5;
        }

        this.canvasWidth = canvasWidth;
        this.outerRadius = (roseWidth / 2) - 35;
        this.centerX = roseWidth / 2;
        this.centerY = this.outerRadius + 25;

        if (this.legendPosition === 'bottom') {
            this.legendBarHeight = 15;
            this.legendBarLength = canvasWidth - 10;
            this.legendTopX = 5;
            this.legendTopY = this.centerY + this.outerRadius + 50;
        } else if (this.legendPosition === 'right') {
            this.legendBarHeight = 16;
            this.legendBarLength = this.outerRadius * 2 + 30;
            this.legendTopX = this.centerX + this.outerRadius + 40;
            this.legendTopY = this.centerY + this.outerRadius + 20;
        }
    }

    calculateCanvasHeight(): number {
        if (this.legendPosition === 'bottom') {
            return this.legendTopY + this.legendBarHeight + 20 + this.legendBarHeight + 10;
        } else if (this.legendPosition === 'right') {
            return this.legendTopY + 20;
        }
        console.log('Unknown legend position', this.legendPosition);
        return 100;
    }

    getFilterEntitiesQueryParameter() {
        if (this.showGustSpeed) {
            return this.windDirectionEntity + ',' + this.averageWindspeedEntity + ',' + this.gustWindspeedEntity;
        }
        return this.windDirectionEntity + ',' + this.averageWindspeedEntity;
    }

}