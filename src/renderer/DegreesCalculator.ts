import {Log2} from "../util/Log2";

export class DegreesCalculator {
    private readonly log = new Log2("DegreesCalculator");
    private compassDegrees = 0;
    private windDirectionDegrees: number | undefined;
    private windSpeed: number | undefined;
    private roseRenderDegrees = 0;
    private windDirectionRenderDegrees: number | undefined;

    constructor(private readonly northOffset: number,
                private readonly autoRotate: boolean,
                private readonly asHeading: boolean,
                private readonly hideDirectionBelowSpeed: number | undefined) {
        this.log.debug('HideDirectionBelowSpeed: ', hideDirectionBelowSpeed);
        this.updateRenderDegrees();
    }

    private updateRenderDegrees() {
        if (this.autoRotate) {
            if (this.asHeading) {
                this.roseRenderDegrees = +this.northOffset + (360 - this.compassDegrees);
            } else {
                this.roseRenderDegrees = +this.northOffset + this.compassDegrees;
            }

            if (this.windDirectionDegrees === undefined) {
                this.windDirectionRenderDegrees = undefined;
            } else {
                if (this.asHeading) {
                    this.windDirectionRenderDegrees = this.northOffset + (360 - this.compassDegrees) + this.windDirectionDegrees;
                } else {
                    this.windDirectionRenderDegrees = this.northOffset + this.compassDegrees + this.windDirectionDegrees;
                }
            }

        } else {

            this.roseRenderDegrees = this.northOffset;
            if (this.windDirectionDegrees === undefined) {
                this.windDirectionRenderDegrees = undefined;
            } else {
                this.windDirectionRenderDegrees = this.northOffset + this.windDirectionDegrees;
            }

        }
        if (this.hideDirectionBelowSpeed !== undefined && (this.windSpeed === undefined || this.windSpeed <= this.hideDirectionBelowSpeed)) {
            this.windDirectionRenderDegrees = undefined;
        }
        this.log.debug("updateRenderDegrees: Wind speed sensor: ", this.windSpeed);
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

    setWindSpeed(windSpeed: number | undefined) {
        this.windSpeed = windSpeed;
        this.updateRenderDegrees();
    }

    setCompassDegrees(degrees: number) {
        this.compassDegrees = degrees;
        this.updateRenderDegrees();
    }

}
