import SVG, {Element} from "@svgdotjs/svg.js";
import {SvgUtil} from "./SvgUtil";
import {CardConfigActions} from "../card/CardConfigActions";
import {CardConfigAction} from "../card/CardConfigAction";
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CardConfigHaAction} from "../card/CardConfigHaAction";
import {CircleCoordinate} from "./CircleCoordinate";
import {DimensionCalculator} from "../dimensions/DimensionCalculator";

export class TouchFacesRenderer {

    private readonly cardConfig: CardConfigWrapper;
    private readonly dimensionCalculator: DimensionCalculator;
    private readonly sendEvent: (event: CustomEvent) => void
    private svgUtil!: SvgUtil;
    private actionsConfig: CardConfigActions | undefined;
    private touchFacesGroup!: SVG.G;

    constructor(cardConfig: CardConfigWrapper,
                dimensionCalculator: DimensionCalculator,
                sendEvent: (event: CustomEvent) => void,
                svgUtil: SvgUtil) {

        this.cardConfig = cardConfig;
        this.dimensionCalculator = dimensionCalculator;
        this.sendEvent = sendEvent;
        this.svgUtil = svgUtil;
        this.actionsConfig = this.cardConfig.actions;
    }

    renderTouchFaces() {
        if (this.actionsConfig === undefined) {
            return;
        }
        if (this.touchFacesGroup) {
            this.touchFacesGroup.remove();
        }
        this.touchFacesGroup = this.svgUtil.createGroup();
        const radius = this.dimensionCalculator.roseRadius;
        const center = this.dimensionCalculator.roseCenter();
        if (this.actionsConfig.top_left) {
            const topLeftCorner = this.svgUtil.drawTriangle(0, 0, center.x, 0, 0, center.y);
            topLeftCorner.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.top_left, topLeftCorner);
            this.touchFacesGroup.add(topLeftCorner);
        }
        if (this.actionsConfig.top_right) {
            const topRightCorner = this.svgUtil.drawTriangle(center.x, 0, center.x * 2, 0, center.x * 2, center.y);
            topRightCorner.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.top_right, topRightCorner);
            this.touchFacesGroup.add(topRightCorner);
        }
        if (this.actionsConfig.bottom_left) {
            const bottomLeftCorner = this.svgUtil.drawTriangle(0, center.y, center.x, center.y * 2, 0, center.y * 2);
            bottomLeftCorner.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.bottom_left, bottomLeftCorner);
            this.touchFacesGroup.add(bottomLeftCorner);
        }
        if (this.actionsConfig.bottom_right) {
            const bottomRightCorner = this.svgUtil.drawTriangle(center.x, center.y * 2, center.x * 2, center.y * 2, center.x * 2, center.y);
            bottomRightCorner.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.bottom_right, bottomRightCorner);
            this.touchFacesGroup.add(bottomRightCorner);
        }
        if (this.actionsConfig.windrose) {
            const windrose = this.svgUtil.drawCircle(new CircleCoordinate(center, radius));
            windrose.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.windrose, windrose);
            this.touchFacesGroup.add(windrose);
        }

        if (this.actionsConfig.speed_bar_1) {
            const barRect = this.dimensionCalculator.touchFaceBar(0);
            const rect = this.svgUtil.drawRect(barRect);
            rect.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.speed_bar_1, rect);
            this.touchFacesGroup.add(rect);
        }
        if (this.actionsConfig.speed_bar_2) {
            const barRect = this.dimensionCalculator.touchFaceBar(1);
            const rect = this.svgUtil.drawRect(barRect);
            rect.attr({ fill: "transparent", cursor: "pointer" });
            this.addEventHandler(this.actionsConfig.speed_bar_2, rect);
            this.touchFacesGroup.add(rect);
        }
    }

    private addEventHandler(actionConfig: CardConfigAction, svgElement: Element) {
        if (actionConfig.tap_action) {
            svgElement.click(this.createTapEventFunction(actionConfig.tap_action));
        }
        if (actionConfig.double_tap_action) {
            svgElement.dblclick(this.createDoubleTapEventFunction(actionConfig.double_tap_action));
        }
        if (actionConfig.hold_action) {
            let holdTimer: NodeJS.Timeout;
            svgElement.mousedown(() => {
                holdTimer = setTimeout(this.createHoldEventFunction(actionConfig.hold_action!), 500);
            });
            svgElement.mouseup(() => {
                clearTimeout(holdTimer);
            });
            svgElement.touchstart(() => {
                holdTimer = setTimeout(this.createHoldEventFunction(actionConfig.hold_action!), 500);
            });
            svgElement.touchend(() => {
                clearTimeout(holdTimer);
            });
        }
    }

    createTapEventFunction(haAction: CardConfigHaAction): () => void {
        const actionObj = this.createActionObject(haAction);
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
        const actionObj = this.createTapEventFunction(haAction);
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

    createHoldEventFunction(haAction: CardConfigHaAction): () => void {
        const actionObj = this.createActionObject(haAction);
        const event = new CustomEvent("hass-action", {
            bubbles: true,
            composed: true,
            detail: {
                action: 'hold',
                config: {
                    entity: haAction.entity,
                    hold_action: actionObj
                }
            }
        });
        return () => {
            this.sendEvent(event);
        }
    }


    private createActionObject(haAction: CardConfigHaAction): any {
        return {
            action: haAction.action,
            navigation_path: haAction.navigation_path,
            url_path: haAction.url_path,
            perform_action: haAction.perform_action,
            data: haAction.data,
            target: haAction.target,
            conformation: haAction.confirmation,
            pipeline_id: haAction.pipeline_id
        }
    }
}
