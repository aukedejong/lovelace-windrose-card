export class EntityStates {

    constructor(public currentWindDirection: number | undefined,
                public updatedWindDirection: boolean) {
    }

    static doNothing(): EntityStates {
        return new EntityStates(undefined, false);
    }
}
