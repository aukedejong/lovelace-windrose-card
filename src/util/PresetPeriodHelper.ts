import {
    endOfMonth,
    endOfWeek,
    endOfYear,
    endOfYesterday,
    startOfMonth,
    startOfToday,
    startOfWeek,
    startOfYear,
    startOfYesterday,
    subDays,
    subMonths,
    subWeeks,
    subYears
} from "date-fns";

export class PresetPeriodHelper {

    static getPeriod(preset: string): [fromDate: Date, toDate: Date] {
        const now = new Date();

        switch (preset) {
            case 'today':
                return [startOfToday(), now];
            case 'yesterday':
                return [startOfYesterday(), endOfYesterday()];
            case 'last_7_days':
                return [subDays(now, 7), now];
            case 'last_30_days':
                return [subDays(now, 30), now];
            case 'this_week':
                return [startOfWeek(now, { weekStartsOn: 1 }), now];
            case 'last_week':
                return [startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })];
            case 'this_month':
                return [startOfMonth(now), now];
            case 'last_month':
                const lastMonth = subMonths(now, 1);
                return [startOfMonth(lastMonth), endOfMonth(lastMonth)];
            case 'last_6_months':
                const sixMonthsBack = subMonths(now, 6);
                return [startOfMonth(sixMonthsBack), now];
            case 'this_year':
                return [startOfYear(now), now];
            case 'last_year':
                const lastYearDate = subYears(now, 1);
                return [startOfYear(lastYearDate), endOfYear(lastYearDate)];
            default:
                throw new Error('Invalid preset period: ' + preset);
        }

    }
}
