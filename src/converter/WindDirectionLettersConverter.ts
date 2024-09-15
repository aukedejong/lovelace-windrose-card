import {Log} from "../util/Log";

export class WindDirectionLettersConverter {

    directions: Record<string, number>;
    defaultLetters: string[] = ['N', 'E', 'S', 'W'];

    constructor(private readonly windDirectionLetters: string | undefined) {

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
            SWXW: 236.25,
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

    getDirection(direction: string): number {

        let convertedDirection = direction.toUpperCase();

        if (this.windDirectionLetters) {
            convertedDirection = this.convertDirectionLetters(direction);
        }

        return this.directions[convertedDirection];
    }

    private convertDirectionLetters(direction: string): string {
        let convertedDirection = '';
        for (let i = 0; i < direction.length; i++) {
            const index = this.windDirectionLetters!.indexOf(direction[i])
            if (index < 0) {
                Log.info('Could not translate cardinal direction, letters not found in config wind_direction_entity.direction_letters');
            }
            convertedDirection += this.defaultLetters[index];
        }
        return convertedDirection;
    }
}

