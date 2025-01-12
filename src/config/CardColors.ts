import {CardConfigColors} from "../card/CardConfigColors";

export class CardColors {
    roseLines: string;
    roseCardinalDirectionLabels: string;
    roseIntercardinalDirectionLabels: string;
    roseSubIntercardinalDirectionLabels: string;
    roseCenterPercentage: string;
    rosePercentages: string;
    roseCurrentDirectionArrow: string;
    barBorder: string;
    barUnitName: string;
    barName: string
    barUnitValues: string
    barPercentages: string;

    constructor() {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color');
        this.roseLines = 'rgb(160, 160, 160)';
        this.roseCardinalDirectionLabels = primaryColor;
        this.roseIntercardinalDirectionLabels = primaryColor;
        this.roseSubIntercardinalDirectionLabels = primaryColor;
        this.roseCenterPercentage = 'auto';
        this.rosePercentages = primaryColor;
        this.roseCurrentDirectionArrow = 'red';
        this.barBorder = 'rgb(160, 160, 160)';
        this.barUnitName = primaryColor;
        this.barName = primaryColor;
        this.barUnitValues = primaryColor;
        this.barPercentages = 'auto';
    }

    public static fromConfig(config: CardConfigColors): CardColors {
        const cardColors = new CardColors();
        let roseDirectionLetters = cardColors.roseCardinalDirectionLabels; //Save default color.
        if (config) {
            if (config.rose_direction_letters) {
                roseDirectionLetters = config.rose_direction_letters;
            }

            if (config.rose_cardinal_direction_labels) {
                cardColors.roseCardinalDirectionLabels = config.rose_cardinal_direction_labels;
            }  else {
                cardColors.roseCardinalDirectionLabels = roseDirectionLetters;
            }

            if (config.rose_intercardinal_direction_labels) {
                cardColors.roseIntercardinalDirectionLabels = config.rose_intercardinal_direction_labels;
            }  else {
                cardColors.roseIntercardinalDirectionLabels = roseDirectionLetters;
            }

            if (config.rose_secondary_intercardinal_direction_labels) {
                cardColors.roseSubIntercardinalDirectionLabels = config.rose_secondary_intercardinal_direction_labels;
            }  else {
                cardColors.roseSubIntercardinalDirectionLabels = roseDirectionLetters;
            }

            if (config.rose_lines) {
                cardColors.roseLines = config.rose_lines;
            }
            if (config.rose_percentages) {
                cardColors.rosePercentages = config.rose_percentages;
            }
            if (config.rose_center_percentage) {
                cardColors.roseCenterPercentage = config.rose_center_percentage;
            }
            if (config.rose_current_direction_arrow) {
                cardColors.roseCurrentDirectionArrow = config.rose_current_direction_arrow
            }
            if (config.bar_border) {
                cardColors.barBorder = config.bar_border;
            }
            if (config.bar_name) {
                cardColors.barName = config.bar_name;
            }
            if (config.bar_percentages) {
                cardColors.barPercentages = config.bar_percentages;
            }
            if (config.bar_unit_name) {
                cardColors.barUnitName = config.bar_unit_name;
            }
            if (config.bar_unit_values) {
                cardColors.barUnitValues = config.bar_unit_values;
            }
        }
        return cardColors;
    }
}
