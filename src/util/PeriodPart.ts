import {
    addDays,
    addHours,
    addMinutes,
    addMonths,
    addQuarters,
    addSeconds,
    addWeeks,
    addYears,
    subDays,
    subHours,
    subMonths,
    subQuarters,
    subSeconds,
    subWeeks,
    subYears
} from "date-fns";
import {subMinutes} from "date-fns/subMinutes";

export class PeriodPart {

    constructor(
        private direction: string,
        private unit: string,
        private value: number) {
    }

    partString(): string {
        return this.direction + "," + this.unit + "," + this.value;
    }

    toHours(): number {
        let hours = 0;
        switch(this.unit) {
            case 'h': hours = this.value; break;
            case 'd': hours = 24 * this.value; break;
            case 'w': hours = 24 * 7 * this.value; break;
            case 'm': hours = 31 * 24 * this.value; break;
            case 'q': hours = 3 * 31 * 24 * this.value; break;
            case 'y': hours = 365 * 24 * this.value; break;
            default: throw new Error("Unknown unit, this is a bug, please report: " + this.unit);
        }
        if (this.direction === '-') {
            return -hours;
        }
        return hours;
    }

    moveDate(date: Date): Date {
        if (this.direction === '+') {
            switch (this.unit) {
                case 's': return addSeconds(date, this.value);
                case 'mi': return addMinutes(date, this.value);
                case 'h': return addHours(date, this.value);
                case 'd': return addDays(date, this.value);
                case 'w': return addWeeks(date, this.value);
                case 'm': return addMonths(date, this.value);
                case 'q': return addQuarters(date, this.value);
                case 'y': return addYears(date, this.value);
                default: throw new Error("Unknown unit, this is a bug, please report: " + this.unit);
            }
        } else {
            switch(this.unit) {
                case 's': return subSeconds(date, this.value);
                case 'mi': return subMinutes(date, this.value);
                case 'h': return subHours(date, this.value);
                case 'd': return subDays(date, this.value);
                case 'w': return subWeeks(date, this.value);
                case 'm': return subMonths(date, this.value);
                case 'q': return subQuarters(date, this.value);
                case 'y': return subYears(date, this.value);
                default: throw new Error("Unknown unit, this is a bug, please report: " + this.unit);
            }
        }
    }
}
