export class EntityState {

    state: string | undefined;
    updated: boolean;

    constructor(public readonly active: boolean,
                public readonly entity: string | undefined) {
        this.state = undefined;
        this.updated = false;
    }

}
