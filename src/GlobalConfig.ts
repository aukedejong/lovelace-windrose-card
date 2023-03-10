export class GlobalConfig {

    static leaveBorderColor = 'rgb(160, 160, 160)';
    static circlesColor = 'rgb(160, 160, 160)';
    static crossColor = this.circlesColor;

    static barBorderColor = this.circlesColor;

    static defaultCardinalDirectionLetters = "NESW";
    static defaultWindspeedBarLocation = 'bottom';
    static defaultHoursToShow = 4;
    static defaultRefreshInterval = 300;
    static defaultWindDirectionCount = 16;
    static defaultWindDirectionUnit = 'degrees';
    static defaultInputSpeedUnit = 'mps';
    static defaultOutputSpeedUnit = 'bft';
    static defaultWindspeedBarFull = true;
    static defaultMatchingStategy = 'direction-first';
    static defaultDirectionSpeedTimeDiff = 1;

    static verticalBarHeight = 30;
    static horizontalBarHeight = 15;

    static getTextColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color')
    }
}