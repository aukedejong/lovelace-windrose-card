import {CardConfigButtonColors} from "../../card/CardConfigButtonColors";
import {ConfigCheckUtils} from "../ConfigCheckUtils";

export class ButtonColors {

    constructor(
        public readonly activeColor: string,
        public readonly activeBgColor: string,
        public readonly activeBorderColor: string,
        public readonly color: string,
        public readonly bgColor: string,
        public readonly borderColor: string,) {
    }

    static fromConfig(config: CardConfigButtonColors | undefined, defaultColors: ButtonColors | undefined) {
        if (defaultColors === undefined) {
            defaultColors = new ButtonColors('red', 'inherit', 'rgb(100, 100, 100)', 'inherit', 'inherit', 'rgb(100, 100, 100)');
        }
        if (config === undefined) {
            return defaultColors;
        }
        const activeColor = ConfigCheckUtils.checkStringOrDefault(config.active_color, defaultColors.activeColor);
        const activeBgColor = ConfigCheckUtils.checkStringOrDefault(config.active_bg_color, defaultColors.activeBgColor);
        const activeBorderColor = ConfigCheckUtils.checkStringOrDefault(config.active_border_color, defaultColors.activeBorderColor);
        const color = ConfigCheckUtils.checkStringOrDefault(config.color, defaultColors.color);
        const bgColor = ConfigCheckUtils.checkStringOrDefault(config.bg_color, defaultColors.bgColor);
        const borderColor = ConfigCheckUtils.checkStringOrDefault(config.border_color, defaultColors.borderColor);
        return new ButtonColors(activeColor, activeBgColor, activeBorderColor, color, bgColor, borderColor);
    }

    getCss(active: boolean) {
        return `color: ${active ? this.activeColor: this.color}; border-color: ${active ? this.activeBorderColor : this.borderColor}; background-color: ${active ? this.activeBgColor : this.bgColor}`
    }

}
