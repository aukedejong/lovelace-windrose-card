export class EntityStates {

    constructor(public currentWindDirection: number | undefined,
                public updateWindDirection: boolean) {
    }

    static doNothing(): EntityStates {
        return new EntityStates(undefined, false);
    }
}
