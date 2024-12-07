import {HomeAssistant} from "../util/HomeAssistant";
import {css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult} from "lit";
import {customElement, query} from "lit/decorators.js"
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CardConfig} from "./CardConfig";
import {Log} from "../util/Log";
import {WindRoseDirigent} from "../renderer/WindRoseDirigent";
import {HomeAssistantMeasurementProvider} from "../measurement-provider/HomeAssistantMeasurementProvider";
import {EntityChecker} from "../entity-checker/EntityChecker";
import {Svg, SVG} from "@svgdotjs/svg.js";
import {EntityStatesProcessor} from "../entity-state-processing/EntityStatesProcessor";
import {Log2} from "../util/Log2";

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'windrose-card',
    name: 'Windrose Card',
    description: 'A card to show wind speed and direction in a windrose.',
});

/* eslint no-console: 0 */
console.info(
    `%c  WINROSE-CARD  %c Version 1.11.7 `,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
);

@customElement('windrose-card')
export class WindRoseCard extends LitElement {

    public static getStubConfig(): Record<string, unknown> {
        return CardConfigWrapper.exampleConfig();
    }
    
    private readonly log = new Log2("WindRoseCard");

    @query('#svg-container') svgContainer!: HTMLElement;
    @query('.card-content') parentDiv!: HTMLDivElement;

    windRoseDirigent!: WindRoseDirigent;
    entityStateProcessor!: EntityStatesProcessor;
    measurementProvider!: HomeAssistantMeasurementProvider;
    entityChecker!: EntityChecker;

    config!: CardConfig;
    refreshCardConfigOnHass = false;
    cardConfig!: CardConfigWrapper;
    updateInterval: NodeJS.Timer | undefined;
    _hass!: HomeAssistant;
    svg: Svg;

    constructor() {
        super();
        this.svg = SVG().height('100%').width('100%');
        this.windRoseDirigent = new WindRoseDirigent(this.svg, this.sendEvent.bind(this));
        this.entityStateProcessor = new EntityStatesProcessor();
        this.entityChecker = new EntityChecker();
    }

    setConfig(config: any): void {
        this.config = config;
        this.cardConfig = new CardConfigWrapper(config);

        Log.setLevel(this.cardConfig.logLevel);
        Log2.setLevel(this.cardConfig.logLevel);
        this.log.debug('setConfig(): ', config, this._hass);

        if (this._hass) { //Later config changes, also refresh.
            this.refreshCardConfig();
        } else {
            this.refreshCardConfigOnHass = true;
        }
    }

    set hass(hass: HomeAssistant) {
        if (this.refreshCardConfigOnHass) {
            Log.debug("hass(), refreshCardConfigOnHass");
            this.refreshCardConfigOnHass = false;
            this._hass = hass;
            this.refreshCardConfig();
        }
        this._hass = hass;
        this.entityStateProcessor.updateHass(hass);
        if (this.entityStateProcessor.hasUpdates()) {
            this.windRoseDirigent.updateRender();
        }
    }

    sendEvent(event: CustomEvent): void {
        this.log.debug("sendEvent()", event);
        this.dispatchEvent(event);
    }

    refreshCardConfig() {
        this.log.debug("refreshCardConfig()");
        try {
            this.entityChecker.checkEntities(this.cardConfig, this._hass);
            this.measurementProvider = new HomeAssistantMeasurementProvider(this.cardConfig);
            this.measurementProvider.setHass(this._hass);
            this.windRoseDirigent.init(this.cardConfig, this.measurementProvider, this.entityStateProcessor);
            this.entityStateProcessor.init(this.cardConfig)
            this.refreshMeasurements();
        } catch(e) {
            Log.error("Error during init: ", e);
            this.svg.remove();
        }
    }

    render(): TemplateResult {
        super.render();
        this.log.debug('card render()');
        return html`
            <ha-card header="${this.cardConfig?.title}">
                <div class="card-content" id="svg-container">
                </div>
            </ha-card>
        `;
    }

    firstUpdated(): void {
        this.log.debug('firstUpdated()');
        this.log.debug('SVG container found: ', this.svgContainer, this.measurementProvider);
        this.svg.addTo(this.svgContainer);
    }

    update(changedProperties: PropertyValues): void {
        this.log.debug('update()');
        super.update(changedProperties);
        this.windRoseDirigent.render();
    }

    private initInterval() {
        this.log.debug('initInterval()');
        if (this.cardConfig && this.updateInterval === undefined) {

            this.updateInterval = setInterval(
                () => this.refreshMeasurements(),this.cardConfig.refreshInterval * 1000);
            this.log.info('Interval running with ' + this.cardConfig.refreshInterval + ' seconds.');
        }
    }

    static get styles(): CSSResultGroup {
        return css`
          :host {
            display: block;
          }`
    }

    connectedCallback() {
        super.connectedCallback();
        this.log.debug('connectedCallBack()');
        this.initInterval();

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.log.debug('disconnectedCallback()');
        clearInterval(this.updateInterval);

    }

    getCardSize(): number {
        this.log.debug('getCardSize()');
        return 9;
    }

    // public getLayoutOptions() {
    //     this.log.debug('getLayoutOptions()');
    //     return {
    //         grid_rows: 8,
    //         grid_columns: 6,
    //         grid_min_rows: 5,
    //     };
    // }


    refreshMeasurements(): void {
        this.windRoseDirigent.refreshData().then((refresh: boolean) => {
            this.log.debug('refreshData() ready, requesting update.');
            if (refresh) {
                this.requestUpdate();
            }
        });
    }

}
