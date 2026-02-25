import {TemplateValue} from "./TemplateValue";
import {WindRoseData} from "../renderer/WindRoseData";
import {MatchUtils} from "../matcher/MatchUtils";
import {Measurement} from "../measurement-provider/Measurement";
import {MeasurementHolder} from "../measurement-provider/MeasurementHolder";
import {MatchedMeasurements} from "../matcher/MatchedMeasurements";
import {EntityStatesProcessor} from "../entity-state-processing/EntityStatesProcessor";
import {EntityState} from "../entity-state-processing/EntityState";
import {Period} from "../config/buttons/Period";

export class TemplateParser {

    templateValues: TemplateValue[] = [];

    constructor(private readonly entityStatesProcessor: EntityStatesProcessor) {}

    public clearValues() {
        this.templateValues = [];
    }

    public addPeriodData(period: Period): void {
        this.addOrUpdateValue("start-time", period.startTime.toLocaleTimeString());
        this.addOrUpdateValue("end-time", period.endTime.toLocaleTimeString());
        this.addOrUpdateValue("start-date", period.startTime.toLocaleDateString());
        this.addOrUpdateValue("end-date", period.endTime.toLocaleDateString());
        const minutes = Math.round((period.endTime.getTime() - period.startTime.getTime()) / 60000)
        this.addOrUpdateValue('period-hours', Math.round(minutes / 60));
        this.addOrUpdateValue('period-minutes', minutes);
    }

    public addWindRoseDataValues(windRoseData: WindRoseData): void {
        this.addOrUpdateValue("calm-percentage", Math.round(windRoseData.speedRangePercentages[0]));
    }

    public addMeasurementValues(measurementHolder: MeasurementHolder): void {
        if (measurementHolder.directionMeasurements.length > 0) {
            this.addOrUpdateValue("time-first-direction", MatchUtils.cleanTime(measurementHolder.directionMeasurements[0].startTime));
            this.addOrUpdateValue("time-last-direction", MatchUtils.cleanTime(measurementHolder.directionMeasurements[measurementHolder.directionMeasurements.length - 1].startTime));
            this.addOrUpdateValue("date-first-direction", MatchUtils.cleanDate(measurementHolder.directionMeasurements[0].startTime));
            this.addOrUpdateValue("date-last-direction", MatchUtils.cleanDate(measurementHolder.directionMeasurements[measurementHolder.directionMeasurements.length - 1].startTime));
        }
        this.addOrUpdateValue("direction-count", measurementHolder.directionMeasurements.length);
        measurementHolder.speedMeasurements.forEach((measurements: Measurement[], index: number) => {
            if (measurements.length > 0) {
                this.addOrUpdateValue("time-first-speed-" + index, MatchUtils.cleanTime(measurements[0].startTime));
                this.addOrUpdateValue("time-last-speed-" + index, MatchUtils.cleanTime(measurements[measurements.length - 1].startTime));
                this.addOrUpdateValue("date-first-speed-" + index, MatchUtils.cleanDate(measurements[0].startTime));
                this.addOrUpdateValue("date-last-speed-" + index, MatchUtils.cleanDate(measurements[measurements.length - 1].startTime));
            }
            this.addOrUpdateValue('speed-' + index  + '-count', measurements.length);
        });
    }

    public addMatchedValues(matchedMeasurements: MatchedMeasurements): void {
        this.addOrUpdateValue('match-count', matchedMeasurements.getMeasurementCount());
        this.addOrUpdateValue('min-speed', Math.round(matchedMeasurements.minSpeed));
        this.addOrUpdateValue('max-speed', Math.round(matchedMeasurements.maxSpeed));
        this.addOrUpdateValue('average-speed', Math.round(matchedMeasurements.getAverageSpeed()));
        if (matchedMeasurements.getMeasurementCount() > 0) {
            this.addOrUpdateValue('time-first-match', MatchUtils.cleanTime(matchedMeasurements.firstDateTime));
            this.addOrUpdateValue('date-first-match', MatchUtils.cleanDate(matchedMeasurements.firstDateTime));
            this.addOrUpdateValue('time-last-match', MatchUtils.cleanTime(matchedMeasurements.lastDateTime));
            this.addOrUpdateValue('date-last-match', MatchUtils.cleanDate(matchedMeasurements.lastDateTime));
            const minutes = Math.round((matchedMeasurements.lastDateTime - matchedMeasurements.firstDateTime) / 60)
            this.addOrUpdateValue('match-period-hours', Math.round(minutes / 60));
            this.addOrUpdateValue('match-period-minutes', minutes);
        } else {
            this.addOrUpdateValue('match-period-hours', 0);
            this.addOrUpdateValue('match-period-minutes', 0);
        }
        
        // Statistical wind measures for better weather reporting
        const speeds = matchedMeasurements.getMeasurements().map((m: any) => m.speed).sort((a: number, b: number) => a - b);
        const count = speeds.length;
        
        // Median (50th percentile)
        const median = count % 2 === 0 
            ? (speeds[count/2 - 1] + speeds[count/2]) / 2 
            : speeds[Math.floor(count/2)];
        this.addOrUpdateValue('median-speed', Math.round(median));
        
        // Interquartile range (25th to 75th percentile) - excludes outliers
        const q1Index = Math.floor(count * 0.25);
        const q3Index = Math.floor(count * 0.75);
        const q1 = speeds[q1Index];
        const q3 = speeds[q3Index];
        this.addOrUpdateValue('q1-speed', Math.round(q1));
        this.addOrUpdateValue('q3-speed', Math.round(q3));
        this.addOrUpdateValue('iqr-range', `${Math.round(q1)}-${Math.round(q3)}`);
        
        // 90th percentile for gusts (excludes the highest 10% outliers)
        const p90Index = Math.floor(count * 0.90);
        const p90 = speeds[p90Index];
        this.addOrUpdateValue('p90-speed', Math.round(p90));
        
        // Weather-style description using IQR
        const maxSpeed = Math.round(matchedMeasurements.maxSpeed);
        const gustText = maxSpeed > q3 * 1.3 ? ` gusts to ${maxSpeed}` : '';
        this.addOrUpdateValue('wind-description', `${Math.round(q1)}-${Math.round(q3)}${gustText}`);
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
        // Removed left over placeholders.
        const matches = Array.from(template.matchAll(/\$\{([^}]+)\}/g), m => m[0]);
        for (let placeholder of matches) {
            template = template.replace(placeholder, '');
        }
        return template;
    }

    public static findEntityPlaceholders(template: string | undefined): EntityState[] {
        if (!template) {
            return [];
        }
        const entityStates: EntityState[] = [];
        const matches = Array.from(template.matchAll(/\$\{([^}]+)\}/g), m => m[0]);
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
