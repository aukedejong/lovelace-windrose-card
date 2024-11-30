import {CornerInfo} from "./CornerInfo";
import {CardConfigCorners} from "../card/CardConfigCorners";
import {CardConfigCornerInfo} from "../card/CardConfigCornerInfo";

export class CornersInfo {

    constructor(
        readonly topLeftInfo: CornerInfo,
        readonly topRightInfo: CornerInfo,
        readonly bottomLeftInfo: CornerInfo,
        readonly bottomRightInfo: CornerInfo) {
    }

    public isCornerInfoSet() {
        return this.topLeftInfo?.show || this.topRightInfo?.show || this.bottomLeftInfo?.show || this.bottomRightInfo?.show;
    }

    public static create(config: CardConfigCorners): CornersInfo {
        if (config === undefined || config === null) {
            return this.createAllDisabled();
        }
        return new CornersInfo(
            this.checkCornerInfo(config.top_left),
            this.checkCornerInfo(config.top_right),
            this.checkCornerInfo(config.bottom_left),
            this.checkCornerInfo(config.bottom_right)
        );
    }

    public static createAllDisabled(): CornersInfo {
        const cornerInfo = new CornerInfo();
        return new CornersInfo(
            cornerInfo,
            cornerInfo,
            cornerInfo,
            cornerInfo
        );
    }

    public static checkCornerInfo(cornerInfoConfig: CardConfigCornerInfo | undefined): CornerInfo {
        const defaultColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color');
        const info = new CornerInfo();
        info.entity = cornerInfoConfig?.entity;
        info.color = cornerInfoConfig?.color === undefined ? defaultColor : cornerInfoConfig.color;
        info.labelTextSize = cornerInfoConfig?.label_text_size === undefined ? 50 : cornerInfoConfig.label_text_size;
        info.valueTextSize = cornerInfoConfig?.value_text_size === undefined ? 80 : cornerInfoConfig.value_text_size;
        info.label = cornerInfoConfig?.label;
        info.unit = cornerInfoConfig?.unit;
        if (info.entity || info.label) {
            info.show = true;
        }
        return info;
    }
}
