import {CardConfigDirectionLabels} from "../card/CardConfigDirectionLabels";
import {CardConfigCustomDirectionLabels} from "../card/CardConfigCustomDirectionLabels";
import {GlobalConfig} from "./GlobalConfig";
import {ConfigCheckUtils} from "./ConfigCheckUtils";
import {SvgUtil} from "../renderer/SvgUtil";

export class DirectionLabels {

    constructor(
        public showCardinalDirections: boolean,
        public showIntercardinalDirections: boolean,
        public showSecondaryIntercardinalDirections: boolean,
        public cardinalLabelSize: number,
        public intercardinalLabelSize: number,
        public secondaryIntercardinalLabelSize: number,
        public customLabels: CardConfigCustomDirectionLabels) {}

    public getMaxLabelLength(svgUtil: SvgUtil): number {
        let maxLengthCardianl = 0;
        let maxLengthIntercardinal = 0;
        let maxLengthSubIntercardinal = 0;

        if (this.showCardinalDirections) {
            const northLength = svgUtil.getTextLength(this.customLabels.n!, this.cardinalLabelSize);
            const eastLength = svgUtil.getTextLength(this.customLabels.e!, this.cardinalLabelSize);
            const southLength = svgUtil.getTextLength(this.customLabels.s!, this.cardinalLabelSize);
            const westLength = svgUtil.getTextLength(this.customLabels.w!, this.cardinalLabelSize);
            maxLengthCardianl = this.getMax([northLength, eastLength, southLength, westLength]);
        }
        if (this.showIntercardinalDirections) {
            const neLength = svgUtil.getTextLength(this.customLabels.ne!, this.intercardinalLabelSize);
            const seLength = svgUtil.getTextLength(this.customLabels.se!, this.intercardinalLabelSize);
            const swLength = svgUtil.getTextLength(this.customLabels.sw!, this.intercardinalLabelSize);
            const nwLength = svgUtil.getTextLength(this.customLabels.nw!, this.intercardinalLabelSize);
            maxLengthIntercardinal = this.getMax([neLength, seLength, swLength, nwLength]);
        }
        if (this.showSecondaryIntercardinalDirections) {
            const nneLength = svgUtil.getTextLength(this.customLabels.nne!, this.secondaryIntercardinalLabelSize);
            const eneLength = svgUtil.getTextLength(this.customLabels.ene!, this.secondaryIntercardinalLabelSize);
            const eseLength = svgUtil.getTextLength(this.customLabels.ese!, this.secondaryIntercardinalLabelSize);
            const sseLength = svgUtil.getTextLength(this.customLabels.sse!, this.secondaryIntercardinalLabelSize);
            const sswLength = svgUtil.getTextLength(this.customLabels.ssw!, this.secondaryIntercardinalLabelSize);
            const wswLength = svgUtil.getTextLength(this.customLabels.wsw!, this.secondaryIntercardinalLabelSize);
            const wnwLength = svgUtil.getTextLength(this.customLabels.wnw!, this.secondaryIntercardinalLabelSize);
            const nnwLength = svgUtil.getTextLength(this.customLabels.nnw!, this.secondaryIntercardinalLabelSize);
            maxLengthSubIntercardinal = this.getMax([nneLength, eneLength, eseLength, sseLength, sswLength, wswLength,
                wnwLength, nnwLength]);
        }
        
        return this.getMax([maxLengthCardianl, maxLengthIntercardinal, maxLengthSubIntercardinal]);
    }
    
    private getMax(values: number[]): number {
        return values.reduce((prev, current) => (prev > current) ? prev : current);
    }

    static fromConfig(config: CardConfigDirectionLabels): DirectionLabels {

        const showCardinalDirections = ConfigCheckUtils.checkBooleanDefaultTrue(config?.show_cardinal_directions);
        const showIntercardinalDirections = ConfigCheckUtils.checkBooleanDefaultFalse(config?.show_intercardinal_directions);
        const showSubIntercardinalDirections = ConfigCheckUtils.checkBooleanDefaultFalse(config?.show_secondary_intercardinal_directions);

        const cardinalLabelSize = ConfigCheckUtils.checkNummerOrDefault(config?.cardinal_directions_text_size, GlobalConfig.defaultCardinalDirectionLabelSize);
        const interCardinalLabelSize = ConfigCheckUtils.checkNummerOrDefault(config?.intercardinal_directions_text_size, GlobalConfig.defaultIntercardinalDirectionLabelSize);
        const subInterCardinalLabelSize = ConfigCheckUtils.checkNummerOrDefault(config?.secondary_intercardinal_directions_text_size, GlobalConfig.defaultSubIntercardinalDirectionLabelSize)

        const letters = this.checkCardinalDirectionLetters(config?.cardinal_direction_letters);
        const customLabels = { ...config?.custom_labels } as CardConfigCustomDirectionLabels;
        if (showCardinalDirections) {
            if (!customLabels.n) {
                customLabels.n = letters[0];
            }
            if (!customLabels.e) {
                customLabels.e = letters[1];
            }
            if (!customLabels.s) {
                customLabels.s = letters[2];
            }
            if (!customLabels.w) {
                customLabels.w = letters[3];
            }
        }
        if (showIntercardinalDirections) {
            if (!customLabels.ne) {
                customLabels.ne = letters[0] + letters[1];
            }
            if (!customLabels.se) {
                customLabels.se = letters[2] + letters[1];
            }
            if (!customLabels.sw) {
                customLabels.sw = letters[2] + letters[3];
            }
            if (!customLabels.nw) {
                customLabels.nw = letters[0] + letters[3];
            }
        }
        if (showSubIntercardinalDirections) {
            if (!customLabels.nne) {
                customLabels.nne = letters[0] + letters[0] + letters[1];
            }
            if (!customLabels.ene) {
                customLabels.ene = letters[1] + letters[0] + letters[1];
            }
            if (!customLabels.ese) {
                customLabels.ese = letters[1] + letters[2] + letters[1];
            }
            if (!customLabels.sse) {
                customLabels.sse = letters[2] + letters[2] + letters[1];
            }
            if (!customLabels.ssw) {
                customLabels.ssw = letters[2] + letters[2] + letters[3];
            }
            if (!customLabels.wsw) {
                customLabels.wsw = letters[3] + letters[2] + letters[3];
            }
            if (!customLabels.wnw) {
                customLabels.wnw = letters[3] + letters[0] + letters[3];
            }
            if (!customLabels.nnw) {
                customLabels.nnw = letters[0] + letters[0] + letters[3];
            }
        }
        return new DirectionLabels(
            showCardinalDirections,
            showIntercardinalDirections,
            showSubIntercardinalDirections,
            cardinalLabelSize,
            interCardinalLabelSize,
            subInterCardinalLabelSize,
            customLabels);
    }

    private static checkCardinalDirectionLettersOld(letters: string): string[] {
        if (letters || letters === '') {
            const length = letters.length
            if (length > 0 && length < 4) {
                throw new Error("Cardinal direction letters option should contain 4 letters, empty string or 4 comma seperated words.");
            } else if (length === 0) {
                return ['', '', '', ''];
            } else if (length === 4) {
                return letters.split('')
            }
            return letters.split(',');
        }
        return GlobalConfig.defaultCardinalDirectionLetters;
    }

    private static checkCardinalDirectionLetters(letters: string | undefined): string[] {
        if (letters && letters.length > 0) {
            if (letters.length !== 4) {
                throw new Error("Cardinal direction letters option should contain 4 letters.");
            }
            return letters.split('')
        }
        return GlobalConfig.defaultCardinalDirectionLetters;
    }

}
