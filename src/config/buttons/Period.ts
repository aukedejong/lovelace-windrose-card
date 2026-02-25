import {CardConfigDataPeriod} from "../../card/CardConfigDataPeriod";
import {ButtonsConfig} from "./ButtonsConfig";
import {PeriodSelectorButton} from "./types/PeriodSelectorButton";
import {Log} from "../../util/Log";
import {ConfigCheckUtils} from "../ConfigCheckUtils";
import {PresetPeriodHelper} from "../../util/PresetPeriodHelper";

export class Period {

    public startTime!: Date;
    public endTime!: Date;

    constructor(
        public type: string,
        public readonly useStatistics: boolean | undefined,
        public readonly statisticsPeriod: string | undefined,
        public presetPeriod: string | undefined,
        public hoursToShow: number | undefined,
        public fromHourOfDay: number | undefined,
        public fromHoursAgo: number | undefined,
        public toHoursAgo: number | undefined,
        public initStartTime: Date | undefined,
        public initEndTime: Date | undefined) {

        if (initStartTime === undefined || initEndTime === undefined) {
            this.calculateTimeRange();
        } else {
            this.startTime = initStartTime;
            this.endTime = initEndTime;
        }
    }

    toString(): string {
        return `Type: ${this.type} (hoursToShow: ${this.hoursToShow}), (fromHoursOfDay: ${this.fromHourOfDay}, fromHoursAgo: ${this.fromHoursAgo}), toHoursAgo: ${this.toHoursAgo})`;
    }

    clone(): Period {
        return new Period(this.type, this.useStatistics,this.statisticsPeriod,  this.presetPeriod, this.hoursToShow, this.fromHourOfDay,
            this.fromHoursAgo, this.toHoursAgo, this.startTime, this.endTime);
    }

    private calculateTimeRange() {
        const now = new Date();
        if (this.startTime && this.endTime) {
            return; //Calculation not needed.
        }
        if (this.fromHoursAgo != null && this.toHoursAgo != null) {
            // Time window mode: from X hours ago to Y hours ago
            this.startTime = new Date(now);
            this.startTime.setHours(this.startTime.getHours() - this.fromHoursAgo);
            this.endTime = new Date(now);
            this.endTime.setHours(this.endTime.getHours() - this.toHoursAgo);

        } else if (this.hoursToShow) {
            // Existing mode: last X hours up to now
            this.startTime = new Date(now);
            this.startTime.setHours(this.startTime.getHours() - this.hoursToShow);
            this.endTime = now;

        } else if ((this.fromHourOfDay && this.fromHourOfDay > 0) || this.fromHourOfDay === 0) {
            // Existing mode: from hour of day up to now
            this.startTime = new Date(now);
            if (this.startTime.getHours() < this.fromHourOfDay) {
                this.startTime.setDate(this.startTime.getDate() - 1);
            }
            this.startTime.setHours(this.fromHourOfDay, 0, 0, 0);
            this.endTime = now;
        } else {
            throw new Error("No data period config option available.");
        }

        Log.info('Using time range for data query', this.startTime, this.endTime);
    }

    movePeriod(hours: number): boolean {
        const endTime = new Date(this.endTime.getTime() + (hours * 3600000));
        if (endTime > new Date()) {
            return false;
        }
        this.startTime = new Date(this.startTime.getTime() + (hours * 3600000));
        this.endTime = endTime;
        return true;
    }

    static fromConfig(config: CardConfigDataPeriod): Period | undefined {
        if (config) {
            let type = '';
            let optionsSet = 0;

            this.checkDeprecations(config);
            const useStatistics = ConfigCheckUtils.checkBooleanDefaultUndefined(config.use_statistics);
            const statsPeriod = ConfigCheckUtils.checkStatisticsPeriod(config.statistics_period);
            let fromDate: Date | undefined;
            let toDate: Date | undefined;
            if (ConfigCheckUtils.checkString(config.preset_period)) {
                type = 'preset';
                [fromDate, toDate] = PresetPeriodHelper.getPeriod(config.preset_period);
                optionsSet++;
            }
            if (this.checkHoursToShow(config.hours_to_show)) {
                type = 'hoursToShow';
                optionsSet++;
            }
            if (this.checkFromHourOfDay(config.from_hour_of_day)) {
                type = 'fromHourOfDay';
                optionsSet++;
            }
            if (this.checkTimeWindowRelative(config.from_hours_ago, config.to_hours_ago)) {
                type = 'windowRelative';
                optionsSet++;
            }
            if (this.checkTimeWindowFixed(config.from_date, config.to_date)) {
                type = 'windowFixed';
                fromDate = new Date(config.from_date);
                toDate = new Date(config.to_date);
                optionsSet++;
            }
            if (optionsSet === 0) {
                throw new Error('No data period config options set.');
            }
            if (optionsSet > 1) {
                throw new Error('Multiple period types set, use one type: preset-period, hours_to_show, from_hours_of_day, time window, or date options.')
            }
            return new Period(type, useStatistics, statsPeriod, config.preset_period, config.hours_to_show, config.from_hour_of_day, config.from_hours_ago,
                config.to_hours_ago, fromDate, toDate);
        }
        return undefined;
    }

    static determineActivePeriod(dataPeriod: Period | undefined, buttonsConfig: ButtonsConfig | undefined): Period {
        const activeButton = ButtonsConfig.getActivePeriodSelector(buttonsConfig);
        if (activeButton && activeButton instanceof PeriodSelectorButton) {
            return (activeButton as PeriodSelectorButton).period.clone() as Period;
        } else if (dataPeriod) {
            return dataPeriod.clone();
        }
        throw new Error('Data_period or an active period_selector button should be configured.')
    }

    private static checkHoursToShow(hoursToShow: number | undefined): boolean {
        if (hoursToShow && isNaN(hoursToShow) ) {
            throw new Error('Invalid hours_to_show, should be a number above 0.');
        } else if (hoursToShow) {
            return true
        }
        return false;
    }

    private static checkFromHourOfDay(fromHourOfDay: number | undefined): boolean {
        if (fromHourOfDay && (isNaN(fromHourOfDay) || fromHourOfDay < 0 || fromHourOfDay > 23)) {
            throw new Error('Invalid hours_to_show, should be a number between 0 and 23, hour of the day..');
        } else if (fromHourOfDay != null && fromHourOfDay >= 0) {
            return true
        }
        return false;
    }

    private static checkTimeWindowRelative(fromHoursAgo: number | undefined, toHoursAgo: number | undefined): boolean {
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

    private static checkTimeWindowFixed(fromDate: string | undefined, toDate: string | undefined): boolean {
        let hasFromDate, hasToDate: boolean = false;
        let fromDateOk, toDateOk: boolean = false;
        if (fromDate) {
            hasFromDate = true;
            fromDateOk = ConfigCheckUtils.checkDateString(fromDate);
        }
        if (toDate) {
            hasToDate = true;
            toDateOk = ConfigCheckUtils.checkDateString(toDate);
        }
        if (fromDateOk && toDateOk) {
            return true;
        }
        if (hasFromDate && !hasToDate) {
            throw new Error('WindRoseCard: from_date requires to_date to be set.');
        }
        if (!hasFromDate && hasToDate) {
            throw new Error('WindRoseCard: to_date requires from_date to be set.');
        }
        if (hasFromDate && !fromDateOk) {
            throw new Error('WindRoseCard: from_date not in correct ISO format: ' + fromDate);
        }
        if (hasToDate && !toDateOk) {
            throw new Error('WindRoseCard: to_date not in correct ISO format: ' + toDate);
        }

        return false;
    }

    private static checkDeprecations(config: CardConfigDataPeriod) {
        if (ConfigCheckUtils.checkHasProperty(config, 'period_selector')) {
            throw new Error('period_selector option is replace to buttons_config on root level, see readme.md for details.')
        }
        if (ConfigCheckUtils.checkHasProperty(config, 'time_interval')) {
            throw new Error('time_interval option is moved to matching-strategy object on root level.')
        }
        if (ConfigCheckUtils.checkHasProperty(config, 'log_measurement_counts')) {
            throw new Error('log_measurement_counts option is moved to matching-strategy object on root level.')
        }
    }
}
