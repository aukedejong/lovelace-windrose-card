import {Log2} from "../util/Log2";

export class DegreesCalculator {
    private readonly log = new Log2("DegreesCalculator");
    private compassDegrees = 0;
    private windDirectionDegrees = 0;
    private roseRenderDegrees = 0;
    private windDirectionRenderDegrees = 0;

    constructor(private readonly northOfffset: number,
                private readonly autoRotateByEntity: boolean) {
        this.log.debug("constructor");
        this.updateRenderDegrees();
    }

    private updateRenderDegrees() {
        if (this.autoRotateByEntity) {

            this.roseRenderDegrees = +this.northOfffset + this.compassDegrees;
            this.windDirectionRenderDegrees = -90 + this.northOfffset + this.compassDegrees + this.windDirectionDegrees;

        } else {

            this.roseRenderDegrees = this.northOfffset;
            this.windDirectionRenderDegrees = -90 + this.northOfffset + this.windDirectionDegrees;

        }
        this.log.debug("updateRenderDegrees: Degrees sensor: ", this.windDirectionDegrees, this.compassDegrees)
        this.log.debug("updateRenderDegrees: Degrees for rendering: ", this.roseRenderDegrees, this.windDirectionRenderDegrees);
    }

    getWindDirectionRenderDegrees(): number {
        return this.windDirectionRenderDegrees;
    }

    getRoseRenderDegrees(): number {
        return this.roseRenderDegrees;
    }

    setWindDirectionDegrees(degrees: number) {
        this.log.debug("setWindDirectionDegrees: Set windsensor degrees: " + degrees);
        this.windDirectionDegrees = degrees;
        this.updateRenderDegrees();
    }

    setCompassDegrees(degrees: number) {
        this.compassDegrees = degrees;
        this.updateRenderDegrees();
    }

}
