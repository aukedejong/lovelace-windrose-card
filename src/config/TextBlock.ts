import {CardConfigTextBlock} from "../card/CardConfigTextBlock";

export class TextBlock {

    constructor(
        public readonly text: string,
        public readonly textSize: number,
        public readonly textColor: string) {}

    static fromConfig(config: CardConfigTextBlock): TextBlock | undefined {
        if (config == undefined) {
            return undefined;
        }
        return new TextBlock(config.text, config.text_size, config.text_color);
    }
}
