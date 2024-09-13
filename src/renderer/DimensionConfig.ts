export class DimensionConfig {

    readonly roseRadius = 500;
    readonly marginLeft = 80;
    readonly marginRight = 80;
    readonly marginTop = 80;
    readonly marginBottom = 100;
    readonly directionLetterMargin = 20;

    readonly barBottom = {
        barLength: this.roseRadius * 2,
        barHeight: 40,
        barMarginLeft: this.marginLeft,
        barMarginBottom: 40,
        multiBarSpacing: 90
    }

    readonly barRight = {
        barWidth: 90,
        barHeight: this.roseRadius * 2,
        barMarginLeft: 20,
        barMarginRight: 80,
        multiBarSpacing: 100
    }

    constructor(readonly barCount: number, readonly barLocation: string) {}
}
