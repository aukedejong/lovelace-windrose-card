import { HomeAssistant } from "../util/HomeAssistant";
import { HARequestData } from "./HARequestData";

export class HAWebservice {

    constructor(private hass: HomeAssistant) {
    }

    public updateHass(hass: HomeAssistant): void {
      //Home Assistant hands the card a new hass object on every state change, without this the service would keep reading states from the first snapshot and the forecast would never refresh 
      // (history is unaffected because callWS goes over the persistent connection).
      this.hass = hass;
    }

    public getMeasurementData(startTime: Date, endTime: Date, requestData: HARequestData): Promise<any> {
        if (requestData.useForecast) {
            return this.getForecast(requestData);
        }
        if (requestData.useStatistics) {
            return this.getStatistics(startTime, endTime, [requestData.entity], requestData.statisticsPeriod!, requestData.statisticsType!);
        }
        return this.getHistory(startTime, endTime, [requestData.entity], requestData.attribute !== undefined);
    }

    private getForecast(req: HARequestData): Promise<any> {
        const data = this.hass.states[req.entity]?.attributes?.[req.attribute!];
        return Promise.resolve({ [req.entity]: Array.isArray(data) ? data : [] });
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

    private getStatistics(startTime: Date, endTime: Date, entities: string[], period: string, type: string): Promise<any> {
        if (entities.length === 0) {
            return Promise.resolve({});
        }
        const statisticsMessage = {
            "type": "recorder/statistics_during_period",
            "start_time": startTime,
            "end_time": endTime,
            "period": period,
            "statistic_ids": entities,
            "types":[type]
        }
        return this.hass.callWS(statisticsMessage);
    }

}
