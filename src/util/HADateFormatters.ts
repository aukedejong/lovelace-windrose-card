import { DateFormat, FrontendLocaleData, TimeFormat } from "./HomeAssistant";
import memoizeOne from "memoize-one";
import { timeZonesNames } from "@vvo/tzdb";

// Date formatter code copied from Home Assistant release 20260729.
// To support the specific Home Assistant date and time location settings.
// If there is a way custom cards can use specific HA frontend features/utils, please let me know.

export enum TimeZone {
    local = "local",
    server = "server",
}

const RESOLVED_RAW = Intl.DateTimeFormat?.().resolvedOptions?.().timeZone;

// Some environments (e.g. Android emulator) return a UTC offset like "+00:00"
// instead of an IANA zone name. Only accept values that are known IANA zones,
// matching the list used by ha-timezone-picker.
const RESOLVED_TIME_ZONE =
    RESOLVED_RAW &&
    (RESOLVED_RAW === "UTC" ||
        RESOLVED_RAW === "Etc/UTC" ||
        timeZonesNames.includes(RESOLVED_RAW))
        ? RESOLVED_RAW
        : undefined;

export const HAS_RESOLVED_IANA_TIME_ZONE = RESOLVED_TIME_ZONE !== undefined;

// Browser time zone can be determined from Intl, with fallback to UTC for polyfill or no support.
export const LOCAL_TIME_ZONE = RESOLVED_TIME_ZONE ?? "UTC";

// Pick time zone based on user profile option.  Core zone is used when local cannot be determined.
export const resolveTimeZone = (option: TimeZone, serverTimeZone: string) =>
    option === TimeZone.local && RESOLVED_TIME_ZONE
        ? LOCAL_TIME_ZONE
        : serverTimeZone;


export const formatTime = (
    dateObj: Date,
    locale: FrontendLocaleData,
    timeZone: string
) => formatTimeMem(locale, timeZone).format(dateObj);

const formatTimeMem = memoizeOne(
    (locale: FrontendLocaleData, serverTimeZone: string) =>
        new Intl.DateTimeFormat(locale.language, {
            hour: "numeric",
            minute: "2-digit",
            hourCycle: useAmPm(locale) ? "h12" : "h23",
            timeZone: resolveTimeZone(locale.time_zone, serverTimeZone),
        })
);

export const useAmPm = memoizeOne((locale: FrontendLocaleData): boolean => {
    if (
        locale.time_format === TimeFormat.language ||
        locale.time_format === TimeFormat.system
    ) {
        const testLanguage =
            locale.time_format === TimeFormat.language ? locale.language : undefined;
        const test = new Date("January 1, 2023 22:00:00").toLocaleString(
            testLanguage
        );
        return test.includes("10");
    }

    return locale.time_format === TimeFormat.am_pm;
});

export const formatDateNumeric = (
    dateObj: Date,
    locale: FrontendLocaleData,
    timeZone: string
) => {
    const formatter = formatDateNumericMem(locale, timeZone);

    if (locale.date_format === DateFormat.language || locale.date_format === DateFormat.system) {
        return formatter.format(dateObj);
    }

    const parts = formatter.formatToParts(dateObj);

    const literal = parts.find((value) => value.type === "literal")?.value;
    const day = parts.find((value) => value.type === "day")?.value;
    const month = parts.find((value) => value.type === "month")?.value;
    const year = parts.find((value) => value.type === "year")?.value;

    const lastPart = parts[parts.length - 1];
    let lastLiteral = lastPart?.type === "literal" ? lastPart?.value : "";

    if (locale.language === "bg" && locale.date_format === DateFormat.YMD) {
        lastLiteral = "";
    }

    const formats = {
        [DateFormat.DMY]: `${day}${literal}${month}${literal}${year}${lastLiteral}`,
        [DateFormat.MDY]: `${month}${literal}${day}${literal}${year}${lastLiteral}`,
        [DateFormat.YMD]: `${year}${literal}${month}${literal}${day}${lastLiteral}`,
    };

    return formats[locale.date_format];
};

const formatDateNumericMem = memoizeOne(
    (locale: FrontendLocaleData, serverTimeZone: string) => {
        const localeString =
            locale.date_format === DateFormat.system ? undefined : locale.language;

        if (
            locale.date_format === DateFormat.language ||
            locale.date_format === DateFormat.system
        ) {
            return new Intl.DateTimeFormat(localeString, {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                timeZone: resolveTimeZone(locale.time_zone, serverTimeZone),
            });
        }

        return new Intl.DateTimeFormat(localeString, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            timeZone: resolveTimeZone(locale.time_zone, serverTimeZone),
        });
    }
);

export const formatDateTimeNumeric = (
    dateObj: Date,
    locale: FrontendLocaleData,
    serverTimeZone: string
) =>
    `${formatDateNumeric(dateObj, locale, serverTimeZone)}, ${formatTime(
        dateObj,
        locale,
        serverTimeZone
    )}`;


