import {CardConfigDataPeriod} from "../card/CardConfigDataPeriod";
import {ConfigCheckUtils} from "./ConfigCheckUtils";
import {Log} from "../util/Log";
import {PeriodSelector} from "./PeriodSelector";

export class DataPeriod {
    constructor(
        public hourstoShow: number | undefined,
        public periodSelector: PeriodSelector | undefined,
        public readonly fromHourOfDay: number | undefined,
        public readonly fromHoursAgo: number | undefined,
        public readonly toHoursAgo: number | undefined,
        public readonly timeInterval: number,
        public readonly logMeasurementCounts: boolean) {
    }

    static fromConfig(oldHoursToShow: number, dataPeriod: CardConfigDataPeriod | undefined): DataPeriod {
        const oldHoursToShowCheck = this.checkHoursToShow(oldHoursToShow);
        const hoursToShowCheck = this.checkHoursToShow(dataPeriod?.hours_to_show);
        const fromHourOfDayCheck = this.checkFromHourOfDay(dataPeriod?.from_hour_of_day);
        const timeWindowCheck = this.checkTimeWindow(dataPeriod?.from_hours_ago, dataPeriod?.to_hours_ago);
        const logMeasurementCounts = ConfigCheckUtils.checkBooleanDefaultFalse(dataPeriod?.log_measurement_counts);
        let timeInterval = ConfigCheckUtils.checkNummerOrDefault(dataPeriod?.time_interval, 60);
        if (timeInterval === 0) {
            timeInterval = 60;
        }
        const periodSelector = PeriodSelector.fromConfig(dataPeriod?.period_selector);
        if (oldHoursToShowCheck) {
            Log.warn('WindRoseCard: hours_to_show config is deprecated, use the data_period object.');
            return new DataPeriod(oldHoursToShow, undefined, undefined, undefined, undefined, timeInterval, logMeasurementCounts);
        }
        let optionCount = 0;
        if (periodSelector) {
            optionCount++;
        }
        if (hoursToShowCheck) {
            optionCount++;
        }
        if (fromHourOfDayCheck) {
            optionCount++;
        }
        if (timeWindowCheck) {
            optionCount++;
        }
        if (optionCount > 1) {
            throw new Error('WindRoseCard: Only one is allowed: hours_to_show, from_hour_of_day, time window (from_hours_ago/to_hours_ago) or period_selector');
        } else if (optionCount === 0) {
            throw new Error('WindRoseCard: hours_to_show, from_hour_of_day, time window (from_hours_ago/to_hours_ago) or period_selector of object data_period should be filled.');
        }
        let hoursToShow = dataPeriod?.hours_to_show;
        if (periodSelector && periodSelector.buttons) {
            const activePeriod = periodSelector.buttons.find((button) => button.active);
            hoursToShow = activePeriod!.hours;
        }
        return new DataPeriod(hoursToShow, periodSelector, dataPeriod?.from_hour_of_day, dataPeriod?.from_hours_ago, dataPeriod?.to_hours_ago, timeInterval, logMeasurementCounts);
    }

    private static checkHoursToShow(hoursToShow: number | undefined): boolean {
        if (hoursToShow && isNaN(hoursToShow) ) {
            throw new Error('WindRoseCard: Invalid hours_to_show, should be a number above 0.');
        } else if (hoursToShow) {
            return true
        }
        return false;
    }

    private static checkFromHourOfDay(fromHourOfDay: number | undefined): boolean {
        if (fromHourOfDay && (isNaN(fromHourOfDay) || fromHourOfDay < 0 || fromHourOfDay > 23)) {
            throw new Error('WindRoseCard: Invalid hours_to_show, should be a number between 0 and 23, hour of the day..');
        } else if (fromHourOfDay != null && fromHourOfDay >= 0) {
            return true
        }
        return false;
    }

    private static checkTimeWindow(fromHoursAgo: number | undefined, toHoursAgo: number | undefined): boolean {
        const hasFromHoursAgo = fromHoursAgo != null && fromHoursAgo >= 0;
        const hasToHoursAgo = toHoursAgo != null && toHoursAgo >= 0;
        
        if (hasFromHoursAgo && !hasToHoursAgo) {
            throw new Error('WindRoseCard: from_hours_ago requires to_hours_ago to be set.');
        }
        if (!hasFromHoursAgo && hasToHoursAgo) {
            throw new Error('WindRoseCard: to_hours_ago requires from_hours_ago to be set.');
        }
        if (hasFromHoursAgo && hasToHoursAgo) {
            if (isNaN(fromHoursAgo!) || fromHoursAgo! < 0) {
                throw new Error('WindRoseCard: Invalid from_hours_ago, should be a number >= 0.');
            }
            if (isNaN(toHoursAgo!) || toHoursAgo! < 0) {
                throw new Error('WindRoseCard: Invalid to_hours_ago, should be a number >= 0.');
            }
            if (fromHoursAgo! < toHoursAgo!) {
                throw new Error('WindRoseCard: from_hours_ago must be >= to_hours_ago.');
            }
            return true;
        }
        return false;
    }
}
