export class CompassConfig {

    constructor(
        public readonly autoRotate: boolean,
        public readonly entity: string | undefined,
        public readonly attribute: string | undefined) {
    }

}
