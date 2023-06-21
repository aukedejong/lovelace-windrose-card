export class WindDirectionEntity {

    constructor(
        public readonly entity: string,
        public readonly useStatistics: boolean,
        public readonly directionUnit: string,
        public readonly directionCompensation: number,
        public readonly directionLetters: string | undefined,
    ) {}

}