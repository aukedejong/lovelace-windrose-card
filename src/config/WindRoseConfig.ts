export class WindRoseConfig {

    constructor(
        public centerRadius: number,
        public windDirectionCount: number,
        public windDirectionLetters: string | undefined,
        public leaveArc: number,
        public cardinalDirectionLetters: string,
        public directionCompensation: number,
        public windRoseDrawNorthOffset: number,
        public centerCalmPercentage: boolean,
        public currentDirectionArrowSize: number | undefined,
        public currentDirectionCenterCircleSize: number | undefined,

        public roseLinesColor: string,
        public roseDirectionLettersColor: string,
        public roseCenterPercentageColor: string,
        public rosePercentagesColor: string,
        public roseCurrentDirectionArrowColor: string) {
    }

}
