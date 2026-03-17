import {CardConfigDataPeriod} from "../../card/CardConfigDataPeriod";
import {ButtonsConfig} from "./ButtonsConfig";
import {PeriodSelectorButton} from "./types/PeriodSelectorButton";
import {Log} from "../../util/Log";
import {ConfigCheckUtils} from "../ConfigCheckUtils";
import {PresetPeriodHelper} from "../../util/PresetPeriodHelper";
import {PeriodCodeHelper} from "../../util/PeriodCodeHelper";

export class Period {

    public startTime!: Date;
    public endTime!: Date;

    constructor(
        public type: string,
        public readonly useStatistics: boolean | undefined,
        public readonly statisticsPeriod: string | undefined,
        public presetPeriod: string | undefined,
        public periodBack: string | undefined,
        public fromHourOfDay: number | undefined,
        public fromPeriodAgo: string | undefined,
        public toPeriodAgo: string | undefined,
        public initStartTime: Date | undefined,
        public initEndTime: Date | undefined) {

        this.calculateTimeRange();
    }

    toString(): string {
        return `Type: ${this.type} (periodBack: ${this.periodBack}), (fromHoursOfDay: ${this.fromHourOfDay}, fromPeriodAgo: ${this.fromPeriodAgo}), toPeriodAgo: ${this.toPeriodAgo})`;
    }

    clone(): Period {
        return new Period(this.type, this.useStatistics,this.statisticsPeriod,  this.presetPeriod, this.periodBack, this.fromHourOfDay,
            this.fromPeriodAgo, this.toPeriodAgo, undefined, undefined);
    }

    recalculateTimeRange(): void {
        this.calculateTimeRange();
    }

    private calculateTimeRange() {
        const now = new Date();
        if (this.initStartTime && this.initEndTime) {
            this.startTime = this.initStartTime;
            this.endTime = this.initEndTime;
            return; //Calculation not needed.
        }
        if (this.fromPeriodAgo != null && this.toPeriodAgo != null) {
            this.startTime = PeriodCodeHelper.move(this.fromPeriodAgo, now);
            this.endTime = PeriodCodeHelper.move(this.toPeriodAgo, now);

        } else if (this.presetPeriod) {
            [this.startTime, this.endTime] = PresetPeriodHelper.getPeriod(this.presetPeriod);

        } else if (this.periodBack) {
            this.startTime = PeriodCodeHelper.move(this.periodBack, new Date(now));
            this.endTime = now;

        } else if ((this.fromHourOfDay && this.fromHourOfDay > 0) || this.fromHourOfDay === 0) {
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

    movePeriod(period: string): boolean {
        const endTime = PeriodCodeHelper.move(period, this.endTime);
        if (endTime > new Date()) {
            return false;
        }
        this.startTime = PeriodCodeHelper.move(period, this.startTime);
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
                optionsSet++;
            }
            if (PeriodCodeHelper.checkInPast('period_back', config.period_back)) {
                type = 'periodBack'
                optionsSet++;
            }
            if (this.checkFromHourOfDay(config.from_hour_of_day)) {
                type = 'fromHourOfDay';
                optionsSet++;
            }
            if (this.checkTimeWindowRelative(config.from_period_ago, config.to_period_ago)) {
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
                throw new Error('Multiple period types set, use one type: preset-period, period_back, from_hours_of_day, time window, or date options.')
            }
            return new Period(type, useStatistics, statsPeriod, config.preset_period, config.period_back, config.from_hour_of_day, config.from_period_ago,
                config.to_period_ago, fromDate, toDate);
        }
        return undefined;
    }

    static determineActivePeriod(dataPeriod: Period | undefined, buttonsConfig: ButtonsConfig | undefined): Period {
        const activeButton = ButtonsConfig.getActivePeriodSelector(buttonsConfig);
        if (activeButton && dataPeriod) {
            throw new Error('Data_period and active period_selector button configured. Data_period can be removed from config.');
        }
        if (activeButton) {
            return (activeButton as PeriodSelectorButton).period.clone() as Period;
        } else if (dataPeriod) {
            return dataPeriod.clone();
        }
        throw new Error('Data_period or an active period_selector button should be configured.')
    }

    private static checkFromHourOfDay(fromHourOfDay: number | undefined): boolean {
        if (fromHourOfDay && (isNaN(fromHourOfDay) || fromHourOfDay < 0 || fromHourOfDay > 23)) {
            throw new Error('Invalid rom_hour_of_day, should be a number between 0 and 23, hour of the day.');
        } else if (fromHourOfDay != null && fromHourOfDay >= 0) {
            return true
        }
        return false;
    }

    private static checkTimeWindowRelative(fromPeriodAgo: string | undefined, toPeriodAgo: string | undefined): boolean {
        const hasFromHoursAgo = PeriodCodeHelper.check('from_period_ago', fromPeriodAgo);
        const hasToHoursAgo = PeriodCodeHelper.check('to_period_ago', toPeriodAgo);
        const now = new Date();
        if (hasFromHoursAgo && !hasToHoursAgo) {
            throw new Error('WindRoseCard: from_period_ago requires to_period_ago to be set.');
        }
        if (!hasFromHoursAgo && hasToHoursAgo) {
            throw new Error('WindRoseCard: to_period_ago requires from_period_ago to be set.');
        }
        if (hasFromHoursAgo && hasToHoursAgo) {
            const fromDate = PeriodCodeHelper.move(fromPeriodAgo!, now);
            const toDate = PeriodCodeHelper.move(toPeriodAgo!, now);
            if (fromDate >= now) {
                throw new Error('WindRoseCard: from_period_ago should result in a date in the past.');
            }
            if (toDate > now) {
                throw new Error('WindRoseCard: to_period_ago should result in a date in the past or now.');
            }
            if (fromDate >= toDate) {
                throw new Error('WindRoseCard: from_period_ago must be before to_period_ago.');
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
        if (ConfigCheckUtils.checkHasProperty(config, 'hours_to_show')) {
            throw new Error('hours_to_show option is changed to period_back option, see readme "Period code explained".')
        }
        if (ConfigCheckUtils.checkHasProperty(config, 'from_hours_ago')) {
            throw new Error('from_hours_ago option is changed to from_period_ago option, see readme "Period code explained".')
        }
        if (ConfigCheckUtils.checkHasProperty(config, 'to_hours_ago')) {
            throw new Error('to_hours_ago option is changed to to_period_ago option, see readme "Period code explained".')
        }
    }
}
