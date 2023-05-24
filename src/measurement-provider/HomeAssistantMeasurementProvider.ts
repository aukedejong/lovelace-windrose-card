import {MeasurementProvider} from "./MeasurementProvider";
import {HomeAssistant} from "custom-card-helpers";
import {DirectionSpeed} from "../matcher/DirectionSpeed";
import {Log} from "../util/Log";
import {MeasurementMatcher} from "../matcher/MeasurementMatcher";
import {CardConfigWrapper} from "../config/CardConfigWrapper";

export class HomeAssistantMeasurementProvider implements MeasurementProvider {

    private hass!: HomeAssistant;
    private cardConfig!: CardConfigWrapper

    setHass(hass: HomeAssistant): void {
        this.hass = hass;
    }

    setCardConfig(cardConfig: CardConfigWrapper): void {
        this.cardConfig = cardConfig;
    }

    getMeasurements(): Promise<DirectionSpeed[][]> {
        Log.debug('getMeasurements()');
        if (this.hass === undefined) {
            Log.error('Cant read measurements, HASS not set.');
            return Promise.resolve([]);
        }
        return this.getHistory().then((history: any) => {
            const directionData = history[this.cardConfig.windDirectionEntity];
            const directionSpeedData: DirectionSpeed[][] = [];
            for (let speedEntity of this.cardConfig.windspeedEntities) {
                const speedData = history[speedEntity.entity];
                const directionSpeeds = new MeasurementMatcher(directionData, speedData,
                    this.cardConfig.directionSpeedTimeDiff).match(this.cardConfig.matchingStrategy);
                directionSpeedData.push(directionSpeeds);
            }
            return Promise.resolve(directionSpeedData);
        });
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
            "entity_ids": this.cardConfig.entities
        }
        return this.hass.callWS(historyMessage);
    }
}