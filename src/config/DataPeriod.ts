import {CardConfigDataPeriod} from "../card/CardConfigDataPeriod";
import {ConfigCheckUtils} from "./ConfigCheckUtils";
import {Log} from "../util/Log";
import {PeriodSelector} from "./PeriodSelector";

export class DataPeriod {
    constructor(
        public hourstoShow: number | undefined,
        public periodSelector: PeriodSelector | undefined,
        public readonly fromHourOfDay: number | undefined,
        public readonly timeInterval: number,
        public readonly logMeasurementCounts: boolean) {
    }

    static fromConfig(oldHoursToShow: number, dataPeriod: CardConfigDataPeriod): DataPeriod {
        const oldHoursToShowCheck = this.checkHoursToShow(oldHoursToShow);
        const hoursToShowCheck = this.checkHoursToShow(dataPeriod?.hours_to_show);
        const fromHourOfDayCheck = this.checkFromHourOfDay(dataPeriod?.from_hour_of_day);
        const logMeasurementCounts = ConfigCheckUtils.checkBooleanDefaultFalse(dataPeriod?.log_measurement_counts);
        let timeInterval = ConfigCheckUtils.checkNummerOrDefault(dataPeriod?.time_interval, 60);
        if (timeInterval === 0) {
            timeInterval = 60;
        }
        const periodSelector = PeriodSelector.fromConfig(dataPeriod.period_selector);
        if (oldHoursToShowCheck) {
            Log.warn('WindRoseCard: hours_to_show config is deprecated, use the data_period object.');
            return new DataPeriod(oldHoursToShow, undefined, undefined, timeInterval, logMeasurementCounts);
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
        if (optionCount > 1) {
            throw new Error('WindRoseCard: Only one is allowed: hours_to_show, from_hour_of_day or period_selector');
        } else if (optionCount === 0) {
            throw new Error('WindRoseCard: hours_to_show, from_hour_of_day or period_selector of object data_period should be filled.');
        }
        let hoursToShow = dataPeriod?.hours_to_show;
        if (periodSelector && periodSelector.buttons) {
            const activePeriod = periodSelector.buttons.find((button) => button.active);
            hoursToShow = activePeriod!.hours;
        }
        return new DataPeriod(hoursToShow, periodSelector, dataPeriod.from_hour_of_day, timeInterval, logMeasurementCounts);
    }

    private static checkHoursToShow(hoursToShow: number): boolean {
        if (hoursToShow && isNaN(hoursToShow) ) {
            throw new Error('WindRoseCard: Invalid hours_to_show, should be a number above 0.');
        } else if (hoursToShow) {
            return true
        }
        return false;
    }

    private static checkFromHourOfDay(fromHourOfDay: number): boolean {
        if (fromHourOfDay && (isNaN(fromHourOfDay) || fromHourOfDay < 0 || fromHourOfDay > 23)) {
            throw new Error('WindRoseCard: Invalid hours_to_show, should be a number between 0 and 23, hour of the day..');
        } else if (fromHourOfDay != null && fromHourOfDay >= 0) {
            return true
        }
        return false;
    }
}
