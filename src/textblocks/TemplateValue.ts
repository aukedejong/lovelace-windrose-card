export class TemplateValue {

    constructor(public name: string, public value: string) {}

    matchValue(): string {
        return '${' + this.name + '}';
    }
}
