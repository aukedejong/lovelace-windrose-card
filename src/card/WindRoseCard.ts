import {HomeAssistant} from "custom-card-helpers";
import {css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult} from "lit";
import {customElement, query} from "lit/decorators"
import {CardConfigWrapper} from "../config/CardConfigWrapper";
import {CardConfig} from "./CardConfig";
import {Log} from "../util/Log";
import {WindRoseDirigent} from "../renderer/WindRoseDirigent";
import {HomeAssistantMeasurementProvider} from "../measurement-provider/HomeAssistantMeasurementProvider";
import {EntityChecker} from "../entity-checker/EntityChecker";

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'windrose-card',
    name: 'Windrose Card',
    description: 'A card to show wind speed and direction in a windrose.',
});

/* eslint no-console: 0 */
console.info(
    `%c  WINROSE-CARD  %c Version 1.2.0 `,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
);

@customElement('windrose-card')
export class WindRoseCard extends LitElement {

    public static getStubConfig(): Record<string, unknown> {
        return CardConfigWrapper.exampleConfig();
    }

    @query('#windRose') canvas!: HTMLCanvasElement;
    @query('.card-content') parentDiv!: HTMLDivElement;

    windRoseDirigent!: WindRoseDirigent;
    measurementProvider!: HomeAssistantMeasurementProvider;
    entityChecker!: EntityChecker;

    config!: CardConfig;
    cardConfig!: CardConfigWrapper;
    canvasWidth = 400;
    canvasHeight = 400;
    updateInterval: NodeJS.Timer | undefined;
    canvasContext!: CanvasRenderingContext2D;
    _hass!: HomeAssistant;

    constructor() {
        super();
        this.windRoseDirigent = new WindRoseDirigent();
        this.entityChecker = new EntityChecker();
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;
    }

    ro = new ResizeObserver(entries => {
        if (this.cardConfig) {
            for (const entry of entries) {
                Log.trace('ResizeObserver entries:', entries);
                const cs = entry.contentRect;
                this.recalculateCanvasSize(cs.width);
                this.requestUpdate();
                Log.debug("Request update, because of resize.");
            }
        }
    });

    render(): TemplateResult {
        super.render();
        Log.debug('card render()');
        return html`
            <ha-card header="${this.cardConfig?.title}">
                <div class="card-content">
                    <canvas id="windRose"
                            width=${this.canvasWidth}
                            height=${this.canvasHeight}>
                    </canvas>
                </div>
            </ha-card>
        `;
    }

    firstUpdated(): void {
        Log.debug('firstUpdated()');
        this.canvasContext = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        Log.debug('Canvas context found: ', this.canvasContext, this.measurementProvider);
        this.refreshCardConfig();
    }

    update(changedProperties: PropertyValues): void {
        Log.debug('update()');
        super.update(changedProperties);
        this.windRoseDirigent.render(this.canvasContext);
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
        this.ro.observe(this);
        this.initInterval();

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        Log.debug('disconnectedCallback()');
        this.ro.unobserve(this);
        clearInterval(this.updateInterval);

    }

    setConfig(config: any): void {
        this.config = config;
        this.cardConfig = new CardConfigWrapper(config);
        Log.setLevel(this.cardConfig.logLevel);
        Log.debug('setConfig(): ', config, this._hass);

        if (this._hass && this.canvasContext) {
            this.refreshCardConfig();
        }
    }

    getCardSize(): number {
        Log.debug('getCardSize()');
        return 4;
    }

    refreshCardConfig() {
        this.entityChecker.checkEntities(this.cardConfig, this._hass).then(() => {
            this.measurementProvider = new HomeAssistantMeasurementProvider(this.cardConfig);
            this.measurementProvider.setHass(this._hass);
            this.windRoseDirigent.init(this.cardConfig, this.measurementProvider);
            this.recalculateCanvasSize(this.canvas.width);
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

    private recalculateCanvasSize(width: number) {
        const canvasHeight = this.windRoseDirigent.resize(width - 32);
        this.canvas.width = width - 32;
        this.canvas.height = canvasHeight as number;
    }

}
