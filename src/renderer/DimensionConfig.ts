export class DimensionConfig {

    readonly roseRadius = 500;
    readonly marginLeft = 80;
    readonly marginRight = 80;
    readonly marginTop = 80;
    readonly marginBottom = 120;
    readonly directionLetterMargin = 45;

    readonly barBottom = {
        barLength: (this.roseRadius * 2) + (this.marginLeft - 10) + (this.marginRight - 10),
        barHeight: 40,
        barMarginLeft: 10,
        barMarginBottom: 40,
        multiBarSpacing: 90
    }

    readonly barRight = {
        barWidth: 90,
        barHeight: this.roseRadius * 2,
        barMarginLeft: 40,
        barMarginRight: 80,
        multiBarSpacing: 100
    }

    constructor(readonly barCount: number, readonly barLocation: string) {}
}
