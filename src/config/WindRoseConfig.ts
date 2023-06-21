export class WindRoseConfig {

    constructor(
        public centerRadius: number,
        public windDirectionCount: number,
        public windDirectionUnit: string,
        public windDirectionLetters: string | undefined,
        public leaveArc: number,
        public cardinalDirectionLetters: string,
        public directionCompensation: number,
        public windRoseDrawNorthOffset: number,

        public roseLinesColor: string,
        public roseDirectionLettersColor: string,
        public rosePercentagesColor: string) {
    }

}