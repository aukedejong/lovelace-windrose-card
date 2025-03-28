import {Log} from "../util/Log";

export class WindDirectionLettersConverter {

    directions: Record<string, number | undefined>;
    defaultLetters: string[] = ['N', 'E', 'S', 'W', 'X'];

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
            CALM: undefined,
            VRB: undefined
        };
    }

    convertToDegrees(cardinalDirection: string): number | undefined {

        let convertedDirection = cardinalDirection.toUpperCase();

        if (this.windDirectionLetters) {
            convertedDirection = this.convertDirectionLettersToDefault(cardinalDirection);
        }

        return this.directions[convertedDirection];
    }

    static getConvertToDegreesFunc(directionLetters: string) {
        const converter = new WindDirectionLettersConverter(directionLetters);
        return converter.convertToDegrees.bind(converter);
    }

    private convertDirectionLettersToDefault(direction: string): string {
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

    convertToLetters(direction: number | string | undefined): string | undefined {
        if (direction === undefined) {
            return 'CALM';
        }
        if (direction === '' || isNaN(+direction) || +direction < 0) {
            Log.warn('Can not convert wind direction to cardinal letters, direction: ', direction);
            return 'CALM';
        }
        let deling = 11.25 //DefaultLetters is 5
        if (this.windDirectionLetters) {
            deling = this.windDirectionLetters.length === 5 ? 11.25 : 22.5;
        }
        let index = Math.round(+direction / deling);
        if (this.windDirectionLetters?.length === 4) {
            index = index * 2;
        }
        if (index === 32) {
            index = 0;
        }
        const entries = Object.entries(this.directions);
        if (this.windDirectionLetters) {
            return this.convertDirectionLettersFromDefault(entries[index][0]);
        }
        return entries[index][0];
    }

    private convertDirectionLettersFromDefault(direction: string): string {
        let convertedDirection = '';
        for (let i = 0; i < direction.length; i++) {
            const index = this.defaultLetters.indexOf(direction[i])
            if (index < 0) {
                Log.info('Could not translate cardinal direction, letters not found in config wind_direction_entity.direction_letters');
            }
            convertedDirection += this.windDirectionLetters![index];
        }
        return convertedDirection;
    }

    static getConvertToLettersFunc(directionLetters: string) {
        const converter = new WindDirectionLettersConverter(directionLetters);
        return converter.convertToLetters.bind(converter);
    }
}

