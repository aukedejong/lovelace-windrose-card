export class WindSpeedConverter {

    windkrachtTableBft: WindSpeedRow[];
    windkrachtTableKph: WindSpeedRow[];

    constructor() {
        this.windkrachtTableBft = [];
        this.windkrachtTableBft[0] = new WindSpeedRow(0, 0, 0.2, 0, 1);
        this.windkrachtTableBft[1] = new WindSpeedRow(1, 0.3, 1.5, 1, 5);
        this.windkrachtTableBft[2] = new WindSpeedRow(2, 1.5, 3.3, 6, 11);
        this.windkrachtTableBft[3] = new WindSpeedRow(3, 3.4, 5.4, 12, 19);
        this.windkrachtTableBft[4] = new WindSpeedRow(4, 5.5, 7.9, 20, 28);
        this.windkrachtTableBft[5] = new WindSpeedRow(5, 8, 10.7, 29, 38);
        this.windkrachtTableBft[6] = new WindSpeedRow(6, 10.8, 13.8, 39, 49);
        this.windkrachtTableBft[7] = new WindSpeedRow(7, 13.9, 17.1, 50, 61);
        this.windkrachtTableBft[8] = new WindSpeedRow(8, 17.2, 20.7, 62, 64);
        this.windkrachtTableBft[9] = new WindSpeedRow(9, 20.8, 24.4, 75, 88);
        this.windkrachtTableBft[10] = new WindSpeedRow(10, 24.5, 28.4, 89, 102);
        this.windkrachtTableBft[11] = new WindSpeedRow(11, 28.5, 32.6, 103, 117);
        this.windkrachtTableBft[12] = new WindSpeedRow(12, 32.7, -1, 117, -1);

        this.windkrachtTableKph = [];
        this.windkrachtTableKph[0] = new WindSpeedRow(0, 0, 0.2, 0, 1);
        this.windkrachtTableKph[1] = new WindSpeedRow(1, 0.3, 1.5, 1, 5);
        this.windkrachtTableKph[2] = new WindSpeedRow(2, 1.5, 3.3, 6, 11);
        this.windkrachtTableKph[3] = new WindSpeedRow(3, 3.4, 5.4, 12, 19);
        this.windkrachtTableKph[4] = new WindSpeedRow(4, 5.5, 7.9, 20, 28);
        this.windkrachtTableKph[5] = new WindSpeedRow(5, 8, 10.7, 29, 38);
        this.windkrachtTableKph[6] = new WindSpeedRow(6, 10.8, 13.8, 39, 49);
        this.windkrachtTableKph[7] = new WindSpeedRow(7, 13.9, 17.1, 50, 61);
        this.windkrachtTableKph[8] = new WindSpeedRow(8, 17.2, 20.7, 62, 64);
        this.windkrachtTableKph[9] = new WindSpeedRow(9, 20.8, 24.4, 75, 88);
        this.windkrachtTableKph[10] = new WindSpeedRow(10, 24.5, 28.4, 89, 102);
        this.windkrachtTableKph[11] = new WindSpeedRow(11, 28.5, 32.6, 103, 117);
        this.windkrachtTableKph[12] = new WindSpeedRow(12, 32.7, -1, 117, -1);
    }

    getByMeterPerSecond(speed: number): WindSpeedRow | undefined {
        return this.windkrachtTableBft?.find((row) => row.isMeterPerSecondMatch(speed));
    }

    convertKphToMps(speedInKph: number) {
        return speedInKph * (5 / 18);
    }

    convertKnotsToMps(speedInKnots: number) {
        return speedInKnots / 1.9438444924406;
    }

    convertMphToMph(speedInMph: number) {
        return speedInMph * 0.447;
    }
}

export class WindSpeedRow {

    constructor(
        private readonly bft: number,
        private readonly minMeterPerSecond: number,
        private readonly maxMeterPerSecond: number,
        private readonly minKmPerUur: number,
        private readonly maxKmPerUur: number
    ) {
    }

    getBft() {
        return this.bft;
    }

    isMeterPerSecondMatch(speed: number): boolean {
        return speed >= this.minMeterPerSecond && (speed <= this.maxMeterPerSecond || this.maxMeterPerSecond === -1);
    }
}