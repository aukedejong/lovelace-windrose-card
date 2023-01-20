export class GlobalConfig {

    static leaveBorderColor = 'rgb(160, 160, 160)';
    static circlesColor = 'rgb(160, 160, 160)';
    static crossColor = this.circlesColor;

    static leaveCount = 16;
    static barBorderColor: string;
    static defaultCardinalDirectionLetters = "NESW";
    static defaultWindspeedBarLocation = 'bottom';
    static defaultHoursToShow = 4;
    static defaultRefreshInterval = 300;


    static canvasBorderLeft = 10;
    static canvasBorderRight = 10;
    static canvasBorderTop = 10;
    static canvasBorderBottom = 10;
    static verticalBarHeight = 16;
    static horizontalBarHeight = 15;

    static getTextColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color')
    }
}