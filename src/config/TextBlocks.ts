import {TextBlock} from "./TextBlock";
import {CardConfigTextBlocks} from "../card/CardConfigTextBlocks";

export class TextBlocks {

    constructor(public readonly top: TextBlock | undefined,
                public readonly bottom: TextBlock | undefined) {
    }

    static fromConfig(config: CardConfigTextBlocks): TextBlocks {
        if (config === undefined) {
            return new TextBlocks(undefined, undefined);
        }
        return new TextBlocks(TextBlock.fromConfig(config.top), TextBlock.fromConfig(config.bottom));
    }
}
