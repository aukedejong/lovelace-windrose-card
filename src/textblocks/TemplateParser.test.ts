import {beforeEach, describe, expect, test} from "@jest/globals";
import {TemplateParser} from "./TemplateParser";
import {EntityStatesProcessor} from "../entity-state-processing/EntityStatesProcessor";

describe('TemplateParser', () => {

    let templateParser: TemplateParser;

    beforeEach(() => {
        templateParser = new TemplateParser(new EntityStatesProcessor());
    });


    test('replace ${test} with value', () => {
        templateParser.addOrUpdateValue('test', 'aan');
        templateParser.addOrUpdateValue('e', 'E');
        expect(templateParser.parse('abc${test}d${e}f')).toEqual('abcaandEf');
    });

    test('find entity palceholder', () => {
       const entities = TemplateParser.findEntityPlaceholders(`tes $\{jan} asd $\{sensor.wind-speed} $\{asdf`);

       expect(entities.length).toEqual(1);
       expect(entities[0].entity).toEqual('sensor.wind-speed');
       expect(entities[0].attribute).toBeUndefined();
    });

    test('find entity palceholder with attribute', () => {
        const entities = TemplateParser.findEntityPlaceholders(`tes $\{jan} asd $\{sensor.wind-speed.max} $\{asdf`);

        expect(entities.length).toEqual(1);
        expect(entities[0].entity).toEqual('sensor.wind-speed');
        expect(entities[0].attribute).toEqual('max');
        expect(entities[0].active).toEqual(true);
    });

    test('find entity palceholder, no entite', () => {
        const entities = TemplateParser.findEntityPlaceholders(`tes $\{jan} xx$\{asdf`);

        expect(entities.length).toEqual(0);
    });

});
