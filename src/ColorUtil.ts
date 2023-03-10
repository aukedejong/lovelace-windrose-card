export class ColorUtil {

    getColorArray(count: number) : string[] {
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
}
