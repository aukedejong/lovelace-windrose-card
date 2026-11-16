import {describe, expect, test} from "@jest/globals";
import {Period} from "./Period";
import {CardConfigDataPeriod} from "../../card/CardConfigDataPeriod";

describe('Period tests', () => {

    describe('Fixed time window with from_date and to_date', () => {

        const config = {
            from_date: '2026-01-01T00:00:00Z',
            to_date: '2026-01-01T23:00:00Z'
        } as CardConfigDataPeriod;

        test('Active period keeps the configured dates', () => {
            const period = Period.determineActivePeriod(Period.fromConfig(config), undefined);

            expect(period.startTime).toEqual(new Date('2026-01-01T00:00:00Z'));
            expect(period.endTime).toEqual(new Date('2026-01-01T23:00:00Z'));
        });

        test('Recalculating the active period keeps the configured dates', () => {
            const period = Period.determineActivePeriod(Period.fromConfig(config), undefined);
            period.recalculateTimeRange();

            expect(period.startTime).toEqual(new Date('2026-01-01T00:00:00Z'));
            expect(period.endTime).toEqual(new Date('2026-01-01T23:00:00Z'));
        });
    });
});
