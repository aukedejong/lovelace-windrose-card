import {Log2} from "../util/Log2";

export class DegreesCalculator {
    private readonly log = new Log2("DegreesCalculator");
    private compassDegrees = 0;
    private windDirectionDegrees: number | undefined;
    private roseRenderDegrees = 0;
    private windDirectionRenderDegrees: number | undefined;

    constructor(private readonly northOfffset: number,
                private readonly autoRotate: boolean) {
        this.log.debug("constructor");
        this.updateRenderDegrees();
    }

    private updateRenderDegrees() {
        if (this.autoRotate) {

            this.roseRenderDegrees = +this.northOfffset + this.compassDegrees;
            if (this.windDirectionDegrees === undefined) {
                this.windDirectionRenderDegrees = undefined;
            } else {
                this.windDirectionRenderDegrees = this.northOfffset + this.compassDegrees + this.windDirectionDegrees;
            }

        } else {

            this.roseRenderDegrees = this.northOfffset;
            if (this.windDirectionDegrees === undefined) {
                this.windDirectionRenderDegrees = undefined;
            } else {
                this.windDirectionRenderDegrees = this.northOfffset + this.windDirectionDegrees;
            }

        }
        this.log.debug("updateRenderDegrees: Degrees sensor: ", this.windDirectionDegrees, this.compassDegrees)
        this.log.debug("updateRenderDegrees: Degrees for rendering: ", this.roseRenderDegrees, this.windDirectionRenderDegrees);
    }

    getWindDirectionRenderDegrees(): number | undefined {
        return this.windDirectionRenderDegrees;
    }

    getRoseRenderDegrees(): number {
        return this.roseRenderDegrees;
    }

    setWindDirectionDegrees(degrees: number | undefined) {
        this.log.debug("setWindDirectionDegrees: Set windsensor degrees: " + degrees);
        this.windDirectionDegrees = degrees;
        this.updateRenderDegrees();
    }

    setCompassDegrees(degrees: number) {
        this.compassDegrees = degrees;
        this.updateRenderDegrees();
    }

}
