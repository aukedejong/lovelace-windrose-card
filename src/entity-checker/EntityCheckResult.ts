export class EntityCheckResult {

    constructor(
        readonly entity: string,
        readonly unit: string | undefined,
        readonly error: Error | undefined) {
    }
}