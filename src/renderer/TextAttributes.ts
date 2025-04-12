export class TextAttributes {

    static directionLettersAttribute = {
        fill: "white",
        "font-size": 50,
        "font-family": "arial",
    }

    static infoCornerAttribute(color: string, textSize: number) {
        return {
            fill: color,
            "font-size": textSize,
            "font-family": "arial"
        }
    }

    static infoCornerLabelAttribute(color: string, textSize: number) {
        return {
            fill: color,
            "font-size": textSize,
            "font-family": "arial"
        }
    }

    static roseLegendAttribute(color: string, text_size: number) {
        return {
            fill: color,
            "font-size": text_size,
            "font-family": "arial",
            "text-anchor": "middle",
            "dominant-baseline": "middle"
        }
    }

    static windBarAttribute(color: string, fontSize: number, baseline: string, anchor: string) {
        return {
            fill: color,
            "font-size": fontSize,
            "font-family": "Arial",
            "text-anchor": anchor,
            "dominant-baseline": baseline
        }
    }

}
