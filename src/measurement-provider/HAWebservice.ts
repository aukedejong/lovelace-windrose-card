import {HomeAssistant} from "../util/HomeAssistant";

export class HAWebservice {

    constructor(private readonly hass: HomeAssistant) {
    }

    public getHistory(startTime: Date, endTime: Date, entities: string[], getAttributes: boolean): Promise<any> {
        if (entities.length === 0) {
            return Promise.resolve({});
        }
        const historyMessage = {
            "type": "history/history_during_period",
            "start_time": startTime,
            "end_time": endTime,
            "minimal_response": !getAttributes,
            "no_attributes": !getAttributes,
            "entity_ids": entities
        }
        return this.hass.callWS(historyMessage);
    }

    public getStatistics(startTime: Date, entities: string[]): Promise<any> {
        if (entities.length === 0) {
            return Promise.resolve({});
        }
        const statisticsMessage = {
            "type": "recorder/statistics_during_period",
            "start_time": startTime,
            "period": "5minute",
            "statistic_ids": entities,
            "types":["mean"]
        }
        return this.hass.callWS(statisticsMessage);
    }

}
