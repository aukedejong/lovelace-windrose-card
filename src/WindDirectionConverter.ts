
export class WindDirectionConverter {

    directions: Record<string, number>;

    constructor() {
        this.directions = {
            N: 0,
            NXE: 11.25,
            NNE: 22.5,
            NEXN: 33.75,
            NE: 45,
            NEXE: 56.25,
            ENE: 67.5,
            EXN: 78.75,
            E: 90,
            EXS: 101.25,
            ESE: 112.50,
            SEXE: 123.75,
            SE: 135,
            SEXS: 146.25,
            SSE: 157.50,
            SXE: 168.75,
            S: 180,
            SXW: 191.25,
            SSW: 202.5,
            SWXS: 213.75,
            SW: 225,
            SWxW: 236.25,
            WSW: 247.5,
            WXS: 258.75,
            W: 270,
            WXN: 281.25,
            WNW: 292.50,
            NWXW: 303.75,
            NW: 315,
            NWXN: 326.25,
            NNW: 337.5,
            NXW: 348.5,
            CALM: 0
        };
    }

    getDirection(designation: string): number {
        return this.directions[designation.toUpperCase()];
    }
}

