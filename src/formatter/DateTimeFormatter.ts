import { FrontendLocaleData } from "../util/HomeAssistant";
import { formatDateNumeric, formatDateTimeNumeric, formatTime } from "../util/HADateFormatters";

export class DateTimeFormatter {

    constructor(private readonly locale: FrontendLocaleData,
                private readonly serverTimeZone: string) {
    }

    public formatTimestampTime(timestamp: number): string {
        return this.formatTime(new Date(timestamp * 1000))
    }

    public formatTimestampDate(timestamp: number): string {
        return this.formatDate(new Date(timestamp * 1000))
    }

    public formatTimestampDateTime(timestamp: number): string {
        return this.formatDateTime(new Date(timestamp * 1000))
    }

    public formatTime(date: Date): string {
        return formatTime(date, this.locale, this.serverTimeZone);
    }

    public formatDate(date: Date): string {
        return formatDateNumeric(date, this.locale, this.serverTimeZone);
    }

    public formatDateTime(date: Date): string {
        return formatDateTimeNumeric(date, this.locale, this.serverTimeZone);
    }
}
