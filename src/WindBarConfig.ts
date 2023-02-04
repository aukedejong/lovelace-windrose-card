
export class WindBarConfig {

    constructor(
        public label: string,
        public posX: number,
        public posY: number,
        public height: number,
        public length: number,
        public orientation: string,
        public full: boolean,
        public inputUnit: string,
        public outputUnit: string) {
    }
}