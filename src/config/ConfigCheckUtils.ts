export class ConfigCheckUtils {


    public static checkNummerOrDefault(number: string | number, defaultNumber: number): number {
        if (isNaN(number as any)) {
            return defaultNumber;
        }
        return +number;
    }


    public static checkBooleanDefaultFalse(value: boolean | undefined): boolean {
        if (value === undefined || value === null) {
            return false;
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

}
