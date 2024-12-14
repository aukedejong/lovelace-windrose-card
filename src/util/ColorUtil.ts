export class ColorUtil {

    static getColorArray(count: number) : string[] {
        const startHue = 240;
        const endHue = 0;
        const saturation = 100;
        const lightness = 60;
        const colors: string[] = [];
        for (let i = 0; i < count; i++) {
            const hue = (startHue - (((startHue - endHue) / (count - 1)) * i));
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        return colors;
    }

    static getTextColorBasedOnBackground(backgroundColor: string): string {
        // Extract R, G, B from the input RGB color
        const rgb = ColorUtil.getRgbColor(backgroundColor);
        if (rgb === undefined) {
            return 'black';
        }
        let r = rgb[0];
        let g = rgb[1];
        let b = rgb[2];

        // Normalize the RGB values
        r /= 255;
        g /= 255;
        b /= 255;

        // Apply the luminance formula
        r = (r <= 0.03928) ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        g = (g <= 0.03928) ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        b = (b <= 0.03928) ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

        // Calculate relative luminance
        let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // If the luminance is more than 0.179, return black text, otherwise white text
        return (luminance > 0.179) ? '#000000' : '#FFFFFF';
    }

    private static getRgbColor(color: string): number[] | undefined {

        let div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);
        let rgbString = window.getComputedStyle(div).color;
        document.body.removeChild(div);
        if (rgbString) {
            // @ts-ignore
            return rgbString.match(/\d+/g).map(Number);
        }
        return undefined;
    }

}
