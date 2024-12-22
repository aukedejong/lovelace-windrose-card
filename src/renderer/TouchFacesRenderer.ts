import {DimensionConfig} from "./DimensionConfig";
import {Element, Svg} from "@svgdotjs/svg.js";
import {WindRoseDimensionCalculator} from "./WindRoseDimensionCalculator";
import {SvgUtil} from "./SvgUtil";
import {CardConfigActions} from "../card/CardConfigActions";
import {CardConfigAction} from "../card/CardConfigAction";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CardConfigHaAction} from "../card/CardConfigHaAction";
import {CircleCoordinate} from "./CircleCoordinate";
import {WindBarDimensionCalculator} from "./WindBarDimensionCalculator";

export class TouchFacesRenderer {

    private readonly cardConfig: CardConfigWrapper;
    private readonly roseDimensionCalculator: WindRoseDimensionCalculator;
    private readonly barDimensionCalculator: WindBarDimensionCalculator;
    private readonly sendEvent: (event: CustomEvent) => void
    private svgUtil!: SvgUtil;
    private actionsConfig: CardConfigActions | undefined;

    constructor(cardConfig: CardConfigWrapper,
                dimensionConfig: DimensionConfig,
                sendEvent: (event: CustomEvent) => void,
                svg: Svg) {

        this.cardConfig = cardConfig;
        this.roseDimensionCalculator = new WindRoseDimensionCalculator(dimensionConfig);
        this.barDimensionCalculator = new WindBarDimensionCalculator(dimensionConfig);
        this.sendEvent = sendEvent;
        this.svgUtil = new SvgUtil(svg);
        this.actionsConfig = this.cardConfig.actions;
    }

    renderTouchFaces() {
        if (this.actionsConfig === undefined) {
            return;
        }
        const radius = this.roseDimensionCalculator.cfg.roseRadius;
        const center = this.roseDimensionCalculator.roseCenter();
        if (this.actionsConfig.top_left) {
            const topLeftCorner = this.svgUtil.drawTriangle(0, 0, center.x, 0, 0, center.y);
            topLeftCorner.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.top_left, topLeftCorner);
        }
        if (this.actionsConfig.top_right) {
            const topRightCorner = this.svgUtil.drawTriangle(center.x, 0, center.x * 2, 0, center.x * 2, center.y);
            topRightCorner.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.top_right, topRightCorner);
        }
        if (this.actionsConfig.bottom_left) {
            const bottomLeftCorner = this.svgUtil.drawTriangle(0, center.y, center.x, center.y * 2, 0, center.y * 2);
            bottomLeftCorner.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.bottom_left, bottomLeftCorner);
        }
        if (this.actionsConfig.bottom_right) {
            const bottomRightCorner = this.svgUtil.drawTriangle(center.x, center.y * 2, center.x * 2, center.y * 2, center.x * 2, center.y);
            bottomRightCorner.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.bottom_right, bottomRightCorner);
        }
        if (this.actionsConfig.windrose) {
            const windrose = this.svgUtil.drawCircle(new CircleCoordinate(center, radius));
            windrose.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.windrose, windrose);
        }

        if (this.actionsConfig.speed_bar_1) {
            if (this.cardConfig.windspeedBarLocation === 'bottom') {
                const barRect = this.barDimensionCalculator.touchFaceBarBottom(0);
                const rect = this.svgUtil.drawRect(barRect);
                rect.attr({ fill: "transparent", cursor: "pointer" });
                this.addEventHandler(this.actionsConfig.speed_bar_1, rect);

            } else if (this.cardConfig.windspeedBarLocation === 'right') {
                const barRect = this.barDimensionCalculator.touchFaceBarRight(0);
                const rect = this.svgUtil.drawRect(barRect);
                rect.attr({ fill: "transparent", cursor: "pointer" });
                this.addEventHandler(this.actionsConfig.speed_bar_1, rect);
            }
        }
        if (this.actionsConfig.speed_bar_2) {
            if (this.cardConfig.windspeedBarLocation === 'bottom') {
                const barRect = this.barDimensionCalculator.touchFaceBarBottom(1);
                const rect = this.svgUtil.drawRect(barRect);
                rect.attr({ fill: "transparent", cursor: "pointer" });
                this.addEventHandler(this.actionsConfig.speed_bar_2, rect);

            } else if (this.cardConfig.windspeedBarLocation === 'right') {
                const barRect = this.barDimensionCalculator.touchFaceBarRight(1);
                const rect = this.svgUtil.drawRect(barRect);
                rect.attr({ fill: "transparent", cursor: "pointer" });
                this.addEventHandler(this.actionsConfig.speed_bar_2, rect);
            }
        }
    }

    private addEventHandler(actionConfig: CardConfigAction, svgElement: Element) {
        if (actionConfig.tap_action) {
            svgElement.click(this.createTapEventFunction(actionConfig.tap_action));
        }
        if (actionConfig.double_tap_action) {
            svgElement.dblclick(this.createDoubleTapEventFunction(actionConfig.double_tap_action));
        }
    }

    createTapEventFunction(haAction: CardConfigHaAction): () => void {
        const actionObj = {
            action: haAction.action,
            navigation_path: haAction.navigation_path,
            url_path: haAction.url_path,
            perform_action: haAction.perform_action,
            data: haAction.data,
            target: haAction.target,
            conformation: haAction.confirmation,
            pipeline_id: haAction.pipeline_id
        }
        const event = new CustomEvent("hass-action", {
            bubbles: true,
            composed: true,
            detail: {
                action: 'tap',
                config: {
                    entity: haAction.entity,
                    tap_action: actionObj
                }
            }
        });
        return () => {
            this.sendEvent(event);
        }
    }

    createDoubleTapEventFunction(haAction: CardConfigHaAction): () => void {
        const actionObj = {
            action: haAction.action,
            navigation_path: haAction.navigation_path,
            url_path: haAction.url_path,
            perform_action: haAction.perform_action,
            data: haAction.data,
            target: haAction.target,
            conformation: haAction.confirmation,
            pipeline_id: haAction.pipeline_id
        }
        const event = new CustomEvent("hass-action", {
            bubbles: true,
            composed: true,
            detail: {
                action: 'double_tap',
                config: {
                    entity: haAction.entity,
                    double_tap_action: actionObj
                }
            }
        });
        return () => {
            this.sendEvent(event);
        }
    }
}
