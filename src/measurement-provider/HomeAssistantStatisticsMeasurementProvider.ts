import {MeasurementProvider} from "./MeasurementProvider";
import {HomeAssistant} from "custom-card-helpers";
import {DirectionSpeed} from "../matcher/DirectionSpeed";
import {Log} from "../util/Log";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {StatisticsMeasurementMatcher} from "../matcher/StatisticsMeasurementMatcher";

export class HomeAssistantStatisticsMeasurementProvider implements MeasurementProvider {

    private hass!: HomeAssistant;
    private cardConfig!: CardConfigWrapper
    private windSpeedEntities!: string[];

    setHass(hass: HomeAssistant): void {
        this.hass = hass;
    }

    setCardConfig(cardConfig: CardConfigWrapper): void {
        this.cardConfig = cardConfig;
        this.windSpeedEntities = this.cardConfig.windspeedEntities.map((config) => config.entity);
    }

    getMeasurements(): Promise<DirectionSpeed[][]> {
        Log.debug('getMeasurements()');
        if (this.hass === undefined) {
            Log.error('Cant read measurements, HASS not set.');
            return Promise.resolve([]);
        }
        return this.getStatistics().then((stats: any) => {
            const directionData = stats[this.cardConfig.windDirectionEntity];
            const directionSpeedData: DirectionSpeed[][] = [];
            for (let speedEntity of this.cardConfig.windspeedEntities) {
                const speedData = stats[speedEntity.entity];
                const directionSpeeds = new StatisticsMeasurementMatcher(directionData, speedData,
                    this.cardConfig.directionSpeedTimeDiff).match(this.cardConfig.matchingStrategy);
                directionSpeedData.push(directionSpeeds);
            }
            return Promise.resolve(directionSpeedData);
        })
        // return Promise.all([this.getHistory(), this.getStatistics()]).then<any, any>((results: any[]) => {
        //     console.log('Results', results);
        //     const directionData = results[0][this.cardConfig.windDirectionEntity];
        //     const statistics = results[1][this.cardConfig.windspeedEntities[0].entity].map(
        //         (data: any) => {
        //             return { lu: data.start / 1000, s: data.mean };
        //         });
        //
        //     const directionSpeedData = new MeasurementMatcher(directionData, statistics,
        //         this.cardConfig.directionSpeedTimeDiff).match(this.cardConfig.matchingStrategy);
        //     return Promise.resolve(directionSpeedData);
        // });
    }

    private getHistory(): Promise<any> {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - this.cardConfig.hoursToShow);
        const endTime = new Date();

        const historyMessage = {
            "type": "history/history_during_period",
            "start_time": startTime,
            "end_time": endTime,
            "minimal_response": true,
            "no_attributes": true,
            "entity_ids": [this.cardConfig.windDirectionEntity]
        }
        return this.hass.callWS(historyMessage);
    }

    private getStatistics(): Promise<any> {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - this.cardConfig.hoursToShow);

        const statisticsMessage = {
            "type": "recorder/statistics_during_period",
            "start_time": startTime,
            "period": "5minute",
            "statistic_ids": this.cardConfig.entities,
            "types":["mean"]
        }
        return this.hass.callWS(statisticsMessage);
    }

//{"type":"recorder/get_statistics_metadata","statistic_ids":["sensor.gorredijk_wind_speed"],"id":39}
//{"id":39,"type":"result","success":true,"result":[{"statistic_id":"sensor.gorredijk_wind_speed","display_unit_of_measurement":"km/h","has_mean":true,"has_sum":false,"name":null,"source":"recorder","statistics_unit_of_measurement":"km/h","unit_class":"speed"}]}

//{"type":"recorder/statistics_during_period",
//    "start_time":"2023-05-18T12:49:03.334Z",
//    "statistic_ids":["sensor.gorredijk_wind_speed"],
//    "period":"hour","units":{"speed":"km/h"},"" +
//"types":["mean"],
//    "id":40}

//{"id":40,"type":"result","success":true,
//    "result":{
//    "sensor.gorredijk_wind_speed":[
//        {"start":1684411200000,"end":1684414800000,"mean":17.352443846416666},{"start":1684414800000,"end":1684418400000,"mean":20.53593862752778},{"start":1684418400000,"end":1684422000000,"mean":20.71880477527778},{"start":1684422000000,"end":1684425600000,"mean":20.997817735638886},{"start":1684425600000,"end":1684429200000,"mean":21.115811130055555},{"start":1684429200000,"end":1684432800000,"mean":21.41996640638889},{"start":1684432800000,"end":1684436400000,"mean":20.846127971472217},{"start":1684436400000,"end":1684440000000,"mean":17.49425737383333},{"start":1684440000000,"end":1684443600000,"mean":12.879641475249999},{"start":1684443600000,"end":1684447200000,"mean":10.649157613000002},{"start":1684447200000,"end":1684450800000,"mean":9.049855337277776},{"start":1684450800000,"end":1684454400000,"mean":9.366435280694445},{"start":1684454400000,"end":1684458000000,"mean":10.66610831811111},{"start":1684458000000,"end":1684461600000,"mean":9.800491883916665},{"start":1684461600000,"end":1684465200000,"mean":9.002469194888889},{"start":1684465200000,"end":1684468800000,"mean":7.753358500166667},{"start":1684468800000,"end":1684472400000,"mean":8.330760083861112},{"start":1684472400000,"end":1684476000000,"mean":8.395290269194444},{"start":1684476000000,"end":1684479600000,"mean":10.231359913472224},{"start":1684479600000,"end":1684483200000,"mean":10.116534930138892},{"start":1684483200000,"end":1684486800000,"mean":13.650319679},{"start":1684486800000,"end":1684490400000,"mean":15.864678898138889},{"start":1684490400000,"end":1684494000000,"mean":18.829825902388887},{"start":1684494000000,"end":1684497600000,"mean":21.791481057861116},{"start":1684497600000,"end":1684501200000,"mean":20.405650134805555}]}}
}