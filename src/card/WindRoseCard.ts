import {HomeAssistant} from "custom-card-helpers";
import {css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult} from "lit";
import {customElement, query} from "lit/decorators"
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CardConfig} from "./CardConfig";
import {Log} from "../util/Log";
import {WindRoseDirigent} from "../renderer/WindRoseDirigent";
import {HomeAssistantMeasurementProvider} from "../measurement-provider/HomeAssistantMeasurementProvider";
import {EntityChecker} from "../entity-checker/EntityChecker";
import Snap from "snapsvg";

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'windrose-card',
    name: 'Windrose Card',
    description: 'A card to show wind speed and direction in a windrose.',
});

/* eslint no-console: 0 */
console.info(
    `%c  WINROSE-CARD  %c Version 1.6.0 `,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
);

@customElement('windrose-card')
export class WindRoseCard extends LitElement {

    public static getStubConfig(): Record<string, unknown> {
        return CardConfigWrapper.exampleConfig();
    }

    @query('#svg-container') svgContainer!: HTMLElement;
    @query('.card-content') parentDiv!: HTMLDivElement;

    windRoseDirigent!: WindRoseDirigent;
    measurementProvider!: HomeAssistantMeasurementProvider;
    entityChecker!: EntityChecker;

    config!: CardConfig;
    cardConfig!: CardConfigWrapper;
    updateInterval: NodeJS.Timer | undefined;
    _hass!: HomeAssistant;
    svg!: Snap.Paper;

    constructor() {
        super();
        this.windRoseDirigent = new WindRoseDirigent();
        this.entityChecker = new EntityChecker();
        this.svg = Snap("100%", "100%");
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;
        const state = this._hass.states["sensor.gorredijk_wind_direction_azimuth"];
        this.windRoseDirigent.update(state.state, this.svg);
    }

    render(): TemplateResult {
        super.render();
        Log.debug('card render()');
        return html`
            <ha-card header="${this.cardConfig?.title}">
                <div class="card-content" id="svg-container">
                </div>
            </ha-card>
        `;
    }

    firstUpdated(): void {
        Log.debug('firstUpdated()');
        Log.debug('SVG container found: ', this.svgContainer, this.measurementProvider);
        this.svgContainer.appendChild(this.svg.node);
        this.refreshCardConfig();
    }

    update(changedProperties: PropertyValues): void {
        Log.debug('update()');
        super.update(changedProperties);
        this.windRoseDirigent.render(this.svg);
    }

    private initInterval() {
        Log.debug('initInterval()');
        if (this.cardConfig && this.updateInterval === undefined) {

            this.updateInterval = setInterval(
                () => this.refreshMeasurements(),this.cardConfig.refreshInterval * 1000);
            Log.info('Interval running with ' + this.cardConfig.refreshInterval + ' seconds.');
        }
    }

    static get styles(): CSSResultGroup {
        return css`
          :host {
            display: block;
          }
          canvas {
            background-color: var(--ha-card-background);
            max-height: var(--chart-max-height);
          }`;
    }

    connectedCallback() {
        super.connectedCallback();
        Log.debug('connectedCallBack()');
        //this.ro.observe(this);
        this.initInterval();

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        Log.debug('disconnectedCallback()');
        clearInterval(this.updateInterval);

    }

    setConfig(config: any): void {
        this.config = config;
        this.cardConfig = new CardConfigWrapper(config);
        Log.setLevel(this.cardConfig.logLevel);
        Log.debug('setConfig(): ', config, this._hass);

        if (this._hass && this.svg) {
            this.refreshCardConfig();
        }
    }

    getCardSize(): number {
        Log.debug('getCardSize()');
        return 9;
    }

    // public getLayoutOptions() {
    //     Log.debug('getLayoutOptions()');
    //     return {
    //         grid_rows: 8,
    //         grid_columns: 6,
    //         grid_min_rows: 5,
    //     };
    // }

    refreshCardConfig() {
        this.entityChecker.checkEntities(this.cardConfig, this._hass).then(() => {
            this.measurementProvider = new HomeAssistantMeasurementProvider(this.cardConfig);
            this.measurementProvider.setHass(this._hass);
            this.windRoseDirigent.init(this.cardConfig, this.measurementProvider);
            this.refreshMeasurements();
        });
    }

    refreshMeasurements(): void {
        this.windRoseDirigent.refreshData().then((refresh: boolean) => {
            Log.debug('refreshData() ready, requesting update.');
            if (refresh) {
                this.requestUpdate();
            }
        });
    }

}
