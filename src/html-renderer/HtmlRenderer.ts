import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {TemplateParser} from "../textblocks/TemplateParser";

export class HtmlRenderer {

    textBlockTop: HTMLDivElement | undefined;
    textBlockBottom: HTMLDivElement | undefined;

    constructor(private readonly cardConfig: CardConfigWrapper,
                private readonly templateParser: TemplateParser) {
    }

    setHtmlElements(textBlockTop: HTMLDivElement, textBlockBottom: HTMLDivElement): void {
        this.textBlockTop = textBlockTop;
        this.textBlockBottom = textBlockBottom;
    }

    renderTextBlocks() {
        if (this.cardConfig.textBlocks.top && this.textBlockTop) {
            this.textBlockTop.innerHTML = this.templateParser.parse(this.cardConfig.textBlocks.top.text);
        }
        if (this.cardConfig.textBlocks.bottom && this.textBlockBottom) {
            this.textBlockBottom.innerHTML = this.templateParser.parse(this.cardConfig.textBlocks.bottom.text);
        }
    }


}
