import {DirectionSpeed} from "./DirectionSpeed";
import {Log} from "../util/Log";

export class StatisticsMeasurementMatcher {

    constructor(private readonly directionData: StatisticsData[],
                private readonly speedData: StatisticsData[],
                private readonly timeDiff: number) {
        Log.debug('Matching:', directionData, speedData, timeDiff);
    }

    match(matchingStrategy: string) {
        if (matchingStrategy == 'speed-first') {
            return this.matchSpeedLeading()

        } else if (matchingStrategy === 'direction-first') {
            return this.matchDirectionLeading();
        }
        throw Error('Unkown matchfing strategy: ' + matchingStrategy);
    }

    private matchSpeedLeading(): DirectionSpeed[] {
        const matchedData: DirectionSpeed[] = [];
        this.speedData.forEach((speed) => {
            const direction = this.findMatchingDirection(speed);
            if (direction) {
                if (direction.mean === null || isNaN(+direction.mean)) {
                    Log.warn("Speed " + speed.mean + " at timestamp " + speed.start + " is not a number.");
                } else {
                    matchedData.push(new DirectionSpeed(direction.mean, +speed.mean));
                }
            } else {
                Log.warn('No matching direction found for speed ' + speed.mean + " at timestamp " +
                    speed.start + ' - ' + speed.end);
            }
        })
        return matchedData;
    }

    private findMatchingDirection(speed: StatisticsData): StatisticsData | undefined {
        // const selection = this.directionData.filter(
        //     (direction) => (speed.start > direction.start && speed.start < direction.end)
        //         || (speed.end < direction.end && speed.end > direction.start)
        // );
        // if (selection.length == 1) {
        //     return selection[0];
        // } else if (selection.length > 1) {
        //     selection.sort((a, b) => b.start - a.start);
        //     return selection[0];
        // }
        // return undefined;
        return this.directionData.find((direction) => speed.start === direction.start && speed.end === direction.end);
    }


    private matchDirectionLeading(): DirectionSpeed[] {
        const matchedData: DirectionSpeed[] = [];
        this.directionData.forEach((direction) => {
            const speed = this.findMatchingSpeed(direction);
            if (speed) {
                if (speed.mean === null || isNaN(+speed.mean)) {
                    Log.warn("Speed " + speed.mean + " at timestamp " + speed.start + " is not a number.");
                } else {
                    matchedData.push(new DirectionSpeed(direction.mean, +speed.mean));
                }
            } else {
                Log.warn('No matching speed found for direction ' + direction.mean + " at timestamp " + direction.start);
            }
        })
        return matchedData;
    }

    private findMatchingSpeed(direction: StatisticsData): StatisticsData | undefined {
        // return this.speedData.find(
        //     (speed) => (direction.start > speed.start && direction.start < speed.end)
        //         || (direction.end < speed.end && direction.end > speed.start));
        return this.speedData.find((speed) => speed.start === direction.start && speed.end === direction.end);
    }

}