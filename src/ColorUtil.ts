export class ColorUtil {

    colors: string[] = [];

    constructor(count: number) {
        const startHue = 240;
        const endHue = 0;
        const saturation = 100;
        const lightness = 60;
        for (let i = 0; i < count; i++) {
            const hue = (startHue - (((startHue - endHue) / (count - 1)) * i));
            this.colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
    }
}
