export class WindSpeedEntity {

    constructor(
        public readonly entity: string,
        public readonly name: string,
        public readonly useStatistics: boolean,
        public speedUnit: string
    ) {}

}