import {HomeAssistant} from "../util/HomeAssistant";
import {HARequestData} from "./HARequestData";

export class HAWebservice {

    constructor(private readonly hass: HomeAssistant) {
    }

    public getMeasurementData(startTime: Date, requestData: HARequestData): Promise<any> {
        if (requestData.useStatistics) {
            return this.getStatistics(startTime, [requestData.entity], requestData.statisticsPeriod!);
        }
        return this.getHistory(startTime, new Date(), [requestData.entity], requestData.attribute !== undefined);
    }

    private getHistory(startTime: Date, endTime: Date, entities: string[], attributes: boolean): Promise<any> {
        if (entities.length === 0) {
            return Promise.resolve({});
        }
        const historyMessage = {
            "type": "history/history_during_period",
            "start_time": startTime,
            "end_time": endTime,
            "minimal_response": !attributes,
            "no_attributes": !attributes,
            "entity_ids": entities
        }
        return this.hass.callWS(historyMessage);
    }

    private getStatistics(startTime: Date, entities: string[], period: string): Promise<any> {
        if (entities.length === 0) {
            return Promise.resolve({});
        }
        const statisticsMessage = {
            "type": "recorder/statistics_during_period",
            "start_time": startTime,
            "period": period,
            "statistic_ids": entities,
            "types":["mean"]
        }
        return this.hass.callWS(statisticsMessage);
    }

}
