import {TemplateValue} from "./TemplateValue";
import {WindRoseData} from "../renderer/WindRoseData";
import {MatchUtils} from "../matcher/MatchUtils";
import {Measurement} from "../measurement-provider/Measurement";
import {MeasurementHolder} from "../measurement-provider/MeasurementHolder";
import {MatchedMeasurements} from "../matcher/MatchedMeasurements";
import {EntityStatesProcessor} from "../entity-state-processing/EntityStatesProcessor";
import {EntityState} from "../entity-state-processing/EntityState";

export class TemplateParser {

    templateValues: TemplateValue[] = [];

    constructor(private readonly entityStatesProcessor: EntityStatesProcessor) {}

    public clearValues() {
        this.templateValues = [];
    }

    public addWindRoseDataValues(windRoseData: WindRoseData): void {
        this.addOrUpdateValue("calm-percentage", Math.round(windRoseData.speedRangePercentages[0]));
    }

    public addMeasurementValues(measurementHolder: MeasurementHolder): void {
        this.addOrUpdateValue("time-first-direction", MatchUtils.cleanTime(measurementHolder.directionMeasurements[0].startTime));
        this.addOrUpdateValue("time-last-direction", MatchUtils.cleanTime(measurementHolder.directionMeasurements[measurementHolder.directionMeasurements.length - 1].startTime));
        this.addOrUpdateValue("date-first-direction", MatchUtils.cleanDate(measurementHolder.directionMeasurements[0].startTime));
        this.addOrUpdateValue("date-last-direction", MatchUtils.cleanDate(measurementHolder.directionMeasurements[measurementHolder.directionMeasurements.length - 1].startTime));
        this.addOrUpdateValue("direction-count", measurementHolder.directionMeasurements.length);
        measurementHolder.speedMeasurements.forEach((measurements: Measurement[], index: number) => {
            this.addOrUpdateValue("time-first-speed-" + index, MatchUtils.cleanTime(measurements[0].startTime));
            this.addOrUpdateValue("time-last-speed-" + index, MatchUtils.cleanTime(measurements[measurements.length - 1].startTime));
            this.addOrUpdateValue("date-first-speed-" + index, MatchUtils.cleanDate(measurements[0].startTime));
            this.addOrUpdateValue("date-last-speed-" + index, MatchUtils.cleanDate(measurements[measurements.length - 1].startTime));
            this.addOrUpdateValue('speed-' + index  + '-count', measurements.length);
        });
    }

    public addMatchedValues(matchedMeasurements: MatchedMeasurements): void {
        this.addOrUpdateValue('match-count', matchedMeasurements.getMeasurementCount());
        this.addOrUpdateValue('min-speed', matchedMeasurements.minSpeed);
        this.addOrUpdateValue('max-speed', matchedMeasurements.maxSpeed);
        this.addOrUpdateValue('average-speed', Math.round(matchedMeasurements.getAverageSpeed()));
        this.addOrUpdateValue('time-first-match', MatchUtils.cleanTime(matchedMeasurements.firstDateTime));
        this.addOrUpdateValue('date-first-match', MatchUtils.cleanDate(matchedMeasurements.firstDateTime));
        this.addOrUpdateValue('time-last-match', MatchUtils.cleanTime(matchedMeasurements.lastDateTime));
        this.addOrUpdateValue('date-last-match', MatchUtils.cleanDate(matchedMeasurements.lastDateTime));
        const minutes = Math.round((matchedMeasurements.lastDateTime - matchedMeasurements.firstDateTime) / 60)
        this.addOrUpdateValue('period-hours', Math.round(minutes / 60));
        this.addOrUpdateValue('period-minutes', minutes);
    }

    public addEntityStates(entityStates: EntityState[]) {
        for (const entityState of entityStates) {
            if (entityState.attribute) {
                this.addOrUpdateValue(entityState.entity! + '.' + entityState.attribute, entityState.state + '');
            }
            this.addOrUpdateValue(entityState.entity!, entityState.state + '');
        }
    }

    public addOrUpdateValue(name: string, value: string | number) {
        console.log('Add template value: ', name, value);
        const templateValue = this.templateValues.find((value) => value.name === name);
        if (templateValue) {
            templateValue.value = value + '';
        } else {
            this.templateValues.push(new TemplateValue(name, value + ''));
        }
    }

    public parse(template: string): string {
        this.templateValues.forEach(templateValue => {
            template = template.replace(templateValue.matchValue(), templateValue.value);
        });
        return template;
    }

    public static findEntityPlaceholders(template: string | undefined): EntityState[] {
        if (!template) {
            return [];
        }
        const entityStates: EntityState[] = [];
        const matches = Array.from(template.matchAll(/\$\{([^}]+)\}/g), m => m[0]);
        console.log('Matches: ', matches);
        for (let placeholder of matches) {

            let entity: string;
            let attribute: string | undefined;
            const firstDot = placeholder.indexOf('.');
            if (firstDot > -1) {
                const secondDot = placeholder.indexOf('.', firstDot + 1);
                if (secondDot > -1) {
                    entity = placeholder.substring(2, secondDot);
                    attribute = placeholder.substring(secondDot + 1, placeholder.length - 1);
                } else {
                    entity = placeholder.substring(2, placeholder.length - 1);
                    attribute = undefined;
                }
                entityStates.push(new EntityState(true, entity, attribute));
            }
        }
        return entityStates;
    }

}
