import {SvgUtil} from "./SvgUtil";

export class DimensionConfig {

    readonly roseRadius = 500;
    readonly marginLeft: number;
    readonly marginRight: number;
    readonly marginTop: number;
    readonly marginBottom: number;
    readonly directionLetterMargin = 45;

    readonly barBottom = {
        barLength: 0,
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

    constructor(readonly barCount: number,
                readonly barLocation: string,
                readonly cardinalDirectionLetters: string[],
                readonly svg: Snap.Paper) {

        const svgUtil = new SvgUtil(svg);

        const northLength = this.directionLetterMargin + svgUtil.getTextLength(cardinalDirectionLetters[0], 50);
        const eastLength = this.directionLetterMargin + svgUtil.getTextLength(cardinalDirectionLetters[1], 50);
        const southLength = this.directionLetterMargin + svgUtil.getTextLength(cardinalDirectionLetters[2], 50);
        const westLength = this.directionLetterMargin + svgUtil.getTextLength(cardinalDirectionLetters[3], 50);
        const maxLength = [northLength, eastLength, southLength, westLength].reduce((prev, current) => (prev > current) ? prev : current);

        this.marginTop = maxLength;
        this.marginRight = maxLength;
        this.marginLeft = maxLength;
        this.marginBottom = maxLength;

        this.barBottom.barLength = (this.roseRadius * 2) + (this.marginLeft - 10) + (this.marginRight - 10);
    }
}
