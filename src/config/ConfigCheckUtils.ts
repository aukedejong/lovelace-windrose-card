export class ConfigCheckUtils {

    public static checkNumberOrUndefined(name: string, number: string | number | undefined): number | undefined {
        if (number === null || number === undefined) {
            return undefined;
        } else if (isNaN(+number as any)) {
            throw new Error(`Cnofiguration ${name} is not a number: ` + number);
        }
        return +number;
    }

    public static checkNummerOrDefault(number: string | number | undefined, defaultNumber: number): number {
        if (number === null || number === undefined || isNaN(+number as any)) {
            return defaultNumber;
        }
        return +number;
    }

    public static checkNumber(name: string, number: string | number | undefined): number {
        if (number === null || number === undefined || isNaN(+number as any)) {
            throw new Error(`Cnofiguration ${name} is not a number: ` + number);
        }
        return +number;
    }

    public static checkBooleanDefaultFalse(value: boolean | undefined): boolean {
        if (value === undefined || value === null) {
            return false;
        }
        return value;
    }

    public static checkBooleanDefaultUndefined(value: boolean | undefined): boolean | undefined{
        if (value === undefined || value === null) {
            return undefined;
        }
        return value;
    }

    public static checkBooleanDefaultTrue(value: boolean | undefined): boolean {
        if (value === undefined || value === null) {
            return true;
        }
        return value;
    }

    public static checkString(value: string | undefined | null): string | undefined {
        if (value === undefined || value === null || value.trim() === '') {
            return undefined;
        }
        return value;
    }

    public static checkStringOrDefault(value: string | undefined | null, defaultValue: string): string {
        if (ConfigCheckUtils.checkString(value) === undefined) {
            return defaultValue;
        }
        return value!;
    }

    public static checkStatisticsPeriod(period: string | undefined | null): string {
        if (period === undefined) {
            return '5minute';
        } else  if (period === '5minute' || period === 'hour' || period === 'day' || period === 'week' || period === 'month' || period === 'year') {
            return period;
        }
        throw new Error(`statistics_period ${period} is invalid, should be one of 5minute, hour, day, week, month, year`);
    }

    public static checkDateString(date: string): boolean {
        // const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
        //
        // if (!isoRegex.test(date)) {
        //     return false;
        // }

        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
    }

    public static checkHasProperty(obj: unknown, property: string): boolean {
        return typeof obj === "object" &&
            obj !== null &&
            property in obj;
    }

}
