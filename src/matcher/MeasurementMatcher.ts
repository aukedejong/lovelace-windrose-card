import {DirectionSpeed} from "./DirectionSpeed";
import {Log} from "../util/Log";

export class MeasurementMatcher {

    constructor(private readonly directionData: HistoryData[],
                private readonly speedData: HistoryData[],
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
            const direction = this.findMatchingDirection(speed.lu);
            if (direction) {
                if (direction.s === '' || direction.s === null || isNaN(+direction.s)) {
                    Log.warn("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                } else {
                    matchedData.push(new DirectionSpeed(direction.s, +speed.s));
                }
            } else {
                Log.warn('No matching direction found for speed ' + speed.s + " at timestamp " + speed.lu);
            }
        })
        return matchedData;
    }

    private findMatchingDirection(timestamp: number): HistoryData | undefined {
        const selection = this.directionData.filter(
            (direction) => direction.lu >= timestamp - this.timeDiff && direction.lu <= timestamp + 1);

        if (selection.length == 1) {
            return selection[0];
        } else if (selection.length > 1) {
            selection.sort((a, b) => b.lu - a.lu);
            return selection[0];
        }
        return undefined;
    }


    private matchDirectionLeading(): DirectionSpeed[] {
        const matchedData: DirectionSpeed[] = [];
        this.directionData.forEach((direction) => {
            const speed = this.findMatchingSpeed(direction.lu);
            if (speed) {
                if (speed.s === '' || speed.s === null || isNaN(+speed.s)) {
                    Log.warn("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                } else {
                    matchedData.push(new DirectionSpeed(direction.s, +speed.s));
                }
            } else {
                Log.warn('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
            }
        })
        return matchedData;
    }

    private findMatchingSpeed(timestamp: number): HistoryData | undefined {
        return this.speedData.find(
            (speed) => {
                //console.log(timestamp, speed.lu, '>', timestamp - this.timeDiff, '<', timestamp + this.timeDiff);
                return speed.lu > timestamp - this.timeDiff && speed.lu < timestamp + this.timeDiff
            });
    }

}