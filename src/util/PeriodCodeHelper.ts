import {PeriodPart} from "./PeriodPart";
import {isFuture} from "date-fns";

export class PeriodCodeHelper {

    //Possible options:
    // h hours
    // d days
    // w weeks
    // m months
    // q quarter
    // y years

    static readonly CHECK_REGEX = /^([+-]\d+[hdwmqy])+$/;
    static readonly DECODE_REGEX = /([+-])(\d+)([hdwmqy])/g;

    static checkInPast(configName: string, periodCode: string | undefined): boolean {
        if (PeriodCodeHelper.check(configName, periodCode)) {
            if (isFuture(PeriodCodeHelper.move(periodCode!, new Date()))) {
                throw new Error(`WindRoseCard: ${configName} should point to a date in the past`);
            }
            return true;
        }
        return false
    }

    static check(configName: string, periodCode: string | undefined): boolean {
        if (periodCode) {
            PeriodCodeHelper.CHECK_REGEX.lastIndex = 0;
            if (!PeriodCodeHelper.CHECK_REGEX.test(periodCode)) {
                throw new Error(`WindRoseCard: wrong ${configName} code, example '-2w-5h' means minus 2 weeks and 5 hours`);
            }
            return true;
        }
        return false;
    }

    static toHours(periodCode: string) {
        const parts = this.decodeToParts(periodCode);
        let hours = 0;
        parts.forEach((part) => {
            hours += part.toHours();
        });
        return hours;
    }

    static move(periodCode: string, date: Date) {
        const parts = this.decodeToParts(periodCode);
        let newDate: Date = date;
        parts.forEach((part) => {
            newDate = part.moveDate(newDate);
        })
        return newDate;
    }

    static decodeToParts(periodCode: string): PeriodPart[] {
        const result: PeriodPart[] = [];
        let match: RegExpExecArray | null;
        PeriodCodeHelper.DECODE_REGEX.lastIndex = 0;
        while (( match = PeriodCodeHelper.DECODE_REGEX.exec(periodCode)) !== null) {
            result.push(new PeriodPart(match[1], match[3], +match[2]));
        }
        return result;
    }
}
